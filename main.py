# main.py
import os
import json
from typing import Optional

from fastapi import FastAPI, Query
import meilisearch
from meilisearch import errors
import uvicorn

app = FastAPI(title="MeiliSearch PoC for Insurance Search")

# MeiliSearch connection configuration
MEILI_URL = "http://127.0.0.1:7700"
MASTER_KEY = "masterKey"  # Adjust if you use a different key

# Define two index names for comparison
INDEX_V1 = "general_index_v1"
INDEX_V2 = "general_index_v2"

# Create MeiliSearch client
client = meilisearch.Client(MEILI_URL, MASTER_KEY)


def create_index_if_not_exists(index_name: str):
    """Create the index if it does not exist."""
    try:
        index = client.index(index_name)
    except errors.MeilisearchApiError:
        # Create new index with primary key "id"
        index = client.create_index(uid=index_name, options={"primaryKey": "id"})
    return index


# Create or get both indices
index_v1 = create_index_if_not_exists(INDEX_V1)
index_v2 = create_index_if_not_exists(INDEX_V2)


def load_dataset():
    """Load the dataset from a JSON file."""
    if os.path.exists("data/all_documents_without_Document__doc.json"):
        with open("data/all_documents_without_Document__doc.json", "r") as f:
            data = json.load(f)
        return data
    return []


# Load and index the dataset (for PoC, we add documents to both indices)
dataset = load_dataset()
if dataset:
    # You might want to check if documents are already indexed to avoid duplicates.
    # For PoC, we simply add them.
    index_v1.add_documents(dataset)
    index_v2.add_documents(dataset)


def configure_index_v1():
    """Configure the v1 index settings (current implementation)."""
    settings = {
        "filterableAttributes": [
            "id", "collection", "auto_line_hub", "property_line_hub",
            "liability_line_hub", "lms_collection", "lms_type", "lms_topic",
            "lms_lavel", "state", "legal_hub", "general_hub", "post_type",
            "adjuster_ce", "news_section", "published_on",
            "accessible_membership_plans", "accessible_roles",
            "course_prerequisite_enabled", "course_prerequisite", "course_final_quiz"
        ],
        "synonyms": {
            "UM": ["uninsured motorist"],
            "uninsured motorist": ["UM"],
            "underinsured motorist": ["UIM"],
            "actual cash value": ["ACV"],
            "additional living expense": ["ALE"],
            "anti-concurrent causation": ["ACC"],
            "business income": ["BI"],
            "fair rental value": ["FRV"],
            "assignment of benefits": ["AOB"],
            "examination under oath": ["EUO"],
            "business personal property": ["BPP"],
            "personal injury protection": ["PIP"],
            "UIM": ["underinsured motorist"],
            "ACV": ["actual cash value"],
            "ALE": ["additional living expense"],
            "ACC": ["anti-concurrent causation"],
            "BI": ["business income"],
            "FRV": ["fair rental value"],
            "AOB": ["assignment of benefits"],
            "EUO": ["examination under oath"],
            "BPP": ["business personal property"],
            "PIP": ["personal injury protection"]
        },
        "stopWords": [
            "a", "able", "all", "also", "am", "an", "and", "any", "are", "as", "at", "be", "because",
            "been", "but", "by", "can", "cannot", "could", "dear", "did", "do", "does", "else", "ever",
            "every", "for", "from", "get", "got", "had", "has", "have", "he", "her", "hers", "him", "how",
            "however", "i", "if", "in", "into", "is", "it", "its", "just", "let", "likely", "may", "me",
            "might", "must", "my", "no", "nor", "of", "often", "on", "only", "or", "other", "our", "own",
            "rather", "said", "say", "says", "she", "should", "since", "so", "some", "than", "that", "the",
            "their", "them", "then", "there", "these", "they", "this", "tis", "to", "too", "twas", "that'll",
            "that's", "there's", "they'd", "they'll", "they're", "us", "want", "wants", "was", "we", "what",
            "when", "where", "which", "who", "whom", "why", "will", "with", "would", "wasn't", "we'd",
            "we'll", "we're", "weren't", "what'd", "what's", "when'd", "when'll", "when's", "where'd",
            "where'll", "where's", "who'd", "who'll", "who's", "why'd", "why'll", "why's", "won't",
            "would've", "wouldn't"
        ],
        "sortableAttributes": ["course_length", "lms_length", "modified_on", "published_on", "title", "subject", "weight"],
        "pagination": {"maxTotalHits": 80000},
        "faceting": {"maxValuesPerFacet": 500, "sortFacetValuesBy": {"*": "alpha"}},
        "searchableAttributes": ["title", "author", "excerpt", "content", "subject", "brief", "headline"],
        "typoTolerance": {
            "enabled": True,
            "minWordSizeForTypos": {"oneTypo": 4, "twoTypos": 10},
            "disableOnAttributes": ["title"]
        },
        "rankingRules": ["exactness", "proximity", "attribute", "words", "typo", "weight:desc", "sort"]
    }
    index_v1.update_settings(settings)


def configure_index_v2():
    """Configure the v2 index settings (enhanced configuration with extra synonyms and reordering)."""
    settings = {
        "filterableAttributes": [
            "id", "collection", "auto_line_hub", "property_line_hub",
            "liability_line_hub", "lms_collection", "lms_type", "lms_topic",
            "lms_lavel", "state", "legal_hub", "general_hub", "post_type",
            "adjuster_ce", "news_section", "published_on",
            "accessible_membership_plans", "accessible_roles",
            "course_prerequisite_enabled", "course_prerequisite", "course_final_quiz"
        ],
        "synonyms": {
            "UM": ["uninsured motorist"],
            "uninsured motorist": ["UM"],
            "underinsured motorist": ["UIM"],
            "actual cash value": ["ACV"],
            "additional living expense": ["ALE"],
            "anti-concurrent causation": ["ACC"],
            "business income": ["BI"],
            "fair rental value": ["FRV"],
            "assignment of benefits": ["AOB"],
            "examination under oath": ["EUO"],
            "business personal property": ["BPP"],
            "personal injury protection": ["PIP"],
            "UIM": ["underinsured motorist"],
            "ACV": ["actual cash value"],
            "ALE": ["additional living expense"],
            "ACC": ["anti-concurrent causation"],
            "BI": ["business income"],
            "FRV": ["fair rental value"],
            "AOB": ["assignment of benefits"],
            "EUO": ["examination under oath"],
            "BPP": ["business personal property"],
            "PIP": ["personal injury protection"],
            # Additional domain-specific synonyms
            "policy cancellation": ["non-renewal", "cancellation"],
            "non-renewal": ["policy cancellation", "cancellation"],
            "insurance claim": ["claim", "claim process"],
            "claim": ["insurance claim", "claim process"],
            "coverage": ["insurance coverage"]
        },
        "stopWords": [
            "a", "able", "all", "also", "am", "an", "and", "any", "are", "as", "at", "be", "because",
            "been", "but", "by", "can", "cannot", "could", "dear", "did", "do", "does", "else", "ever",
            "every", "for", "from", "get", "got", "had", "has", "have", "he", "her", "hers", "him", "how",
            "however", "i", "if", "in", "into", "is", "it", "its", "just", "let", "likely", "may", "me",
            "might", "must", "my", "no", "nor", "of", "often", "on", "only", "or", "other", "our", "own",
            "rather", "said", "say", "says", "she", "should", "since", "so", "some", "than", "that", "the",
            "their", "them", "then", "there", "these", "they", "this", "tis", "to", "too", "twas", "that'll",
            "that's", "there's", "they'd", "they'll", "they're", "us", "want", "wants", "was", "we", "what",
            "when", "where", "which", "who", "whom", "why", "will", "with", "would", "wasn't", "we'd",
            "we'll", "we're", "weren't", "what'd", "what's", "when'd", "when'll", "when's", "where'd",
            "where'll", "where's", "who'd", "who'll", "who's", "why'd", "why'll", "why's", "won't",
            "would've", "wouldn't"
        ],
        "sortableAttributes": ["course_length", "lms_length", "modified_on", "published_on", "title", "subject", "weight"],
        "pagination": {"maxTotalHits": 80000},
        "faceting": {"maxValuesPerFacet": 500, "sortFacetValuesBy": {"*": "alpha"}},
        # Reorder searchable attributes to boost headline matches
        "searchableAttributes": ["headline", "title", "author", "excerpt", "content", "subject", "brief"],
        "typoTolerance": {
            "enabled": True,
            "minWordSizeForTypos": {"oneTypo": 4, "twoTypos": 10},
            "disableOnAttributes": ["title"]
        },
        "rankingRules": ["exactness", "proximity", "attribute", "words", "typo", "weight:desc", "sort"]
    }
    index_v2.update_settings(settings)


# Apply configurations to both indices
configure_index_v1()
configure_index_v2()


@app.get("/search_v1")
async def search_v1(
    q: str = Query("", description="Search query string"),
    facets: Optional[str] = Query(None, description="Comma-separated facet filters, e.g., 'state:California'"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1)
):
    """
    Search endpoint using v1 configuration.
    Facet filters (if provided) should be in the format: field:value,field2:value2,...
    """
    search_params = {
        "q": q,
        "offset": (page - 1) * limit,
        "limit": limit,
    }
    if facets:
        # Split facets by comma and pass as filter array
        filters = [facet.strip() for facet in facets.split(",") if facet.strip()]
        search_params["filter"] = filters
    result = index_v1.search(**search_params)
    return result


@app.get("/search_v2")
async def search_v2(
    q: str = Query("", description="Search query string"),
    facets: Optional[str] = Query(None, description="Comma-separated facet filters, e.g., 'state:California'"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1)
):
    """
    Search endpoint using v2 (enhanced) configuration.
    Includes a simple query expansion (as a placeholder for GenAI-based improvements).
    """
    # Example: if the query contains 'wildfire', expand the query to include 'fire'
    expanded_q = q
    if "wildfire" in q.lower():
        expanded_q += " fire"
    search_params = {
        "q": expanded_q,
        "offset": (page - 1) * limit,
        "limit": limit,
    }
    if facets:
        filters = [facet.strip() for facet in facets.split(",") if facet.strip()]
        search_params["filter"] = filters
    # Optionally, you can include sort parameters such as ["published_on:desc"]
    result = index_v2.search(**search_params)
    return result


if __name__ == "__main__":
    # Run FastAPI with uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
