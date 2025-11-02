from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class Source(BaseModel):
    id: int
    name: str
    type: str
    launch_date: str
    description: str
    image_url: str  # Required - all NASA images have URLs
    status: str


class SearchRequest(BaseModel):
    query: str = Field(default="", max_length=500)

    @field_validator('query')
    @classmethod
    def normalize_query(cls, v: str) -> str:
        # Allow empty queries (for browse mode)
        return v.strip()

class SearchResult(Source):
    """Search result extends Source with confidence score."""
    confidence: float


class SearchResponse(BaseModel):
    query: str
    total_results: int
    results: List[SearchResult]


class SearchHistoryEntry(BaseModel):
    """Single search history record."""
    id: str
    query: str
    timestamp: str  # ISO 8601 format
    results_count: int
    top_result: Optional[dict]  # {name, confidence, image_url} or None


class SearchHistoryResponse(BaseModel):
    """Paginated search history response."""
    total: int
    page: int
    page_size: int
    entries: List[SearchHistoryEntry]
