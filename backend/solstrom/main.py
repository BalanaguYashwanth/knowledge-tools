import re
import os
import json
import time
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client.models import PayloadSchemaType
from qdrant_client import QdrantClient, models
from langchain_openrouter import ChatOpenRouter
from qdrant_client.http.models import Distance, VectorParams
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from typing import Literal, Annotated, TypedDict, Optional
from datetime import date

load_dotenv()
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Alternatives: baai/bge-base-en-v1.5 (768), nvidia/nemotron-3-embed-1b:free
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-minilm-l6-v2")
EMBEDDING_DIMENSION = int(os.getenv("EMBEDDING_DIMENSION", "384"))
QDRANT_COLLECTION_NAME = os.getenv("QDRANT_COLLECTION_NAME", "solstom_minilm")
EMBED_BATCH_SIZE = int(os.getenv("EMBED_BATCH_SIZE", "10"))

client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
    cloud_inference=True,
    timeout=120,
)

model = ChatOpenRouter(
        model="openrouter/free",
        temperature=0.8
    )

# OpenAI-compatible embeddings via OpenRouter — uses your existing OPENROUTER_API_KEY.
# check_embedding_ctx_length=False is required for non-OpenAI models (send raw text, not tiktoken ids).
embedding_model = OpenAIEmbeddings(
    model=EMBEDDING_MODEL,
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
    chunk_size=EMBED_BATCH_SIZE,
    check_embedding_ctx_length=False,
)

def create_data_into_quadrant():
    if client.collection_exists(QDRANT_COLLECTION_NAME):
        print(f"Deleting existing collection {QDRANT_COLLECTION_NAME}...")
        client.delete_collection(QDRANT_COLLECTION_NAME)

    client.create_collection(
        collection_name=QDRANT_COLLECTION_NAME,
        vectors_config=VectorParams(size=EMBEDDING_DIMENSION, distance=Distance.COSINE)
    )

    # TODO: hardcoded old path — update to current project path or use relative path
    with open("/Users/yashwanth/other-projects/AI_ML/solstrom_youtube-chatbot/backend/data/ideas_v2.json") as f:
        datas = json.load(f)

    documents = []
    for data in datas:
        document = Document(
            page_content=f"""
                Title: {data.get("title")}
                Description: {data.get("description")}
                Problem: {data.get("problem")}
                Solution: {data.get("solution")}
                Resources: {data.get("resources")}
            """,
            metadata={
                "difficulty_level": data.get("difficulty_level"),
                "difficulty_score": data.get("difficulty_score"),
                "categories": data.get("categories"),
                "author_names": data.get("author_names"),
                "published": data.get("published")
            }
        )

        documents.append(document)

    vector_store = QdrantVectorStore(
        client=client,
        collection_name=QDRANT_COLLECTION_NAME,
        embedding=embedding_model
    )

    vector_store.add_documents(documents)

def create_index():

    client.create_payload_index(
        collection_name=QDRANT_COLLECTION_NAME,
        field_name='metadata.published',
        field_schema=PayloadSchemaType.KEYWORD
    )

    client.create_payload_index(
        collection_name=QDRANT_COLLECTION_NAME,
        field_name='medata.difficulty_level',  # TODO: typo — should be metadata.difficulty_level
        field_schema=PayloadSchemaType.KEYWORD
    )

    client.create_payload_index(
        collection_name=QDRANT_COLLECTION_NAME,
        field_name="metadata.difficulty_score",
        field_schema=PayloadSchemaType.INTEGER,
    )

    client.create_payload_index(
        collection_name=QDRANT_COLLECTION_NAME,
        field_name="metadata.difficulty_level",
        field_schema=PayloadSchemaType.KEYWORD,
    )

    client.create_payload_index(
        collection_name=QDRANT_COLLECTION_NAME,
        field_name="metadata.categories",
        field_schema=PayloadSchemaType.KEYWORD
    )

# TODO: do not run ingestion on import — only when executing this file as a script
if __name__ == "__main__":
    create_data_into_quadrant()
    create_index()

class Idea(BaseModel):
    title: str = Field(description="Title of the idea")
    summary: str = Field(description="Summary of the idea")

class Ideas(BaseModel):
    ideas: list[Idea] = Field(description="List of ideas")

class OutputFromUserQuery(TypedDict):
    query: Annotated[Optional[str], "User query to do schematic search in vector db"]
    categories: Annotated[Optional[list[Literal["DAOs and Communities", "Consumer dApps",  "NFTs", "DeFi", "Infrastructure", "Payments", "AI", "DePIN"]]], "List of categories"]
    difficulty_level: Annotated[Optional[Literal["Easy", "Advanced"]],"Difficulty level of the problem & idea & execution"]
    difficulty_score: Annotated[Optional[int],"Difficulty score of problem & idea & execution"]
    published: Annotated[Optional[date],"Published date of the given problem & idea"]

vector_store = QdrantVectorStore(
    client=client,
    collection_name=QDRANT_COLLECTION_NAME,
    embedding=embedding_model
)

def process_user_query(user_query: str) -> dict:
    template = ChatPromptTemplate([
        (
            "system",
            "You are an idea finder. Extract only the information mentioned by the user. Do not infer, assume, or hallucinate missing values."
        ),
        (
            "human", "{user_query}"
        )
    ])

    prompt = template.invoke({"user_query": user_query})
    structured_llm = model.with_structured_output(OutputFromUserQuery)
    result = structured_llm.invoke(prompt) or {}
    query = ''
    should_filter = []
    must_filter = []
    print('--query--result----\n', result)
    for key, value in result.items():
        if not value:
            continue
        if key in ['query']:
            query = value
            continue
        if key in ['categories']:
            for category in result[key]:
                should_filter.append(
                    models.FieldCondition(
                        key='metadata.categories',
                        match=models.MatchValue(value=category)
                    )
                )
        else:
            must_filter.append(
                models.FieldCondition(
                    key='metadata.' + key,
                    match=models.MatchValue(value=value)
                )
            )

    # TODO: default query fallback when LLM returns empty query string
    if not query:
        query = user_query
    print('--filters--\n', should_filter, must_filter)
    retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={
        "k": 2,
        "filter": models.Filter(
            must=must_filter,
            should=should_filter
        )
    })
    contents = retriever.invoke(query)
    result_json = []
    summary = []
    content = "Not found any data for the given query"
    if len(contents) > 0:
        for content in contents:
            page_content = content.page_content
            # TODO: regex parsing is fragile — store structured fields in Qdrant payload instead
            result_json.append({
                "title": re.search(r"Title:\s*(.*?)\n\s*Description:", page_content, re.S).group(1).strip(),
                "description": re.search(r"Description:\s*(.*?)\n\s*Problem:", page_content, re.S).group(1).strip(),
                "problem": re.search(r"Problem:\s*(.*?)\n\s*Solution:", page_content, re.S).group(1).strip(),
                "solution": re.search(r"Solution:\s*(.*?)\n\s*Resources:", page_content, re.S).group(1).strip(),
                "resources": re.search(r"Resources:\s*(.*)", page_content, re.S).group(1).strip(),
            })

        structured_llm_2 = model.with_structured_output(Ideas)
        prompt_template = ChatPromptTemplate([
            ('system', 'You are helpful assistant. based on the given content, please give a detailed summary as list of ideas with title and summary'),
            ('human', 'here is the query {query} and contents {content}')
        ])

        prompt = prompt_template.invoke({'query': query, 'content': contents})
        summary = structured_llm_2.invoke(prompt)

    return {
        "category": "ideas",
        "content": content,
        "query": query,
        "filters": {k: v for k, v in result.items() if v},
        "ideas": result_json,
        "summary": summary.model_dump() if hasattr(summary, "model_dump") else summary,
    }

