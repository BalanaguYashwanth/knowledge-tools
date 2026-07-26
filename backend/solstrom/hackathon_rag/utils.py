import json
from langchain_qdrant import QdrantVectorStore
from langchain_core.documents import Document
from qdrant_client import QdrantClient
from qdrant_client.models import PayloadSchemaType
from qdrant_client.http.models import Distance, VectorParams
from .config import QDRANT_API_KEY, QDRANT_URL, EMBEDDING_MODEL, OPENROUTER_API_KEY, EMBED_BATCH_SIZE
from .constants import QDRANT_COLLECTION_NAME
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv
load_dotenv()

qclient = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
    cloud_inference=True,
    timeout=120
)

embedding_model = OpenAIEmbeddings(
    model=EMBEDDING_MODEL,
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
    chunk_size=EMBED_BATCH_SIZE,
    check_embedding_ctx_length=False,
)



def create_collection_in_vector_store():
    if qclient.collection_exists(QDRANT_COLLECTION_NAME):
        qclient.delete_collection(QDRANT_COLLECTION_NAME)

    with open("/Users/yashwanth/other-projects/AI_ML/solstrom_youtube-chatbot/backend/data/hackathon_v2.json") as f:
        hackathons = json.load(f)
        qclient.create_collection(
            collection_name='hackathons',
            vectors_config=VectorParams(size=384, distance=Distance.COSINE)
        )
        all_documents = []
        for hackathon_obj in hackathons:
            document = Document(
                page_content=f"""
                        title={hackathon_obj.get('title')}
                        description={hackathon_obj.get("description")}
                        repo_link={hackathon_obj.get("repo_link")}
                        """,
                metadata={
                    "country":hackathon_obj.get("country"),
                    "tracks": hackathon_obj.get("tracks"),
                    "prize_name": hackathon_obj.get("prize_name"),
                    "hackathon_name": hackathon_obj.get("hackathon_name")
                }
            )
            all_documents.append(document)
        qdrant_vectorstore = QdrantVectorStore(
            client=qclient,
            collection_name=QDRANT_COLLECTION_NAME,
            embedding=embedding_model
        )
        qdrant_vectorstore.add_documents(all_documents)

def create_index_in_vector_store():
    qclient.create_payload_index(
        collection_name=QDRANT_COLLECTION_NAME,
        field_name='metadata.country',
        field_schema=PayloadSchemaType.KEYWORD
    )

    qclient.create_payload_index(
        collection_name=QDRANT_COLLECTION_NAME,
        field_name="metadata.tracks",
        field_schema=PayloadSchemaType.KEYWORD,
    )

    qclient.create_payload_index(
        collection_name=QDRANT_COLLECTION_NAME,
        field_name="metadata.prize_name",
        field_schema=PayloadSchemaType.KEYWORD
    )

    qclient.create_payload_index(
        collection_name=QDRANT_COLLECTION_NAME,
        field_name="metadata.hackathon_name",
        field_schema=PayloadSchemaType.KEYWORD
    )

qdrant_vectorstore = QdrantVectorStore(
                client=qclient,
                collection_name=QDRANT_COLLECTION_NAME,
                embedding=embedding_model
            )