from typing import List

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
    query: str = Field(..., min_length=1, max_length=500)

    @field_validator('query')
    @classmethod
    def query_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Query cannot be empty or whitespace')
        return v.strip()

class SearchResult(Source):
    """Search result extends Source with confidence score."""
    confidence: float


class SearchResponse(BaseModel):
    query: str
    total_results: int
    results: List[SearchResult]
