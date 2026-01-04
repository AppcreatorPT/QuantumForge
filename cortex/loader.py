import os
import glob
from memory import memory

def ingest_strategies():
    print("🚀 Initializing QuantForge Community Ingestion...")
    
    # Path to strategies and knowledge base
    base_dir = os.path.dirname(os.path.dirname(__file__)) # Go up to root
    strategies_path = os.path.join(os.path.dirname(__file__), "community_strategies", "*.pine")
    kb_path = os.path.join(base_dir, "knowledge-base", "*.md")
    
    files = glob.glob(strategies_path) + glob.glob(kb_path)
    
    if not files:
        print("⚠️ No strategy files found in community_strategies/")
        return

    print(f"📚 Found {len(files)} strategies to ingest.")
    
    for file_path in files:
        filename = os.path.basename(file_path)
        print(f"   > Processing: {filename}...")
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                
            # Create a rich description for semantic search
            # We wrap the code in a description block so the AI knows what it is
            knowledge_block = f"""
            --- COMMUNITY STRATEGY: {filename} ---
            SOURCE: QuantForge Community Pack
            TYPE: Institutional Grade Pine Script v6
            CONTENT:
            {content}
            ----------------------------------------
            """
            
            # Ingest into Cortex Memory
            result = memory.learn(knowledge_block, source="community_loader")
            
            if result.get("status") == "success":
                print(f"     ✅ Ingested successfully (ID: {result.get('id')})")
            elif result.get("status") == "skipped":
                print(f"     ⏭️  Skipped (Already exists)")
            else:
                print(f"     ❌ Failed: {result.get('message')}")
                
        except Exception as e:
            print(f"     ❌ Error reading file: {e}")

    print("\n✨ Ingestion Complete. The AI now has photographic memory of these strategies.")

if __name__ == "__main__":
    ingest_strategies()
