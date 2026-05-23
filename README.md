<div align="center">

# Caller Companion

**Stop letting good leads slip through bad conversations.**

A pre-call briefing tool for outbound sales agents. The model writes the brief. The agent runs the call.

[![Python](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![LightGBM](https://img.shields.io/badge/LightGBM-4.5-success.svg)](https://lightgbm.readthedocs.io/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)

</div>

***

## The problem

Every cold-call agent faces the same problem on every shift: a list of names, a script, and no context. The good agents build context themselves through tone, intuition, and follow-up notes. The average agent reads the script.

Caller Companion closes that gap.

## What it does

Before every dial, the agent sees a one-screen brief:

- 📊 A **calibrated subscription probability** based on historical conversion patterns
- 🎯 A **confidence band** (high, medium, low) so the agent knows how much to trust the number
- 💬 **Two to three talking points** translated from the model's reasoning into agent-readable language
- 👤 The customer's **profile** including age, occupation, prior campaign history, contact preferences

The agent reads the brief, makes the call, logs the outcome. The app shows them whether the model was right. Over a shift, agents calibrate their own instincts against the model's predictions and learn where to trust it and where to override it.

Each rep also has their own **session history**: every completed shift is logged with date, calls made, model accuracy, and outcome breakdown. The pattern scales to teams. Same UI, different rep, separate history.

## Who it's for

| | |
|---|---|
| **Outbound sales teams** | running campaigns into existing customer lists |
| **Call centers** | where reps make 30-80 calls a shift and need fast context |
| **CRM operators** | who want their reps spending more time on warm leads and less time fishing in the dark |

## What makes it different

Most ML sales tools fall into one of two traps. They either replace the human (auto-dialers, robocallers, scripted bots that turn every prospect off within 15 seconds) or they hide the model (a probability score with no explanation, leaving the rep to guess why a lead is "hot"). Caller Companion does neither.

- ✅ **No auto-dialer.** The agent decides who to call, when to call, and what to say. The tool briefs, doesn't dial.
- ✅ **No black box.** The brief surfaces *why* the model is confident, not just *that* it is. Top features become talking points.
- ✅ **No false certainty.** Predictions are explicitly bucketed. Low-confidence customers tell the agent "the model doesn't know, trust your read."
- ✅ **No leakage.** The model was built on features known *before* the call. Predictive features only available after the call (like call duration) were dropped from training. Including them would inflate metrics and produce a model that can't help an agent picking up the phone.

***

## The model

A LightGBM gradient-boosted classifier trained on the [UCI Bank Marketing dataset](https://archive.ics.uci.edu/dataset/222/bank+marketing). 41,188 customer records from a Portuguese bank's term deposit campaigns. The dataset is publicly available and well-documented, making the model and its limitations easy to verify and audit.

### Performance on the held-out test set

| Metric | Caller Companion | Logistic Regression Baseline | Winner |
|--------|:----------------:|:----------------------------:|:------:|
| ROC-AUC | **0.8008** | 0.8008 | Tie |
| PR-AUC | **0.4840** | 0.4601 | Caller Companion |
| Brier Score | **0.1312** | 0.1616 | Caller Companion |

The two models tie on ranking quality but Caller Companion wins on **calibration** (lower Brier means the probability number is more trustworthy in absolute terms) and on **positive-class identification** (higher PR-AUC means the model surfaces actual subscribers more reliably at the top of any ranked queue).

### Confidence tiers

Three tiers are applied to the calibrated probability:

| Tier | Threshold | % of customers | Agent guidance |
|------|-----------|:--------------:|----------------|
| 🟢 High | ≥ 0.65 | 12.9% | Strong likelihood of conversion. Lean in. |
| 🟡 Medium | 0.30 to 0.65 | 26.7% | Some positive signal. Read the brief, use judgment. |
| ⚪ Low | < 0.30 | 60.4% | Model is uncertain. Trust your instincts. |

***

## Architecture

```
┌──────────────────┐      ┌───────────────────┐      ┌─────────────────┐
│   Next.js App    │ ───► │   FastAPI Service │ ───► │  LightGBM Model │
│   (Vercel)       │      │   (Render)        │      │  (in-memory)    │
└──────────────────┘      └────────┬──────────┘      └─────────────────┘
         ▲                         │
         │                         ▼
         │                ┌───────────────────┐
         └─────────────── │  Talking Points   │
        Profile + Brief   │  Translator       │
                          └───────────────────┘
```

**Backend.** FastAPI loads the trained model on startup and pre-computes per-row SHAP-like feature contributions for the entire test set. Queue requests are constant-time. Three endpoints: customer queue, customer detail, outcome submission.

**Frontend.** Next.js 14 with TypeScript and Tailwind. Identity persistence in localStorage. State machine: identity picker, queue, active customer, outcome, reveal, next.

**Talking points translator.** A Python module that ranks each customer's feature contributions by magnitude, then translates the top 2-3 into agent-readable sentences. A hard override surfaces `poutcome` (previous campaign outcome) whenever it's `success` or `failure`, regardless of contribution rank. The agent always knows when they're calling a returning customer.

***

## Repository structure

```
caller-companion/
├── notebooks/
│   ├── 01_eda.ipynb           # Exploratory data analysis
│   └── 02_modeling.ipynb      # Model training and evaluation
├── model/
│   ├── model.pkl              # Trained LightGBM (500 estimators)
│   ├── predictions.csv        # Test set predictions with confidence bands
│   ├── feature_importance.csv
│   └── model_metadata.json
├── app/
│   ├── backend/               # FastAPI service
│   └── frontend/              # Next.js application
├── docs/
│   ├── MODEL_REPORT.md        # One-page model summary
│   └── RESPONSIBLE_AI.md      # Bias considerations and deployment guardrails
└── render.yaml                # Render deployment configuration
```

***

## Run it locally

**Prerequisites:** Python 3.11+, Node.js 18+, npm.

### Backend

```bash
cd app/backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend will load the model and pre-compute feature contributions on startup. First boot takes about 30 seconds.

### Frontend

```bash
cd app/frontend
npm install
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

***

## Honest limitations

This isn't a finished product. A few things worth knowing before evaluating it:

- ⚠️ The model was trained on **2008-2010 Portuguese bank data**. The macroeconomic features (Euribor rate, employment indicators) are doing real predictive work but bind the model to its training era. Re-training on current data from a target vertical is required for real deployment.
- ⚠️ **Predictive ceiling sits at ROC-AUC 0.80** without the `duration` feature. This was confirmed across four hyperparameter configurations and none improved on the baseline. The signal in the available features is what it is.
- ⚠️ The talking points translator covers the highest-impact features but **isn't exhaustive**. Some predictions surface generic confidence-band advice when no specific feature translation applies.
- ⚠️ Low absolute count of high-confidence positive predictions means a real deployment should pair this tool with **fresh-prospect campaigns** to avoid a "rich-get-richer" loop where the same returning customers get over-marketed.

***

## License

MIT. Use it, fork it, run it on your own data, ship something better.

***

<div align="center">

*The best closer is the one who knows when to stop pitching.*

</div>
