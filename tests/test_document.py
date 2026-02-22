import pytest
import os
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.main import create_app

app = create_app()
client = TestClient(app)

@pytest.fixture
def mock_vector_store():
    with patch('src.api.document.vector_store') as mock:
        yield mock

def test_delete_document_success(mock_vector_store):
    mock_collection = MagicMock()
    mock_vector_store.get_collection.return_value = mock_collection
    
    mock_collection.get.return_value = {
        "ids": ["chunk1", "chunk2"],
        "metadatas": [{"doc_id": "test_id"}, {"doc_id": "test_id"}]
    }

    response = client.delete("/document/test_id")
    
    # Assert
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "doc_id": "test_id",
        "chunks_removed": 2
    }
    mock_collection.delete.assert_called_once_with(ids=["chunk1", "chunk2"])

def test_delete_document_not_found(mock_vector_store):
    mock_collection = MagicMock()
    mock_vector_store.get_collection.return_value = mock_collection
    
    mock_collection.get.return_value = {
        "ids": ["chunk1"],
        "metadatas": [{"doc_id": "different_id"}]
    }

    response = client.delete("/document/test_id")
    
    assert response.status_code == 404
