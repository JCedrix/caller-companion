import pandas as pd

BAND_FALLBACKS = {
    "high": "High-confidence prediction. Lean into the conversation.",
    "medium": "Medium-confidence prediction. Read the room before pushing.",
    "low": "Low-confidence prediction. Treat as a cold lead.",
}


def _translate_feature(feature: str, value, direction: int):
    if feature == "poutcome":
        if value == "success":
            return "They subscribed in a previous campaign. Acknowledge the prior relationship before pitching."
        if value == "failure":
            return "They declined our last campaign. Lead with what's different this time. Don't assume continued interest."
        return None

    if feature == "campaign":
        v = int(value)
        if v >= 4:
            return f"This is contact #{v} this campaign. Acknowledge the prior calls instead of starting fresh."
        if v == 1:
            return "First contact this campaign. Keep it light, this is a cold intro."
        return None

    if feature == "pdays":
        v = int(value)
        if v == 999:
            return None
        if v <= 7:
            return f"Last contacted {v} days ago. Reference the recent conversation."
        if v <= 30:
            return f"Last contacted {v} days ago."
        return None

    if feature == "age":
        v = int(value)
        if v >= 65:
            return "Retiree demographic. Historically high subscription rate (47% in our data). Expect receptivity."
        if v < 25:
            return "Young customer (under 25). High subscription rate in our data, but financial decisions may involve family."
        if 35 <= v <= 54 and direction < 0:
            return "Middle-aged customer. Lower-than-average subscription rate in our data."
        return None

    if feature == "job":
        if value == "student":
            return "Student. High subscription rate in our data (31%). Likely first-time investor."
        if value == "retired":
            return "Retired customer. High subscription rate (25%). Likely has disposable savings."
        if value == "blue-collar":
            return "Blue-collar worker. Lower-than-average subscription rate (7%). May be hard to reach at job sites, prepare a callback option."
        if value == "unemployed":
            return "Currently unemployed. Be sensitive about financial commitment language."
        return None

    if feature == "housing" and value == "yes":
        return "Has a mortgage. Existing financial commitment with the bank."

    if feature == "loan" and value == "yes":
        return "Has a personal loan. Existing debt obligation, factor into the pitch."

    if feature == "contact" and value == "telephone":
        return "Last contacted via landline. May indicate older demographic."

    if feature == "education":
        if value == "university.degree":
            return "University-educated. Comfortable with financial terminology."
        if value in ("basic.4y", "basic.6y", "basic.9y"):
            return "Limited formal education. Use plain language, avoid jargon."
        if value == "illiterate":
            return "Limited literacy. Verbal-only communication is critical."
        return None

    return None


def generate_talking_points(row: pd.Series, contribs_row: pd.Series, band: str, k: int = 3) -> list[str]:
    sorted_features = contribs_row.abs().sort_values(ascending=False).index.tolist()
    points: list[str] = []
    for feat in sorted_features:
        if len(points) >= k:
            break
        contrib = contribs_row[feat]
        direction = 1 if contrib > 0 else -1
        sentence = _translate_feature(feat, row[feat], direction)
        if sentence and sentence not in points:
            points.append(sentence)

    if len(points) < 2:
        fallback = BAND_FALLBACKS.get(band)
        if fallback and fallback not in points:
            points.append(fallback)

    return points
