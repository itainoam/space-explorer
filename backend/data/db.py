import json
import os
import random
import string
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional

# Translation table for replacing punctuation with spaces
_PUNCT_TO_SPACE = str.maketrans(string.punctuation, ' ' * len(string.punctuation))


class SpaceDB:
    def __init__(self):
        # Load and parse the JSON data
        data_path = os.path.join(os.path.dirname(__file__), "mock_data.json")
        with open(data_path, "r") as f:
            json_data = json.load(f)
        # Flatten and map the data to the expected format
        self._sources = []
        items = json_data.get("collection", {}).get("items", [])
        for idx, item in enumerate(items, start=1):
            data = item.get("data", [{}])[0]
            links = item.get("links", [])
            image_url = None
            for link in links:
                if link.get("render") == "image":
                    image_url = link.get("href")
                    break
            self._sources.append(
                {
                    "id": idx,
                    "name": data.get("title", f"NASA Item {idx}"),
                    "type": data.get("media_type", "unknown"),
                    "launch_date": data.get("date_created", ""),
                    "description": data.get("description", ""),
                    "image_url": image_url,
                    "status": "Active",
                }
            )
        self._next_id = len(self._sources) + 1

        # Initialize search history storage with pre-seeded demo data
        self.search_history: List[Dict] = []
        self._seed_search_history()

    def _seed_search_history(self):
        """Pre-seed search history with 21 demo entries distributed over 6 months."""
        # Sample search queries based on actual data (mix of 1, 2, and 3 word queries)
        queries = [
            "mars", "hubble telescope", "apollo mission", "moon landing", "satellite",
            "astronaut spacewalk", "earth from space", "solar system", "telescope",
            "jupiter moons", "venus surface", "nebula", "galaxy clusters",
            "space station", "rocket launch", "spacewalk", "planet earth",
            "comet tail", "asteroid belt", "eclipse", "shuttle mission"
        ]

        now = datetime.now(timezone.utc)

        # Generate 21 entries with varied timestamps
        for i in range(21):
            query = queries[i]

            # Distribute timestamps to show different time formats:
            # - 4 entries in last hour (to show "X minutes ago")
            # - 4 entries in last day (to show "X hours ago")
            # - 13 entries spread over 6 months
            if i < 4:
                # Last hour
                random_minutes = random.randint(5, 60)
                timestamp = now - timedelta(minutes=random_minutes)
            elif i < 8:
                # Last day (1-23 hours ago)
                random_hours = random.randint(1, 23)
                timestamp = now - timedelta(hours=random_hours)
            else:
                # Spread over 6 months
                six_months_ago = now - timedelta(days=180)
                random_seconds = random.randint(0, 180 * 24 * 60 * 60)
                timestamp = six_months_ago + timedelta(seconds=random_seconds)

            # Search for results
            results = self.search_sources(query)

            # Create history entry
            top_result = None
            if results:
                top = results[0]
                top_result = {
                    "name": top["name"],
                    "confidence": top["confidence"],
                    "image_url": top["image_url"]
                }

            entry = {
                "id": uuid.uuid4().hex,
                "query": query,
                "timestamp": timestamp.isoformat(),
                "results_count": len(results),
                "top_result": top_result
            }

            self.search_history.append(entry)

        # Sort by timestamp (oldest first, as they're appended chronologically)
        self.search_history.sort(key=lambda x: x["timestamp"])

    def get_all_sources(self) -> List[Dict]:
        """Get all space sources."""
        return self._sources

    def search_sources(self, query: str) -> List[Dict]:
        """
        Search sources using simple keyword overlap.
        If query is empty, returns all sources.
        """
        # Empty query returns all sources (browse mode)
        if not query or not query.strip():
            # Add confidence field for consistency with search results
            return [{**src, "confidence": 100.0} for src in self._sources]

        # Normalize query to set of words
        query_words = set(query.casefold().translate(_PUNCT_TO_SPACE).split())
        if not query_words:
            # Add confidence field for consistency with search results
            return [{**src, "confidence": 100.0} for src in self._sources]

        results = []
        for src in self._sources:
            # Get all words from title and description
            title = (src.get("name") or "").casefold().translate(_PUNCT_TO_SPACE)
            desc = (src.get("description") or "").casefold().translate(_PUNCT_TO_SPACE)
            doc_words = set(title.split()) | set(desc.split())

            # Count matches
            matched = query_words & doc_words
            if matched:
                confidence = round(len(matched) / len(query_words) * 100, 2)
                title_matches = len(query_words & set(title.split()))
                results.append(({**src, "confidence": confidence}, title_matches))

        # Sort by confidence, then title matches
        results.sort(key=lambda x: (x[0]["confidence"], x[1]), reverse=True)
        return [r for r, _ in results]

    def save_to_history(self, query: str, results: List[Dict]) -> str:
        """
        Save a search to history with metadata.
        Returns the generated entry ID.
        """
        # Extract top result preview (if results exist)
        top_result = None
        if results:
            top = results[0]
            top_result = {
                "name": top["name"],
                "confidence": top["confidence"],
                "image_url": top["image_url"]
            }

        # Create history entry
        entry = {
            "id": uuid.uuid4().hex,
            "query": query,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "results_count": len(results),
            "top_result": top_result
        }

        # Append to history (chronological order)
        self.search_history.append(entry)

        return entry["id"]

    def get_history(self, page: int = 1, page_size: int = 10) -> Dict:
        """
        Get paginated search history in reverse chronological order (newest first).

        Returns:
            Dictionary with total, page, page_size, and entries
        """
        # Get reversed history (newest first)
        reversed_history = list(reversed(self.search_history))

        # Calculate pagination slice
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        # Return paginated response
        return {
            "total": len(self.search_history),
            "page": page,
            "page_size": page_size,
            "entries": reversed_history[start_idx:end_idx]
        }

    def delete_history_entry(self, entry_id: str) -> bool:
        """
        Delete a search history entry by ID.

        Returns:
            True if entry was found and deleted, False if not found
        """
        for i, entry in enumerate(self.search_history):
            if entry["id"] == entry_id:
                del self.search_history[i]
                return True
        return False
