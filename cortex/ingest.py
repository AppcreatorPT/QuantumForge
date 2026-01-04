import os
import glob
import re
from memory import memory

# Configuration
KB_PATH = os.path.join(os.path.dirname(__file__), "../knowledge-base")

def parse_markdown_to_chunks(content, filename):
    """
    Intelligently splits markdown into chunks based on headers.
    Returns a list of dicts: {'text': chunk_content, 'topic': header_title}
    """
    chunks = []
    lines = content.split('\n')
    current_chunk = []
    current_topic = "General"
    
    for line in lines:
        # Detect Headers (H1, H2, H3)
        if line.strip().startswith('#'):
            # Save previous chunk if it has substantive content
            if current_chunk:
                text = '\n'.join(current_chunk).strip()
                if len(text) > 50: # Filter out tiny chunks
                    chunks.append({"text": text, "topic": current_topic})
            
            # Start new chunk
            current_topic = line.strip().lstrip('#').strip()
            current_chunk = [line] # Include the header in the chunk context
        else:
            current_chunk.append(line)
            
    # Save the last chunk
    if current_chunk:
        text = '\n'.join(current_chunk).strip()
        if len(text) > 50:
            chunks.append({"text": text, "topic": current_topic})
            
    return chunks

def ingest_knowledge_base():
    print(f"🚀 Project Omni: Initializing Ingestion Engine...")
    print(f"📂 Scanning Directory: {KB_PATH}")
    
    files = glob.glob(os.path.join(KB_PATH, "*.md"))
    print(f"found {len(files)} knowledge files.")
    
    total_memories = 0
    
    for file_path in files:
        filename = os.path.basename(file_path)
        print(f"\n📄 Processing: {filename}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            chunks = parse_markdown_to_chunks(content, filename)
            print(f"   ↳ Extracted {len(chunks)} semantic chunks.")
            
            for chunk in chunks:
                # Add metadata context to the text for better retrieval
                # e.g. "Source: proven_strategies.md | Topic: Trend Following | Content: ..."
                rich_content = f"Source: {filename}\nTopic: {chunk['topic']}\n\n{chunk['text']}"
                
                result = memory.learn(rich_content, source=filename)
                if result.get("status") == "success":
                    print(f"     ✅ Indexed: {chunk['topic'][:30]}...")
                    total_memories += 1
                elif result.get("status") == "skipped":
                    print(f"     ⏭️  Skipped (Duplicate): {chunk['topic'][:30]}...")
                else:
                    print(f"     ❌ Error: {result.get('message')}")
                    
        except Exception as e:
            print(f"   ❌ Failed to process file: {e}")

    print(f"\n✨ Ingestion Complete. {total_memories} new memory vectors created.")

if __name__ == "__main__":
    ingest_knowledge_base()
