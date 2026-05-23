# Responsible AI

**Project:** Caller Companion
**Scope:** Bias considerations, deployment guardrails, and the design decisions that shape how this model interacts with human operators.

---

## The framing decision: agent stays the driver

This product is not a robocaller. It is not an auto-prioritizer. It is a briefing tool. The agent decides who to call, when to call, what to say, and whether to override the model. Every design choice in the system reinforces that framing.

The reasoning is product-level, not legal:

- **Outbound sales is high-touch.** The agents who outperform their cohort do so on judgment — tone, rapport, knowing when to back off. A model that removes those judgment calls from the loop optimizes for the wrong objective.
- **Probability scores degrade outside their training distribution.** A 2008-2010 Portuguese banking signal isn't ground truth for a 2026 cold call. Surfacing the score as guidance (which the agent can weigh) rather than as a queue ordering (which the agent obeys) keeps the human in a position to detect drift.
- **Accountability follows action.** When a model decides who gets called, the model is also deciding who *doesn't* get called. A skipped customer can't complain about being skipped. Keeping the agent in the loop on every decision means there is always a person who can defend or revise the call.

Three specific design choices implement this:

1. **No auto-dialer.** The "Start call" button briefs the agent; it does not initiate a call.
2. **No queue prioritization beyond confidence-band ordering.** The queue surfaces high-confidence customers first because the agent benefits from seeing the model's strongest signals early in their shift, but the agent can swap any upcoming customer into the active slot. Nothing is hidden from the agent's view.
3. **No silent threshold filtering.** Low-confidence customers are surfaced explicitly with a "low confidence — trust your instincts" framing, rather than dropped from the queue. The agent decides whether to skip.

---

## The leakage decision: dropping `duration`

The UCI Bank Marketing dataset includes a `duration` feature: the length of the call in seconds. It's the strongest single predictor in the dataset, correlated with the target at 0.405. It's also only known *after* the call ends.

Including `duration` in training would produce a model whose accuracy could not be honestly reported in the only context it would be deployed: before the call. A model with `duration` reaches roughly ROC-AUC 0.92+; without it, the honest ceiling is 0.80. The model that ships with this product runs at the lower number because the lower number is the truth about its deployable performance.

This decision is documented at the code level (`app/backend/data_loader.py` drops the column on every load), in the model metadata (`dropped_features: ["duration"]`), and as the first technical Q&A defense in the README and model report. See `MODEL_REPORT.md` § "Feature choices and trade-offs" for the full reasoning.

---

## Bias considerations

### Training data scope

The model was trained on 41,188 customer records from a Portuguese bank's outbound marketing campaigns between **May 2008 and November 2010**. This is a narrow slice in both time and geography:

- **Era-specific.** The dataset spans the European debt crisis. Five features (`emp.var.rate`, `cons.price.idx`, `cons.conf.idx`, `euribor3m`, `nr.employed`) encode macroeconomic conditions that are doing real predictive work but bind the model's behavior to a specific economic context. A 2026 deployment without retraining would extrapolate the model into a regime it has never seen.
- **Geography-specific.** Portuguese banking culture, consumer habits, and regulatory environment shape both the customer base and what counts as a successful term-deposit pitch. The same model deployed in (e.g.) Singapore or Brazil would face different conversion patterns and require retraining on local data.
- **Vertical-specific.** Term deposits are a low-risk savings product. Customers who subscribe are biased toward conservative-financial-behavior demographics. The same model architecture would not transfer cleanly to (e.g.) life insurance or solar installations without retraining.

### Demographic features in use

The model uses `age`, `job`, `marital`, and `education` as direct inputs. These are demographic features and carry the risk of encoding historical access patterns rather than genuine subscription intent.

Specifically:

- **Job-level disparities are large.** Students subscribe at 31.4%, retirees at 25.2%, blue-collar workers at 6.9%. The model picks up on these conversion rates and surfaces them in talking points (`"Blue-collar worker. Lower-than-average subscription rate (7%)..."`). This is informative for the agent but also runs the risk of self-fulfilling prophecy: if agents systematically deprioritize blue-collar prospects based on the model's framing, the demographic gap widens.
- **Age effects are real but band-coded into talking points.** The retiree (`age >= 65`) and young-customer (`age < 25`) translations explicitly cite their data-observed subscription rates so the agent knows what the model is reacting to.
- **`default` is not displayed in the agent UI.** The customer's credit-default status is a model input but never shown on the agent's screen. The reasoning was that surfacing it directly creates a vector for bias in agent behavior (e.g., shortening calls to customers flagged in default) without a corresponding product benefit.

### Group fairness was not formally audited

This is a hackathon-scope project. No formal demographic-parity or equalized-odds audit was performed. The model report acknowledges the `poutcome` rich-get-richer dynamic and the era-bound macroeconomic features, but a production deployment would require explicit fairness analysis across the demographic features above — particularly job category, given the wide conversion-rate spread.

---

## Calibration as honesty

Calibration was treated as a first-class metric (Brier 0.1312 on test, improving on the baseline's 0.1616). The reasoning is that a probability score is a claim about uncertainty, and an uncalibrated score is a dishonest claim. If the model says "73% likely to subscribe," that number drives the agent's behavior — they pitch differently to a 73% than to a 23%. If the model is mis-calibrated and the real conversion rate at a "73%" score is 50%, the agent is being misled.

The three-tier confidence framing (`high >= 0.65`, `medium 0.30-0.65`, `low < 0.30`) trades resolution for calibration honesty. Each band carries explicit guidance — high means "lean in," medium means "use judgment," low means "trust your instincts" — so the agent never has to extract uncertainty information from a single number.

---

## Deployment guardrails

This system would be inappropriate to deploy without modification in the following contexts:

- **Compliance-sensitive verticals.** Financial advisory, medical product sales, and any vertical with a high cost of false positives needs threshold re-tuning. The 0.65 high-confidence threshold was set for call-center workflow, not for "this customer should definitely be offered the product."
- **Cold lists with no prior contact history.** The `poutcome` feature contributes significant predictive signal for the 23% of customers with prior campaign history. On a pure cold list (everyone has `poutcome == 'nonexistent'`), the model's effective performance degrades. The README and model report flag this; a real deployment should pair this tool with fresh-prospect campaigns to avoid concentrating outreach on returning customers.
- **Inbound or warm-lead workflows.** The product is designed around outbound cold calls. Deploying it to an inbound queue would misuse the framing — inbound callers have already self-selected for interest, and the model's "confidence" signal would conflict with the obvious context that the customer is already on the phone.
- **Without monitoring for drift.** Era-bound macroeconomic features mean the model will silently degrade if deployed against current data. Any real deployment needs a feedback loop that compares model predictions against actual outcomes and surfaces when calibration is breaking down.

---

## Privacy and data handling

This demo uses a public dataset; no real customer records are handled by the deployed system. The architecture choices that would matter in a real deployment:

- **Customer records are not persisted by the application.** The backend serves customers from the pre-loaded test set and never writes customer data back to disk.
- **Outcome submissions are stored in memory on the backend, scoped to the current session, and per-caller in localStorage on the frontend.** A restart of either service clears state. A real deployment would need server-side persistence with explicit audit logging.
- **No outbound calls are made by the system.** The "Start call" affordance is purely a UI transition. Any real integration with a dialer or CRM would need to layer in consent management, do-not-call list checks, and call recording disclosures — none of which are in scope for this build.

---

## Model drift risks

A short list of failure modes that would not show up in the test-set metrics:

- **Macroeconomic regime shift.** Five features bind the model to 2008-2010. A change in interest-rate environment, employment indicators, or consumer confidence would shift the predictive landscape without affecting the model's internal weights.
- **Customer-base shift.** The training data reflects the bank's customer demographics at the time. A bank that expands into a different demographic (younger, lower-income, different geographic region) would face progressively degraded predictions.
- **Channel shift.** The dataset is built on phone-channel outbound marketing. A migration to SMS, email, or in-app messaging changes the response dynamics entirely and would invalidate the model.
- **Feedback loops.** If agents over-rely on the model and systematically skip low-confidence customers, future training data will lack signal from that group. The model becomes blind to a portion of the customer base, and the blindness becomes self-reinforcing.

The mitigation for all four is the same: predictions are surfaced to agents as guidance, not as queue ordering, so a human can detect when the model's framing has stopped matching reality.
