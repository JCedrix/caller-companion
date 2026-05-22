import io
import json
import sys
import zipfile
from pathlib import Path

import joblib
import pandas as pd
import requests
from pandas.api.types import CategoricalDtype
from sklearn.model_selection import train_test_split

from state import AppState


def _log(msg: str) -> None:
    print(msg, flush=True, file=sys.stdout)

BACKEND_DIR = Path(__file__).parent
PROJECT_ROOT = BACKEND_DIR.parent.parent
MODEL_DIR = PROJECT_ROOT / "model"
CACHE_DIR = BACKEND_DIR / ".cache"

UCI_URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/00222/bank-additional.zip"
UCI_CSV_NAME = "bank-additional/bank-additional-full.csv"
CACHED_CSV = CACHE_DIR / "bank-additional-full.csv"


def _download_uci_dataset() -> pd.DataFrame:
    CACHE_DIR.mkdir(exist_ok=True)
    if CACHED_CSV.exists():
        _log(f"[startup] Loading UCI dataset from cache: {CACHED_CSV}")
        return pd.read_csv(CACHED_CSV, sep=";")

    _log(f"[startup] Downloading UCI dataset from {UCI_URL}")
    resp = requests.get(UCI_URL, timeout=60)
    resp.raise_for_status()
    with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
        with zf.open(UCI_CSV_NAME) as f:
            df = pd.read_csv(f, sep=";")
    df.to_csv(CACHED_CSV, index=False, sep=";")
    _log(f"[startup] Cached UCI dataset to {CACHED_CSV}")
    return df


def _reconstruct_test_set(df: pd.DataFrame) -> pd.DataFrame:
    df = df.drop(columns=["duration"])
    y = (df["y"] == "yes").astype(int)
    X = df.drop(columns=["y"])
    _, X_test, _, _ = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=42
    )
    return X_test


def load_all(state: AppState) -> None:
    metadata_path = MODEL_DIR / "model_metadata.json"
    with open(metadata_path) as f:
        state.metadata = json.load(f)

    state.model = joblib.load(MODEL_DIR / "model.pkl")
    state.predictions = pd.read_csv(MODEL_DIR / "predictions.csv").set_index("customer_index")
    state.feature_importance = pd.read_csv(MODEL_DIR / "feature_importance.csv")

    df = _download_uci_dataset()
    state.X_test = _reconstruct_test_set(df)

    expected_test_size = state.metadata["class_distribution"]["test_size"]
    if len(state.X_test) != expected_test_size:
        raise RuntimeError(
            f"Test set size mismatch: got {len(state.X_test)}, expected {expected_test_size}"
        )

    pred_idx = set(state.predictions.index)
    test_idx = set(state.X_test.index)
    if pred_idx != test_idx:
        raise RuntimeError(
            f"Test set indices don't match predictions: "
            f"{len(pred_idx ^ test_idx)} mismatched indices"
        )

    _precompute_contributions(state)

    state.loaded = True

    metrics = state.metadata["test_metrics"]
    _log(
        f"[startup] Loaded model: ROC-AUC {metrics['roc_auc']:.4f}, "
        f"PR-AUC {metrics['pr_auc']:.4f}, "
        f"Brier {metrics['brier_score']:.4f}"
    )
    _log(
        f"[startup] {len(state.X_test)} test rows, "
        f"{len(state.predictions)} predictions, "
        f"{len(state.metadata['feature_names'])} features. OK."
    )
    _log(
        f"[startup] Pre-computed contributions: "
        f"{state.contributions.shape[0]} rows x {state.contributions.shape[1]} features."
    )


def _precompute_contributions(state: AppState) -> None:
    feature_names = state.metadata["feature_names"]
    cat_features = state.metadata["categorical_features"]
    X = state.X_test[feature_names].copy()
    training_cats = state.model.booster_.pandas_categorical
    for col, cats in zip(cat_features, training_cats):
        X[col] = X[col].astype(CategoricalDtype(categories=cats))

    contribs = state.model.booster_.predict(X, pred_contrib=True)
    state.contributions = pd.DataFrame(
        contribs[:, :-1],
        index=state.X_test.index,
        columns=feature_names,
    )
