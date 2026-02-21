import argparse
import requests
import sys

def main():
    parser = argparse.ArgumentParser(description="Interactive terminal interface for VoxVeritas RAG pipeline.")
    parser.parse_args()
    
    print("Welcome to VoxVeritas CLI Chat Tester. Type 'quit' or 'exit' to stop.")
    while True:
        try:
            query = input("\nYou: ")
            if query.strip().lower() in ['quit', 'exit']:
                break
            if not query.strip():
                continue
                
            response = requests.post("http://127.0.0.1:8000/ask", json={"query": query})
            if response.status_code == 200:
                data = response.json()
                print(f"\nVoxVeritas: {data['answer']}")
                if data.get('citations'):
                    print(f"Citations: {', '.join(data['citations'])}")
            else:
                print(f"Error: {response.text}")
        except KeyboardInterrupt:
            break
        except requests.exceptions.ConnectionError:
            print("\nError: Could not connect to the API. Is Uvicorn running?")
            break
            
if __name__ == "__main__":
    main()
