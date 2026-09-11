import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import db

client = TestClient(app)

def test_intelligence_trending():
    res = client.get("/api/v1/intelligence/trending?region=Madhya%20Pradesh")
    assert res.status_code == 200
    data = res.json()
    assert "top_gainers" in data
    assert "top_losers" in data
    assert len(data["top_gainers"]) + len(data["top_losers"]) > 0
    # verify schema
    crop = (data["top_gainers"] + data["top_losers"])[0]
    assert "commodity" in crop
    assert "current_price" in crop
    assert "dod_change_pct" in crop
    assert "trend" in crop

def test_matching_suggestions():
    # Setup test users
    buyer = {"phone": "9998887771", "password": "securepassword"}
    client.post("/api/v1/auth/buyer/register", json={
        "email": "buyer11@test.com",
        "phone": buyer["phone"],
        "password": buyer["password"],
        "name": "Sugg Buyer",
        "business_name": "Sugg Inc",
        "location": "Indore",
        "lat": 22.7,
        "lng": 75.8
    })
    b_login = client.post("/api/v1/auth/buyer/login", json={"email": "buyer11@test.com", "password": buyer["password"]})
    b_token = b_login.json()["access_token"]

    # Farmer
    farmer = {"phone": "1112223331"}
    f_reg = client.post("/api/v1/auth/farmer/register", json={
        "phone": farmer["phone"],
        "name": "Sugg Farmer",
        "location": "Dewas",
        "lat": 23.0,
        "lng": 76.0
    })
    f_token = f_reg.json()["access_token"]

    # Farmer creates listing
    res = client.post(
        "/api/v1/marketplace/listings",
        json={
            "crop_id": "c0000000-0000-0000-0000-000000000001",
            "quantity": 50,
            "expected_price": 4000,
            "quality_grade": "Grade A",
            "harvest_date": "2026-10-01",
            "location": "Dewas",
            "lat": 23.0,
            "lng": 76.0
        },
        headers={"Authorization": f"Bearer {f_token}"}
    )
    assert res.status_code == 201

    # Buyer creates demand
    res = client.post(
        "/api/v1/marketplace/demands",
        json={
            "crop_id": "c0000000-0000-0000-0000-000000000001",
            "quantity_needed": 100,
            "offered_price": 4500,
            "quality_grade": "Grade A",
            "location": "Indore",
            "lat": 22.7,
            "lng": 75.8
        },
        headers={"Authorization": f"Bearer {b_token}"}
    )
    assert res.status_code == 201

    # Get suggestions for farmer
    res = client.get(
        "/api/v1/matching/suggestions",
        headers={"Authorization": f"Bearer {f_token}"}
    )
    assert res.status_code == 200
    suggestions = res.json()
    assert len(suggestions) > 0
    assert any(s["target_name"] == "Sugg Buyer" for s in suggestions)
    assert "matching_score" in suggestions[0]
    assert suggestions[0]["matching_score"] > 0
