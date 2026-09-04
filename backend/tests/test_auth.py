from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "Farm-Nex"


def test_farmer_auth_flow():
    # 1. Send OTP for seeded farmer Ramesh Patel
    phone = "9876543210"
    otp_resp = client.post("/api/v1/auth/farmer/send-otp", json={"phone": phone})
    assert otp_resp.status_code == 200
    assert otp_resp.json()["is_registered"] is True

    # 2. Verify OTP with correct code
    verify_resp = client.post(
        "/api/v1/auth/farmer/verify-otp", json={"phone": phone, "otp": "123456"}
    )
    assert verify_resp.status_code == 200
    token_data = verify_resp.json()
    assert "access_token" in token_data
    assert token_data["user"]["name"] == "Ramesh Patel"
    assert token_data["user"]["role"] == "farmer"
    assert token_data["user"]["farmer_profile"]["location"] == "Indore, Madhya Pradesh"

    # 3. Access protected /me route
    token = token_data["access_token"]
    me_resp = client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["phone"] == phone


def test_farmer_registration():
    new_phone = "9998887776"
    reg_resp = client.post(
        "/api/v1/auth/farmer/register",
        json={
            "phone": new_phone,
            "name": "Suresh Verma",
            "language_pref": "hi",
            "location": "Sehore, MP",
            "lat": 23.2000,
            "lng": 77.0800,
            "fpo_name": "Sehore Kisan Producer Co",
        },
    )
    assert reg_resp.status_code == 200
    data = reg_resp.json()
    assert data["user"]["name"] == "Suresh Verma"
    assert data["user"]["role"] == "farmer"
    assert data["user"]["farmer_profile"]["lat"] == 23.2000


def test_buyer_registration_and_login():
    email = "trader@agrihub.in"
    password = "securepassword123"

    # 1. Register buyer
    reg_resp = client.post(
        "/api/v1/auth/buyer/register",
        json={
            "email": email,
            "password": password,
            "name": "Vikram Singh",
            "business_name": "AgriHub Logistics & Mill",
            "phone": "9988776655",
            "language_pref": "en",
            "location": "Bhopal, MP",
            "lat": 23.2599,
            "lng": 77.4126,
        },
    )
    assert reg_resp.status_code == 200
    reg_data = reg_resp.json()
    assert reg_data["user"]["role"] == "buyer"
    assert (
        reg_data["user"]["buyer_profile"]["business_name"] == "AgriHub Logistics & Mill"
    )

    # 2. Login buyer
    login_resp = client.post(
        "/api/v1/auth/buyer/login", json={"email": email, "password": password}
    )
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()


def test_unauthorized_access():
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401
