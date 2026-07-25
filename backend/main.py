import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from solstrom.main import process_user_query

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="RAG API",
    description="Query rag database of multi-rag datasets",
    version="0.1.0",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="User chat message")


class ChatResponse(BaseModel):
    success: bool
    data: dict | None = None
    message: str | None = None

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/chat", response_model=ChatResponse)
@limiter.limit("10/minute")
async def chat(request: Request, body: ChatRequest):
    try:
        result = process_user_query(body.message.strip())
        return ChatResponse(success=True, data=result)

    except ValueError as exc:
        logger.warning("Validation error for message=%r: %s", body.message, exc)
        raise HTTPException(
            status_code=400,
            detail="Invalid request. Please check your query and try again.",
        ) from exc

    except ConnectionError as exc:
        logger.error("Connection error for message=%r: %s", body.message, exc)
        return ChatResponse(
            success=False,
            message="Unable to reach the vector database or LLM service. Please try again later.",
        )

    except TimeoutError as exc:
        logger.error("Timeout for message=%r: %s", body.message, exc)
        return ChatResponse(
            success=False,
            message="The request took too long. Please try again with a shorter query.",
        )

    except Exception as exc:
        logger.exception("Unexpected error for message=%r", body.message)
        return ChatResponse(
            success=False,
            message="Something went wrong while processing your query. Please try again later.",
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
