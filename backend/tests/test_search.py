"""Tests for search functionality."""
import pytest
from data.db import SpaceDB


@pytest.fixture
def db():
    """Create a SpaceDB instance for testing."""
    return SpaceDB()


def test_search_single_word_full_match(db):
    """Single word query returns 100% confidence for all matches."""
    results = db.search_sources("mars")
    assert len(results) > 0
    assert all(r['confidence'] == 100.0 for r in results)


def test_search_empty_query(db):
    """Empty or whitespace queries return no results."""
    assert db.search_sources("") == []
    assert db.search_sources("   ") == []
    assert db.search_sources("\n\t") == []


def test_search_no_results(db):
    """Query with no matches returns empty list."""
    results = db.search_sources("xyzabc123nonexistent")
    assert results == []

def test_search_case_insensitive(db):
    """Search is case insensitive."""
    upper = db.search_sources("MARS")
    lower = db.search_sources("mars")
    mixed = db.search_sources("MaRs")

    assert len(upper) == len(lower) == len(mixed)
    assert upper[0]['id'] == lower[0]['id'] == mixed[0]['id']


def test_search_punctuation_handling(db):
    """Punctuation is handled correctly (split on punctuation)."""
    results = db.search_sources("ksc")
    # Should match "KSC-04pd1644", "KSC-2010-5251", etc.
    assert len(results) > 20
    # All results should have 100% confidence
    assert all(r['confidence'] == 100.0 for r in results)

