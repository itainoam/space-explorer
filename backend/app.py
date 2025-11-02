from typing import List

from data.db import SpaceDB
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Source, SearchRequest, SearchResponse, SearchResult

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = SpaceDB()


@app.get("/api/sources", response_model=List[Source])
def get_sources():
    """
    Get all NASA images/sources.
    Returns all available images with complete metadata.
    """
    try:
        sources = db.get_all_sources()
        return sources
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve sources: {str(e)}"
        )


@app.post("/api/search", response_model=SearchResponse)
def search_sources(request: SearchRequest):
    """
    Search NASA images using natural language query.
    Returns results with confidence scores sorted by relevance.
    """
    try:
        results = db.search_sources(request.query)
        # Explicitly convert dict results to SearchResult objects
        search_results = [SearchResult(**result) for result in results]
        return SearchResponse(
            query=request.query,
            total_results=len(search_results),
            results=search_results
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )
