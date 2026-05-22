from dataclasses import dataclass, field
from typing import Any, Optional

import pandas as pd


@dataclass
class AppState:
    model: Any = None
    metadata: dict = field(default_factory=dict)
    predictions: Optional[pd.DataFrame] = None
    feature_importance: Optional[pd.DataFrame] = None
    X_test: Optional[pd.DataFrame] = None
    contributions: Optional[pd.DataFrame] = None
    outcomes: dict = field(default_factory=dict)
    loaded: bool = False


state = AppState()
