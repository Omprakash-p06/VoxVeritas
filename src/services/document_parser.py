import os
from pydantic import BaseModel

class Chunk(BaseModel):
    text: str
    metadata: dict

class DocumentParser:
    """Handles text extraction and chunking for various document formats."""

    @staticmethod
    def extract_text(file_path: str) -> str:
        """Extracts text from a given file path based on its extension."""
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.txt':
            return DocumentParser._extract_txt(file_path)
        elif ext == '.pdf':
            return DocumentParser._extract_pdf(file_path)
        elif ext == '.docx':
            return DocumentParser._extract_docx(file_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

    @staticmethod
    def _extract_txt(file_path: str) -> str:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()

    @staticmethod
    def _extract_pdf(file_path: str) -> str:
        import pdfplumber
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        return text

    @staticmethod
    def _extract_docx(file_path: str) -> str:
        import docx
        doc = docx.Document(file_path)
        return "\n".join([paragraph.text for paragraph in doc.paragraphs])

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
        """Splits text into chunks of `chunk_size` characters with `overlap`."""
        if not text:
            return []
            
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = min(start + chunk_size, text_len)
            
            # If we're not at the very end, try to find a nice breaking point (like a space or newline)
            if end < text_len:
                # Look back up to 50 characters for a newline or space
                break_point = end
                for i in range(end, max(start, end - 50), -1):
                    if text[i-1] in ('\n', '.', ' '):
                        break_point = i
                        break
                end = break_point
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
                
            start = end - overlap
            if start < 0:
                start = 0
            # Prevent infinite loop if overlap >= chunk_size or no progress made
            if end <= start:
                start = end
                
        return chunks
