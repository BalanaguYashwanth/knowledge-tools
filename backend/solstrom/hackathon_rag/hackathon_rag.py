import re
from langchain_core.prompts import ChatPromptTemplate
from typing_extensions import cast, Any
from langchain_openrouter import ChatOpenRouter
from .output_parsers import ExtractParams
from qdrant_client import models
from pydantic import BaseModel, Field
from .utils import  create_collection_in_vector_store, create_index_in_vector_store, qdrant_vectorstore
from dotenv import load_dotenv
load_dotenv()

# user_query = "Get me the winners of radar hackathon in america"

class SummaryOutputParser(BaseModel):
    content: str = Field(default='Summarised content about hackathon winners')

def rag_hackathon_winners(user_query):
    prompt_template = ChatPromptTemplate([
        ("system", "Extract only relavent search parameters from the user query"),
        ("human", user_query)
    ])
    prompt = prompt_template.invoke({user_query:user_query})
    print('\n Original Prompt:', prompt)

    llm =ChatOpenRouter(
        model="openrouter/free",
        temperature=0.8
    )

    structured_llm = llm.with_structured_output(cast(Any, ExtractParams))
    result = structured_llm.invoke(prompt) or {}
    print('\n result:', result)
   

    should_filter = []
    must_filter = []
    if isinstance(result, dict):
        for key, value in result.items():
            if key == 'query':
                continue
            if key == 'tracks':
                for track in value:
                    should_filter.append(
                        models.FieldCondition(
                            key='metadata.tracks',
                            match=models.MatchValue(value=track)
                        )
                    )
            if key=='country':
                must_filter.append(
                    models.FieldCondition(
                        key='metadata.country',
                        match=models.MatchValue(value=value)
                    )
                )
            else:
                must_filter.append(
                    models.FieldCondition(
                        key='metadata.'+ key,
                        match=models.MatchValue(value=value)
                    )
                )

    retriver = qdrant_vectorstore.as_retriever(search_type="similarity", search_kwargs={
        "k":4,
        "filter": models.Filter(
            must=must_filter,
            should=should_filter
        )
    })
    result_json = []
    contents = retriver.invoke(user_query)
    print('\n contents:', contents)
    if len(contents) > 0:
        for content in contents:
            page_content = content.page_content
            # Stored format uses key=value (not key:), with optional leading whitespace
            title_match = re.search(
                r"title\s*=\s*(.+?)(?=\n\s*(?:description|repo_link)\s*=|\Z)",
                page_content,
                re.S,
            )
            description_match = re.search(
                r"description\s*=\s*(.+?)(?=\n\s*repo_link\s*=|\Z)",
                page_content,
                re.S,
            )
            repo_link_match = re.search(
                r"repo_link\s*=\s*(\S+)",
                page_content,
            )

            result_json.append({
                "title": title_match.group(1).strip() if title_match else None,
                "description": description_match.group(1).strip() if description_match else None,
                "repo_link": repo_link_match.group(1).strip() if repo_link_match else None,
            })

    summary_prompt_template_ref = ChatPromptTemplate([
        ("system", "You are summarizer assistant, Please summarize given text contents by combining all information"),
        ("human", "here is the \n user query {user_query} \n contents {contents}")
    ])

    summary_prompt = summary_prompt_template_ref.invoke({"user_query": user_query, "contents": contents})

    summary_structured_llm = llm.with_structured_output(SummaryOutputParser)
    summary = summary_structured_llm.invoke(summary_prompt)
    summary = summary.model_dump() if hasattr(summary, "model_dump") else summary,
    print('\n summary', summary)
    return {
        "category":"hackathons",
        "query": user_query,
        "winners": result_json,
        "summary": summary
    }
if __name__ == "__main__":
    create_collection_in_vector_store()
    create_index_in_vector_store()