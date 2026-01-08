import os
os.environ["ANONYMIZED_TELEMETRY"] = "False"
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from memory import memory
from market_data import get_market_snapshot
import logging

app = FastAPI(title="TradeOS Cortex", description="Neural Backend for Semantic Memory")

class LearnRequest(BaseModel):
    content: str
    category: str = "general"

class MarketRequest(BaseModel):
    symbol: str 

class SearchRequest(BaseModel):
    query: str
    limit: int = 3

@app.get("/")
def home():
    return {"status": "Cortex Online", "models": "SentenceTransformer", "market_module": "Active"}

@app.post("/learn")
def learn_endpoint(request: LearnRequest):
    """
    Endpoint for the AI to 'learn' a new lesson.
    """
    if not request.content:
        raise HTTPException(status_code=400, detail="Content is required")
    
    result = memory.learn(request.content, request.category)
    return result

@app.post("/search")
def search_endpoint(request: SearchRequest):
    """
    Endpoint for the AI to 'remember' relevant info.
    Now uses POST to handle large context queries safely.
    """
    if not request.query:
        raise HTTPException(status_code=400, detail="Query is required")
        
    result = memory.search(request.query, request.limit)
    return result

@app.post("/market_scan")
def scan_market(item: MarketRequest):
    """
    Fetches live market data for a symbol.
    """
    logging.info(f"Scanning market for: {item.symbol}")
    data = get_market_snapshot(item.symbol)
    return {"symbol": item.symbol, "data": data}

from sandbox import run_simulation

class SimRequest(BaseModel):
    symbol: str
    logic_code: str
    timeframe: str = "1h"

@app.post("/simulate")
def simulate_endpoint(req: SimRequest):
    """
    Executes a Sandbox Simulation.
    """
    result = run_simulation(req.symbol, req.logic_code, req.timeframe)
    return result

if __name__ == "__main__":
    # Run on port 8000 (standard for FastAPI), distinct from Node's 3000
    uvicorn.run(app, host="127.0.0.1", port=8000)
