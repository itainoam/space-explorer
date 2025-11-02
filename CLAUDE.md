# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Conntour Space Explorer** project - a web application for browsing and searching NASA images. The app is designed as a home assignment with three main features:
1. Browse images from NASA
2. Search using natural language queries with confidence scores
3. Maintain search history with pagination support

**Important:** The assignment explicitly states that implementing real ML/NLP is NOT required - search relevance can be simulated using basic methods like keyword overlap or hash functions. No persistent database is needed (in-memory or JSON file storage is acceptable).

## Architecture

This is a **monorepo** with two separate applications:

### Backend (FastAPI + Python)
- **Location:** `/backend`
- **Framework:** FastAPI
- **Port:** 5000
- **Entry point:** `app.py`
- **Data layer:** `data/db.py` (SpaceDB class)
- **Models:** `models.py` (Pydantic models)
- **Data source:** `data/mock_data.json` (parsed NASA API format)

The backend is minimal by design. SpaceDB loads and flattens NASA API JSON data from `mock_data.json` into a simpler format with fields: id, name, type, launch_date, description, image_url, status.

### Frontend (React + TypeScript + Tailwind)
- **Location:** `/frontend`
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS
- **Port:** 3000 (proxies backend requests to localhost:5000)
- **Entry point:** `src/index.tsx` → `src/App.tsx`
- **Components:** `src/components/Sources.tsx` (main image browser)

Current implementation only shows basic image browsing - search and history features need to be built.

## Development Commands

### Backend
```bash
cd backend

# Setup (first time only)
uv venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uv pip install -r requirements.txt

# Run server
uvicorn app:app --reload --port 5000

# API docs available at: http://localhost:5000/docs
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm start

# Run tests
npm test

# Build for production
npm build
```

## Key Implementation Notes

1. **Data Flow:** Frontend fetches from `/api/sources` → Backend reads from SpaceDB → SpaceDB parses `mock_data.json` containing NASA API response format with `collection.items[]` structure.

2. **Frontend Proxy:** `frontend/package.json` includes `"proxy": "http://localhost:5000"` so `/api/*` requests go to the backend.

3. **NASA API Format:** The mock data follows the official NASA Images API structure. Each item has:
   - `data[]` array with metadata (title, description, date_created, media_type)
   - `links[]` array with `href` for images (where `render: "image"`)

4. **Missing Features:** The following need to be implemented per requirements:
   - Natural language search endpoint with confidence scoring
   - Search history storage and retrieval
   - Delete individual searches from history
   - Pagination for large search history

5. **Technology Stack:**
   - Backend: FastAPI (not Flask, despite Flask being in requirements.txt)
   - Frontend: React functional components with hooks, Axios for HTTP, Tailwind for styling
   - Video.js is in dependencies but not currently used

## API Endpoints

Currently implemented:
- `GET /api/sources` - Returns all NASA images/sources

Need to implement:
- Search endpoint (e.g., `POST /api/search`)
- Search history endpoints (get, delete)
