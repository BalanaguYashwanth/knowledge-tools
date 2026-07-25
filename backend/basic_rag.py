import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_qdrant import QdrantVectorStore
from langchain_google_genai import ChatGoogleGenerativeAI
from qdrant_client import QdrantClient
from langchain_core.prompts import PromptTemplate
from langchain_huggingface import HuggingFaceEmbeddings
from qdrant_client.http.models import Distance, VectorParams
from youtube_transcript_api import YouTubeTranscriptApi
from dotenv import load_dotenv

load_dotenv()
yt = YouTubeTranscriptApi()
transcript = yt.fetch("YFjfBk8HI5o")
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

model = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=GOOGLE_API_KEY
    )

client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY
)

QDRANT_COLLECTION_NAME = "openclaw_podcast"

#NOTE: Only at the time of creation
# client.create_collection(
#     collection_name=QDRANT_COLLECTION_NAME,
#     vectors_config=VectorParams(size=384, distance=Distance.COSINE)
# )

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

index = 0
document_list = []
for snippet in transcript.to_raw_data():
    document_list.append(snippet.get('text').replace('\n', ' '))

document = ' '.join(document_list)

splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
texts = splitter.split_text(document)

vector_store = QdrantVectorStore(
    client=client,
    collection_name=QDRANT_COLLECTION_NAME,
    embedding=embedding_model
)
vector_store.add_texts(texts=texts) #If it is pdf file, then add texts with metdata it will comes from document loader

retriver = vector_store.as_retriever(search_type="mmr", search_kwargs={"k": 10})
user_query = "what are the tough moments the founder face ?"
docs = retriver.invoke(user_query)
reference_content = []
for doc in docs:
    reference_content.append(doc.page_content)
reference_content = ''.join(reference_content)

prompt_template = PromptTemplate(
    template="""
        You are a helpful assistant.

        Based on the given content:
        {reference_content}

        Answer the user query:
        {user_query}

        Give a relevant answer.
        """,
    input_variables=["reference_content",'user_query']
)

prompt = prompt_template.invoke({'reference_content':reference_content,'user_query': user_query})
response = model.invoke(prompt)
print('\n--final content--',response.content)