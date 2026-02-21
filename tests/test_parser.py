import os
import pytest
from src.services.document_parser import DocumentParser

def test_extract_txt_and_chunk(tmp_path):
    # Create a temporary text file
    test_file = tmp_path / "test.txt"
    test_text = "This is a test document. " * 50
    test_file.write_text(test_text)
    
    # Extract text
    extracted = DocumentParser.extract_text(str(test_file))
    assert extracted == test_text
    
    # Chunk text
    chunks = DocumentParser.chunk_text(extracted, chunk_size=100, overlap=20)
    assert len(chunks) > 1
    assert all(len(c) <= 100 for c in chunks)
