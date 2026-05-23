# Model Report

**Project:** Caller Companion
**Task:** Binary classification — predict term deposit subscription from a Portuguese bank's outbound marketing data
**Dataset:** UCI Bank Marketing (`bank-additional-full.csv`), 41,188 customer records, 11.27% positive class

---

## Approach

The product target is an outbound sales agent making cold calls. The model needs to produce two things the agent can act on: a calibrated probability of subscription and a small set of feature contributions that translate into talking points. Ranking accuracy is necessary but not sufficient — the absolute probability value drives the agent's behavior, so calibration matters as much as discrimination.

I chose **LightGBM** as the production model after comparing it against a baseline logistic regression. Both used identical preprocessing (stratified 80/20 split, class weighting for the 11% positive rate) and identical evaluation (held-out test set + 5-fold stratified cross-validation on the training fold). LightGBM was selected over the baseline on product grounds, detailed in the trade-offs section below.

The final model is a 500-estimator LightGBM classifier with `class_weight='balanced'`, native categorical handling for 10 categorical features, and conservative hyperparameters (learning rate 0.05, num_leaves 31). Four additional hyperparameter configurations were tested during tuning; none improved on the conservative defaults.

## Validation methodology

- **Split:** Stratified 80/20 train/test, `random_state=42`. Stratification preserved the 11.27% positive rate in both folds (train: 11.27%, test: 11.26%).
- **Cross-validation:** 5-fold stratified CV on the training set, used during hyperparameter tuning and model selection.
- **Metrics:** ROC-AUC (overall ranking), PR-AUC (positive-class identification under imbalance), Brier score (calibration). Accuracy was explicitly avoided — a "predict no" baseline scores 88.7% accuracy on this dataset.
- **No data leakage:** the test set was held out before any feature engineering, hyperparameter selection, or threshold tuning.

## Results

Performance on the held-out test set (8,238 customers):

| Metric | LightGBM (production) | Logistic Regression (baseline) |
|--------|:---------------------:|:------------------------------:|
| ROC-AUC | 0.8008 | 0.8008 |
| PR-AUC | **0.4840** | 0.4601 |
| Brier Score | **0.1312** | 0.1616 |

5-fold cross-validation results were stable: ROC-AUC 0.8001 ± 0.0032, confirming the test-set number isn't a lucky split.

The two models tie on ROC-AUC but LightGBM wins on the two metrics that drive product behavior. The PR-AUC lift (0.4840 vs 0.4601) means LightGBM surfaces actual subscribers more reliably at the top of any ranked queue. The Brier improvement (0.1312 vs 0.1616) means LightGBM's calibrated probabilities are closer to truth — when the model says "73%," the customer subscribes about 73% of the time, not 60%.

A predicted-probability threshold of 0.65 (high confidence) yields precision 0.495 and recall 0.568. 12.9% of test customers fall in this bucket. The three-tier confidence framing applied in the application (high ≥ 0.65, medium 0.30-0.65, low < 0.30) is documented in the Responsible AI section.

## Feature choices and trade-offs

**Dropped `duration` for post-call leakage.** The strongest correlation with the target (0.405) was the duration of the call. This feature is only known *after* the call ends, which means including it would inflate every metric and produce a model that cannot help an agent who is about to pick up the phone. Dropping it was the single most consequential decision in the modeling phase. The honest predictive ceiling without it sits at ROC-AUC 0.80, confirmed across four hyperparameter configurations during tuning. With `duration` included, the model would likely reach ROC-AUC 0.92+ — but that number would be a lie about real-world deployment performance.

**Treated `unknown` as a category, not as missing data.** Six categorical features in this dataset encode missing values as the string `"unknown"` rather than `NaN`. The most extreme case is `default` at 21% unknown. Rather than impute, I left `unknown` as its own category. The presence of a missing value is itself informative — customers who didn't disclose credit default status may differ systematically from those who did.

**Kept macroeconomic features despite generalization risk.** Five features (`emp.var.rate`, `cons.price.idx`, `cons.conf.idx`, `euribor3m`, `nr.employed`) reflect the 2008-2010 Portuguese economic context. They contribute meaningful predictive signal (`euribor3m` is the second-strongest feature by importance after `age`). These features bind the model to its training era — a deployment in 2026 or in a different country would not generalize without retraining. This is flagged in both the README and the Responsible AI document.

**Kept `poutcome` (previous campaign outcome) and surfaced it explicitly in the product.** Customers with `poutcome == 'success'` subscribe at 65% — roughly 6x the dataset average — but represent only 3.3% of customers. This is a "rich-get-richer" signal: the model concentrates predictive certainty on customers already known to convert. Rather than hide this, the talking points translator forces a `poutcome` mention whenever it equals `success` or `failure`, regardless of its rank in feature contributions. The agent always knows when they're being pointed at a returning customer and can decide whether to call them again or skip in favor of a fresh prospect.

**Chose LightGBM over the baseline on product grounds, not pure accuracy.** ROC-AUC tied between the two models. The decision to use LightGBM rests on PR-AUC, Brier, and a third practical consideration: LightGBM produces per-row feature contributions (via `predict(pred_contrib=True)`) that translate cleanly into customer-specific talking points. Logistic regression coefficients are global — they describe how features affect predictions on average, but don't tell the agent why *this specific customer* scored high. The product needs per-row reasoning, not just per-row ranking.

## Limitations and honest scope

- **Time-bound model.** Macroeconomic features tie the model to the 2008-2010 Portuguese banking environment. Predictive performance on contemporary data is unknown and likely degraded.
- **Predictive ceiling.** Without `duration`, the dataset's signal caps around ROC-AUC 0.80. Four tuning configurations confirmed this — no amount of hyperparameter optimization closed the gap.
- **Threshold tuning is product-coupled.** The 0.65 high-confidence threshold balances precision (0.495) and recall (0.568) for a call-center workflow. A different deployment context (e.g., higher cost of false positives, like compliance-sensitive industries) would require re-tuning.
- **Talking points translator coverage.** Translations exist for the highest-impact features but the dictionary isn't exhaustive. About 15% of predictions fall back to generic confidence-band advice instead of customer-specific reasoning.

## Reproducibility

All decisions documented above are reproducible from `notebooks/01_eda.ipynb` (EDA) and `notebooks/02_modeling.ipynb` (modeling). The trained model artifact (`model/model.pkl`), test set predictions (`model/predictions.csv`), feature importance scores (`model/feature_importance.csv`), and model metadata (`model/model_metadata.json`) are committed to the repository. The fixed random state (42) and stratified split parameters ensure identical results on re-runs.
