from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
import certifi
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# FastAPI app
app = FastAPI()

# Enable CORS (React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Config
TOKEN = os.getenv("FB_TOKEN")
AD_ACCOUNT_ID = os.getenv("AD_ACCOUNT_ID")

GRAPH_URL = "https://graph.facebook.com/v19.0"


# ----------------------------------
# Root test
# ----------------------------------
@app.get("/")
def root():
    return {"message": "Meta Ads API Backend Running"}


# ----------------------------------
# Get ad insights
# ----------------------------------
@app.get("/insights")
def get_ad_insights(since: str, until: str):

    try:

        url = f"{GRAPH_URL}/{AD_ACCOUNT_ID}/insights"

        params = {
            "access_token": TOKEN,
            "level": "account",
            "fields": "impressions,clicks,spend,cpc,ctr,reach,frequency",
            "time_range": f'{{"since":"{since}","until":"{until}"}}'
        }

        response = requests.get(
            url,
            params=params,
            verify=certifi.where()
        )

        data = response.json()

        print("Facebook API response:", data)

        if "error" in data:
            raise HTTPException(status_code=400, detail=data["error"])

        insights = data.get("data", [])

        if not insights:
            return {
                "impressions": 0,
                "clicks": 0,
                "spend": 0,
                "cpc": 0,
                "ctr": 0,
                "reach": 0,
                "frequency": 0
            }

        insight = insights[0]

        return {
            "impressions": insight.get("impressions", 0),
            "clicks": insight.get("clicks", 0),
            "spend": insight.get("spend", 0),
            "cpc": insight.get("cpc", 0),
            "ctr": insight.get("ctr", 0),
            "reach": insight.get("reach", 0),
            "frequency": insight.get("frequency", 0)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------------
# Test token
# ----------------------------------
@app.get("/test-token")
def test_token():

    try:

        url = f"{GRAPH_URL}/me"

        params = {
            "access_token": TOKEN
        }

        response = requests.get(
            url,
            params=params,
            verify=certifi.where()
        )

        return response.json()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))