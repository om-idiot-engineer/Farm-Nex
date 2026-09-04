from datetime import date, timedelta
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_auth_tokens():
    # Login farmer Ramesh Patel
    f_res = client.post(
        "/api/v1/auth/farmer/verify-otp", json={"phone": "9876543210", "otp": "123456"}
    )
    farmer_token = f_res.json()["access_token"]

    # Login buyer Agrocorp
    b_res = client.post(
        "/api/v1/auth/buyer/login",
        json={"email": "buyer1@agrocorp.in", "password": "demo1234"},
    )
    buyer_token = b_res.json()["access_token"]

    return farmer_token, buyer_token


def test_farmer_create_crop_listing_success():
    farmer_token, _ = get_auth_tokens()
    harvest_date_str = (date.today() + timedelta(days=14)).isoformat()

    res = client.post(
        "/api/v1/marketplace/listings",
        headers={"Authorization": f"Bearer {farmer_token}"},
        json={
            "commodity": "soybean",
            "quantity": 100.0,
            "quality_grade": "Grade A",
            "harvest_date": harvest_date_str,
            "location": "Indore Mandi, MP",
            "lat": 22.7196,
            "lng": 75.8577,
            "expected_price": 4800.0,
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["commodity"] == "soybean"
    assert data["quantity"] == 100.0
    assert data["expected_price"] == 4800.0
    assert data["status"] == "listed"

    # Verify listing is retrieved under /listings/my
    my_res = client.get(
        "/api/v1/marketplace/listings/my",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    assert my_res.status_code == 200
    my_listings = my_res.json()
    assert any(listing["id"] == data["id"] for listing in my_listings)


def test_crop_listing_validation():
    farmer_token, _ = get_auth_tokens()

    # Zero or negative quantity should be rejected
    res = client.post(
        "/api/v1/marketplace/listings",
        headers={"Authorization": f"Bearer {farmer_token}"},
        json={
            "commodity": "soybean",
            "quantity": -5.0,
            "quality_grade": "Grade A",
            "harvest_date": date.today().isoformat(),
            "location": "Indore, MP",
            "lat": 22.7196,
            "lng": 75.8577,
            "expected_price": 4500.0,
        },
    )
    assert res.status_code in [422, 400]

    # Zero or negative expected price should be rejected
    res2 = client.post(
        "/api/v1/marketplace/listings",
        headers={"Authorization": f"Bearer {farmer_token}"},
        json={
            "commodity": "wheat",
            "quantity": 50.0,
            "quality_grade": "Grade A",
            "harvest_date": date.today().isoformat(),
            "location": "Indore, MP",
            "lat": 22.7196,
            "lng": 75.8577,
            "expected_price": 0.0,
        },
    )
    assert res2.status_code in [422, 400]


def test_buyer_create_demand_post_success():
    _, buyer_token = get_auth_tokens()

    res = client.post(
        "/api/v1/marketplace/demands",
        headers={"Authorization": f"Bearer {buyer_token}"},
        json={
            "commodity": "cotton",
            "quantity_needed": 120.0,
            "quality_grade": "Grade A",
            "offered_price": 6800.0,
            "location": "Dewas Processing Plant, MP",
            "lat": 22.9676,
            "lng": 76.0534,
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["commodity"] == "cotton"
    assert data["quantity_needed"] == 120.0
    assert data["offered_price"] == 6800.0

    # Verify retrieved in /demands/my
    my_demands = client.get(
        "/api/v1/marketplace/demands/my",
        headers={"Authorization": f"Bearer {buyer_token}"},
    )
    assert my_demands.status_code == 200
    assert any(d["id"] == data["id"] for d in my_demands.json())


def test_role_enforcement_on_marketplace():
    farmer_token, buyer_token = get_auth_tokens()

    # Farmer cannot create buyer demand post
    res = client.post(
        "/api/v1/marketplace/demands",
        headers={"Authorization": f"Bearer {farmer_token}"},
        json={
            "commodity": "soybean",
            "quantity_needed": 50.0,
            "quality_grade": "Grade A",
            "offered_price": 5000.0,
            "location": "Indore, MP",
            "lat": 22.7196,
            "lng": 75.8577,
        },
    )
    assert res.status_code == 403

    # Buyer cannot create farmer crop listing
    res2 = client.post(
        "/api/v1/marketplace/listings",
        headers={"Authorization": f"Bearer {buyer_token}"},
        json={
            "commodity": "soybean",
            "quantity": 50.0,
            "quality_grade": "Grade A",
            "harvest_date": date.today().isoformat(),
            "location": "Dewas, MP",
            "lat": 22.9676,
            "lng": 76.0534,
            "expected_price": 5000.0,
        },
    )
    assert res2.status_code == 403
