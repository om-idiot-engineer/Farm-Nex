import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_messaging_endpoints():
    # Setup test users
    buyer = {"email": "msgbuyer@test.com", "password": "securepassword"}
    client.post("/api/v1/auth/buyer/register", json={
        "email": buyer["email"],
        "phone": "9998887771",
        "password": buyer["password"],
        "name": "Msg Buyer",
        "business_name": "Msg Inc",
        "location": "Indore",
        "lat": 22.7,
        "lng": 75.8
    })
    b_login = client.post("/api/v1/auth/buyer/login", json=buyer)
    b_token = b_login.json()["access_token"]
    b_id = b_login.json()["user"]["id"]

    farmer = {"phone": "msgfarmer1234"}
    f_reg = client.post("/api/v1/auth/farmer/register", json={
        "phone": farmer["phone"],
        "name": "Msg Farmer",
        "location": "Dewas",
        "lat": 23.0,
        "lng": 76.0
    })
    f_token = f_reg.json()["access_token"]
    f_id = f_reg.json()["user"]["id"]

    # 1. Buyer creates conversation with Farmer
    res = client.post(
        "/api/v1/messages",
        json={"participantId": f_id},
        headers={"Authorization": f"Bearer {b_token}"}
    )
    assert res.status_code == 201
    conv = res.json()
    conv_id = conv["id"]
    assert conv["participantId"] == f_id

    # 2. Buyer sends message
    res = client.post(
        f"/api/v1/messages/{conv_id}",
        json={"body": "Hello farmer!", "kind": "text"},
        headers={"Authorization": f"Bearer {b_token}"}
    )
    assert res.status_code == 201
    msg1 = res.json()
    assert msg1["body"] == "Hello farmer!"

    # 3. Farmer gets conversations
    res = client.get(
        "/api/v1/messages",
        headers={"Authorization": f"Bearer {f_token}"}
    )
    assert res.status_code == 200
    convs = res.json()
    assert len(convs) == 1
    assert convs[0]["id"] == conv_id
    assert convs[0]["participantId"] == b_id
    assert convs[0]["messages"][0]["body"] == "Hello farmer!"

    # 4. Farmer sends reply with offerData
    res = client.post(
        f"/api/v1/messages/{conv_id}",
        json={
            "body": "Here is my offer",
            "kind": "offer",
            "offerData": {
                "rate": 2000,
                "quantity": 50,
                "pickup": "Farm Gate",
                "payment": "Immediate"
            }
        },
        headers={"Authorization": f"Bearer {f_token}"}
    )
    assert res.status_code == 201
    msg2 = res.json()
    assert msg2["offerData"]["rate"] == 2000
