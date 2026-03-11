from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
import certifi
from dotenv import load_dotenv
from typing import Optional, List, Dict, Any

# Load environment variables
load_dotenv()

# FastAPI app
app = FastAPI(title="Meta Ads API Backend", version="1.0.0")

# CORS (tighten allow_origins in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # e.g., ["http://localhost:5173", "https://your-frontend.app"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Config
TOKEN = os.getenv("FB_TOKEN")
AD_ACCOUNT_ID = os.getenv("AD_ACCOUNT_ID")
GRAPH_URL = "https://graph.facebook.com/v19.0"

# --- Helpers ---------------------------------------------------------

def fb_get(url: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Wrapper around requests.get with timeout and SSL verification."""
    resp = requests.get(url, params=params, timeout=30, verify=certifi.where())
    try:
        data = resp.json()
    except Exception:
        raise HTTPException(status_code=502, detail="Invalid JSON from Meta API")

    # Handle HTTP errors / Graph errors
    if resp.status_code >= 400 or "error" in data:
        # Extract Meta error message if any
        if isinstance(data.get("error"), dict):
            msg = data["error"].get("message", "Meta API error")
            code = data["error"].get("code")
            subcode = data["error"].get("error_subcode")
            raise HTTPException(
                status_code=resp.status_code if resp.status_code >= 400 else 400,
                detail={"message": msg, "code": code, "subcode": subcode}
            )
        raise HTTPException(status_code=resp.status_code or 400, detail=data)

    return data


def to_int(x: Optional[str]) -> int:
    try:
        return int(x) if x is not None else 0
    except ValueError:
        # occasionally Meta returns "" or non-numeric; normalize to 0
        return 0

def to_float(x: Optional[str]) -> float:
    try:
        return float(x) if x is not None else 0.0
    except ValueError:
        return 0.0

# --- Models (optional but recommended) --------------------------------

class InsightRow(BaseModel):
    impressions: int
    clicks: int
    spend: float
    cpc: float
    ctr: float
    reach: int
    frequency: float

class InsightsResponse(BaseModel):
    rows: List[InsightRow]
    count: int

# --- Routes -----------------------------------------------------------

@app.get("/")
def root():
    return {"message": "Meta Ads API Backend Running"}

@app.get("/test-token")
def test_token():
    if not TOKEN:
        raise HTTPException(status_code=500, detail="FB_TOKEN is not set.")
    url = f"{GRAPH_URL}/me"
    data = fb_get(url, params={"access_token": TOKEN})
    return data

@app.get("/insights", response_model=InsightsResponse)
def get_ad_insights(
    since: str = Query(..., description='YYYY-MM-DD'),
    until: str = Query(..., description='YYYY-MM-DD'),
    level: str = Query("account", description='account|campaign|adset|ad'),
    time_increment: Optional[str] = Query(None, description='e.g., 1 for daily breakdown'),
):
    """
    Fetch insights for a date range. Returns numeric types for charting.
    """

    if not TOKEN or not AD_ACCOUNT_ID:
        raise HTTPException(status_code=500, detail="FB_TOKEN or AD_ACCOUNT_ID is not set.")

    url = f"{GRAPH_URL}/{AD_ACCOUNT_ID}/insights"

    params = {
        "access_token": TOKEN,
        "level": level,
        "fields": "impressions,clicks,spend,cpc,ctr,reach,frequency",
        "time_range": f'{{"since":"{since}","until":"{until}"}}',
    }
    if time_increment:
        params["time_increment"] = time_increment

    data = fb_get(url, params=params)
    rows_raw = data.get("data", [])

    # If empty, return zeros (consistent with your original behavior)
    if not rows_raw:
        empty = InsightRow(
            impressions=0, clicks=0, spend=0.0, cpc=0.0, ctr=0.0, reach=0, frequency=0.0
        )
        return {"rows": [empty], "count": 0}

    # Convert each row’s numeric strings to numbers
    rows: List[InsightRow] = []
    for r in rows_raw:
        row = InsightRow(
            impressions=to_int(r.get("impressions")),
            clicks=to_int(r.get("clicks")),
            spend=to_float(r.get("spend")),
            cpc=to_float(r.get("cpc")),
            ctr=to_float(r.get("ctr")),
            reach=to_int(r.get("reach")),
            frequency=to_float(r.get("frequency")),
        )
        rows.append(row)

    return {"rows": rows, "count": len(rows)}