from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from data_loader import load_all
from state import state


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_all(state)
    yield


app = FastAPI(lifespan=lifespan, title="Caller Companion API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "model_loaded": state.loaded}
