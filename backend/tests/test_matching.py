import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.api.matching import calculate_haversine_distance, estimate_logistics

client = TestClient(app)


def get_farmer_and_buyer_tokens():
    f_res = client.post(
        "/api/v1/auth/farmer/verify-otp", json={"phone": "9876543210", "otp": "123456"}
    )
    farmer_token = f_res.json()["access_token"]
    return farmer_token


def test_haversine_logistics_calculation():
    # Indore to Dewas coordinates
    indore_lat, indore_lng = 22.7196, 75.8577
    dewas_lat, dewas_lng = 22.9676, 76.0534

    dist = calculate_haversine_distance(indore_lat, indore_lng, dewas_lat, dewas_lng)
    assert 30.0 < dist < 45.0, f"Expected Indore-Dewas distance ~35-40km, got {dist}"

    logistics = estimate_logistics(
        lat1=indore_lat,
        lon1=indore_lng,
        lat2=dewas_lat,
        lon2=dewas_lng,
        quantity_quintals=100.0,
        origin_name="Indore",
        destination_name="Dewas",
    )
    assert logistics.distance_km == dist
    assert logistics.cost_per_quintal >= 25.0
    assert logistics.total_logistics_cost == logistics.cost_per_quintal * 100.0
    assert logistics.duration_hours > 2.0


def test_smart_sell_ranking_and_net_realization():
    farmer_token = get_farmer_and_buyer_tokens()

    # 1. Farmer creates listing of 100 quintals of soybean in Indore
    res = client.post(
        "/api/v1/marketplace/listings",
        headers={"Authorization": f"Bearer {farmer_token}"},
        json={
            "crop_id": "c0000000-0000-0000-0000-000000000001",
            "quantity": 100.0,
            "quality_grade": "Grade A",
            "harvest_date": (date.today() + timedelta(days=7)).isoformat(),
            "location": "Indore, MP",
            "lat": 22.7196,
            "lng": 75.8577,
            "expected_price": 4800.0,
        },
    )
    assert res.status_code == 201
    listing = res.json()
    listing_id = listing["id"]

    # 2. Query Smart Sell opportunities
    smart_res = client.get(
        f"/api/v1/matching/best-buyers/{listing_id}",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    assert smart_res.status_code == 200
    opportunities = smart_res.json()
    assert (
        len(opportunities) >= 3
    ), "Expected at least 3 pre-seeded buyer demands for soybean in MP"

    # Verify opportunities are ordered by net_realization_per_quintal descending
    net_realizations = [o["net_realization_per_quintal"] for o in opportunities]
    assert net_realizations == sorted(
        net_realizations, reverse=True
    ), "Opportunities must be ranked by Net Realization!"

    # Verify transparency breakdown exists on every opportunity
    first = opportunities[0]
    assert "score_breakdown" in first
    assert "formula" in first["score_breakdown"]
    assert first["estimated_logistics_per_quintal"] > 0
    assert first["net_realization_per_quintal"] == pytest.approx(
        first["offered_price_per_quintal"] - first["estimated_logistics_per_quintal"],
        0.1,
    )


def test_accept_smart_sell_opportunity():
    farmer_token = get_farmer_and_buyer_tokens()

    # Create listing
    res = client.post(
        "/api/v1/marketplace/listings",
        headers={"Authorization": f"Bearer {farmer_token}"},
        json={
            "crop_id": "c0000000-0000-0000-0000-000000000001",
            "quantity": 50.0,
            "quality_grade": "Grade A",
            "harvest_date": (date.today() + timedelta(days=5)).isoformat(),
            "location": "Indore, MP",
            "lat": 22.7196,
            "lng": 75.8577,
            "expected_price": 4800.0,
        },
    )
    listing_id = res.json()["id"]

    # Get opportunities
    opps = client.get(
        f"/api/v1/matching/best-buyers/{listing_id}",
        headers={"Authorization": f"Bearer {farmer_token}"},
    ).json()
    best_demand_id = opps[0]["demand_id"]

    # Accept best offer
    accept_res = client.post(
        f"/api/v1/matching/accept?listing_id={listing_id}&demand_id={best_demand_id}",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    assert accept_res.status_code == 201
    agreement = accept_res.json()
    assert agreement["status"] == "matched"
    assert agreement["quantity"] == 50.0
    assert agreement["earnings_breakdown"]["net_farmer_earnings"] > 0
    assert agreement["earnings_breakdown"]["platform_fee"] > 0
