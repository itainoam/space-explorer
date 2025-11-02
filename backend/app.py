from typing import List

from data.db import SpaceDB
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from models import Source, SearchRequest, SearchResponse, SearchResult, SearchHistoryResponse

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
    Automatically saves search to history.
    """
    try:
        results = db.search_sources(request.query)

        # Auto-save to history (only save non-empty searches)
        if request.query.strip():
            db.save_to_history(request.query, results)

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


@app.get("/api/history", response_model=SearchHistoryResponse)
def get_history(
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(default=10, ge=1, le=100, description="Entries per page")
):
    """
    Retrieve paginated search history.
    Returns newest searches first.
    """
    try:
        history_data = db.get_history(page, page_size)
        return SearchHistoryResponse(**history_data)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve history: {str(e)}"
        )


@app.delete("/api/history/{entry_id}")
def delete_history_entry(entry_id: str):
    """
    Delete a specific search history entry by ID.
    Returns 204 on success, 404 if not found.
    """
    try:
        deleted = db.delete_history_entry(entry_id)

        if deleted:
            return Response(status_code=204)
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Search history entry with id '{entry_id}' not found"
            )
    except HTTPException:
        raise  # Re-raise HTTPException as-is
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete history entry: {str(e)}"
        )
