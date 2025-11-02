import json
import os
import string
from typing import Dict, List

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

    def get_all_sources(self) -> List[Dict]:
        """Get all space sources."""
        return self._sources

    def search_sources(self, query: str) -> List[Dict]:
        """Search sources using simple keyword overlap."""
        if not query or not query.strip():
            return []

        # Normalize query to set of words
        query_words = set(query.casefold().translate(_PUNCT_TO_SPACE).split())
        if not query_words:
            return []

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
