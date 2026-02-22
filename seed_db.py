import asyncio
from src.services.vector_store import get_collection, add_chunks

dummy_docs = [
    {
        "filename": "english_info.txt",
        "text": "VoxVeritas is a screen reader application designed to help visually impaired users interact with their computer. It supports features like text-to-speech, document reading, and multilingual question answering."
    },
    {
        "filename": "hindi_info.txt",
        "text": "भारत की राजधानी नई दिल्ली है। दिल्ली एक बहुत बड़ा शहर है और यहाँ बहुत सारे ऐतिहासिक स्मारक हैं।"
    },
    {
        "filename": "bengali_info.txt",
        "text": "রবীন্দ্রনাথ ঠাকুর একজন বিখ্যাত বাঙালি কবি ছিলেন। তিনি 'গীতাঞ্জলি' নামক কাব্যগ্রন্থের জন্য সাহিত্যে নোবেল পুরস্কার পেয়েছিলেন।"
    }
]

def seed_db():
    print("Seeding ChromaDB...")
    collection = get_collection()
    for doc in dummy_docs:
        add_chunks(collection, [doc["text"]], {"filename": doc["filename"]}, doc["filename"])
    print(f"Seeding complete. Docs in ChromaDB: {collection.count()}")

if __name__ == "__main__":
    seed_db()
