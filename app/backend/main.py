import hashlib
import random
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from data_loader import load_all
from profile import translate_profile
from state import state
from talking_points import generate_talking_points


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_all(state)
    yield


app = FastAPI(lifespan=lifespan, title="Caller Companion API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_origin_regex=r"https://caller-companion(-[a-z0-9-]+)?\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _build_customer(customer_index: int) -> Optional[dict]:
    if customer_index not in state.predictions.index:
        return None
    pred = state.predictions.loc[customer_index]
    row = state.X_test.loc[customer_index]
    contribs_row = state.contributions.loc[customer_index]

    prob = float(pred["predicted_probability"])
    band = str(pred["confidence_band"])
    return {
        "customer_index": int(customer_index),
        "profile": translate_profile(row),
        "prediction": {
            "probability": prob,
            "probability_pct": f"{round(prob * 100)}%",
            "confidence_band": band,
            "predicted_label": int(pred["predicted_label"]),
        },
        "talking_points": generate_talking_points(row, contribs_row, band),
    }


def _require_loaded() -> None:
    if not state.loaded:
        raise HTTPException(status_code=503, detail="model not loaded")


@app.get("/api/health")
def health():
    return {"status": "ok", "model_loaded": state.loaded}


@app.get("/api/queue")
def get_queue(n: int = 20, caller_id: str = "default"):
    _require_loaded()
    n = min(max(1, n), 50)

    seed = int(hashlib.md5(caller_id.encode()).hexdigest()[:8], 16)
    rng = random.Random(seed)
    all_indexes = list(state.predictions.index)
    rng.shuffle(all_indexes)

    logged = {o["customer_index"] for o in state.outcomes.get(caller_id, [])}
    available = [i for i in all_indexes if i not in logged]

    customers = [_build_customer(i) for i in available[:n]]
    return {"caller_id": caller_id, "customers": customers}


@app.get("/api/customer/{customer_index}")
def get_customer(customer_index: int):
    _require_loaded()
    customer = _build_customer(customer_index)
    if customer is None:
        raise HTTPException(status_code=404, detail=f"customer_index {customer_index} not found")
    return customer


OutcomeLiteral = Literal[
    "no_answer", "voicemail", "callback", "interested", "not_now", "dnc"
]


class OutcomeRequest(BaseModel):
    customer_index: int
    caller_id: str
    outcome: OutcomeLiteral


def _outcome_message(was_right: bool, actual_label: int, band: str) -> str:
    actual = "subscribed" if actual_label == 1 else "did not subscribe"
    if was_right:
        return (
            f"Model was right. Customer {actual} and the model's "
            f"{band}-confidence call matched the outcome."
        )
    return (
        f"Model was wrong. Customer {actual} but the model's "
        f"{band}-confidence call missed."
    )


@app.post("/api/outcome")
def post_outcome(req: OutcomeRequest):
    _require_loaded()
    if req.customer_index not in state.predictions.index:
        raise HTTPException(
            status_code=404,
            detail=f"customer_index {req.customer_index} not found",
        )

    pred = state.predictions.loc[req.customer_index]
    actual_label = int(pred["actual_label"])
    predicted_label = int(pred["predicted_label"])
    predicted_probability = float(pred["predicted_probability"])
    band = str(pred["confidence_band"])
    was_right = actual_label == predicted_label

    record = {
        "customer_index": req.customer_index,
        "outcome": req.outcome,
        "was_right": was_right,
        "actual_label": actual_label,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    state.outcomes.setdefault(req.caller_id, []).append(record)

    return {
        "customer_index": req.customer_index,
        "actual_label": actual_label,
        "actual_outcome": "Subscribed" if actual_label == 1 else "Did not subscribe",
        "predicted_label": predicted_label,
        "predicted_probability": predicted_probability,
        "model_was_right": was_right,
        "message": _outcome_message(was_right, actual_label, band),
    }
