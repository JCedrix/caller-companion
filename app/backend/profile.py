import pandas as pd

JOB_LABELS = {
    "admin.": "Admin",
    "blue-collar": "Blue-collar worker",
    "technician": "Technician",
    "services": "Services",
    "management": "Management",
    "retired": "Retired",
    "self-employed": "Self-employed",
    "entrepreneur": "Entrepreneur",
    "unemployed": "Unemployed",
    "housemaid": "Housemaid",
    "student": "Student",
    "unknown": "Unknown",
}

MARITAL_LABELS = {
    "married": "Married",
    "single": "Single",
    "divorced": "Divorced",
    "unknown": "Unknown",
}

EDUCATION_LABELS = {
    "university.degree": "University degree",
    "high.school": "High school",
    "basic.4y": "Basic schooling (4y)",
    "basic.6y": "Basic schooling (6y)",
    "basic.9y": "Basic schooling (9y)",
    "professional.course": "Professional course",
    "illiterate": "Illiterate",
    "unknown": "Unknown",
}

CONTACT_LABELS = {
    "cellular": "Cellular phone",
    "telephone": "Landline",
}

POUTCOME_LABELS = {
    "success": "Subscribed in a previous campaign",
    "failure": "Declined our last campaign",
    "nonexistent": "No prior campaign contact",
}


def translate_profile(row: pd.Series) -> dict:
    return {
        "age": int(row["age"]),
        "job": JOB_LABELS.get(row["job"], "Unknown"),
        "marital": MARITAL_LABELS.get(row["marital"], "Unknown"),
        "education": EDUCATION_LABELS.get(row["education"], "Unknown"),
        "has_mortgage": row["housing"],
        "has_loan": row["loan"],
        "contact_method": CONTACT_LABELS.get(row["contact"], "Unknown"),
        "campaign_contacts": int(row["campaign"]),
        "prior_history": POUTCOME_LABELS.get(row["poutcome"], "No prior campaign contact"),
    }
