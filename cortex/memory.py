import chromadb
from chromadb.utils import embedding_functions
from sentence_transformers import SentenceTransformer
import os
import uuid

# Configuration
PERSIST_DIRECTORY = os.path.join(os.path.dirname(__file__), "brain_storage")

import logging
import sys

# Configure Logging (Safe for Windows Console)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s]CORTEX: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("cortex_memory")

class CortexMemory:
    def __init__(self):
        logger.info("Initializing Cortex Memory...")
        
        # Initialize Vector DB (Chroma)
        self.chroma_client = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
        
        # Initialize Embedding Model
        logger.info("Loading Embedding Model (this may take a moment)...")
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Create or Get Collection
        self.collection = self.chroma_client.get_or_create_collection(
            name="trade_os_lessons",
            metadata={"hnsw:space": "cosine"} # Cosine similarity for semantic match
        )
        logger.info("Cortex Memory Ready.")

    def _get_embedding(self, text):
        # Generate vector embedding for text
        return self.embedding_model.encode(text).tolist()

    def learn(self, text, source="user_correction"):
        """
        Stores a new lesson in the vector database.
        Includes DEDUPLICATION logic.
        """
        try:
            vector = self._get_embedding(text)
            
            # 1. Deduplication Check
            existing = self.collection.query(
                query_embeddings=[vector],
                n_results=1
            )
            
            if existing["distances"] and existing["distances"][0]:
                similarity_distance = existing["distances"][0][0]
                # If distance is very small (e.g., < 0.1), it's effectively a duplicate
                if similarity_distance < 0.1:
                    logger.info(f"Skipping duplicate lesson. Distance: {similarity_distance}")
                    return {"status": "skipped", "message": "Knowledge already exists."}

            # 2. Add New Lesson
            doc_id = str(uuid.uuid4())
            self.collection.add(
                documents=[text],
                embeddings=[vector],
                metadatas=[{"source": source, "timestamp": str(os.path.getmtime(os.getcwd()))}],
                ids=[doc_id]
            )
            logger.info(f"Learned: {text[:30]}...")
            return {"status": "success", "id": doc_id, "message": "Memory encoded and stored."}
        except Exception as e:
            logger.error(f"Learning Error: {e}")
            return {"status": "error", "message": str(e)}

    def search(self, query, n_results=3):
        """
        Retrieves the most semantically similar lessons to the query.
        """
        try:
            vector = self._get_embedding(query)
            
            results = self.collection.query(
                query_embeddings=[vector],
                n_results=n_results
            )
            
            # Formatting results
            memories = []
            if results["documents"]:
                for i, doc in enumerate(results["documents"][0]):
                    memories.append({
                        "text": doc,
                        "distance": results["distances"][0][i] if results["distances"] else 0
                    })
            
            return {"status": "success", "matches": memories}
        except Exception as e:
            logger.error(f"Search Error: {e}")
            return {"status": "error", "message": str(e)}

# Singleton instance
memory = CortexMemory()
