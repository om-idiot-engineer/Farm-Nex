from datetime import date, timedelta
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_tokens():
    f_res = client.post(
        "/api/v1/auth/farmer/verify-otp", json={"phone": "9876543210", "otp": "123456"}
    )
    farmer_token = f_res.json()["access_token"]
    return farmer_token


def test_trade_agreement_lifecycle_and_status_advancement():
    farmer_token = get_tokens()

    # Create listing & accept
    l_res = client.post(
        "/api/v1/marketplace/listings",
        headers={"Authorization": f"Bearer {farmer_token}"},
        json={
            "commodity": "soybean",
            "quantity": 100.0,
            "quality_grade": "Grade A",
            "harvest_date": (date.today() + timedelta(days=5)).isoformat(),
            "location": "Indore, MP",
            "lat": 22.7196,
            "lng": 75.8577,
            "expected_price": 4800.0,
        },
    )
    listing_id = l_res.json()["id"]
    opps = client.get(
        f"/api/v1/matching/best-buyers/{listing_id}",
        headers={"Authorization": f"Bearer {farmer_token}"},
    ).json()
    demand_id = opps[0]["demand_id"]

    agree_res = client.post(
        f"/api/v1/matching/accept?listing_id={listing_id}&demand_id={demand_id}",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    agreement_id = agree_res.json()["id"]

    # 1. Verify listed in /agreements
    all_agrees = client.get(
        "/api/v1/marketplace/agreements",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    assert all_agrees.status_code == 200
    assert any(a["id"] == agreement_id for a in all_agrees.json())

    # 2. Advance status: matched -> trade_confirmed
    step1 = client.patch(
        f"/api/v1/marketplace/agreements/{agreement_id}/status?new_status=trade_confirmed",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    assert step1.status_code == 200
    assert step1.json()["status"] == "trade_confirmed"

    # 3. Advance status: trade_confirmed -> pickup_scheduled
    step2 = client.patch(
        f"/api/v1/marketplace/agreements/{agreement_id}/status?new_status=pickup_scheduled",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    assert step2.status_code == 200
    assert step2.json()["status"] == "pickup_scheduled"

    # 4. Advance status: pickup_scheduled -> pickup_completed
    step3 = client.patch(
        f"/api/v1/marketplace/agreements/{agreement_id}/status?new_status=pickup_completed",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    assert step3.status_code == 200
    assert step3.json()["status"] == "pickup_completed"

    # 5. Advance status: pickup_completed -> in_transit
    step4 = client.patch(
        f"/api/v1/marketplace/agreements/{agreement_id}/status?new_status=in_transit",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    assert step4.status_code == 200
    assert step4.json()["status"] == "in_transit"

    # 6. Advance status: in_transit -> delivered
    step5 = client.patch(
        f"/api/v1/marketplace/agreements/{agreement_id}/status?new_status=delivered",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    assert step5.status_code == 200
    assert step5.json()["status"] == "delivered"

    # 7. Advance status: delivered -> payment_confirmed
    step6 = client.patch(
        f"/api/v1/marketplace/agreements/{agreement_id}/status?new_status=payment_confirmed",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    assert step6.status_code == 200
    assert step6.json()["status"] == "payment_confirmed"

    # 8. Advance status: payment_confirmed -> completed
    step7 = client.patch(
        f"/api/v1/marketplace/agreements/{agreement_id}/status?new_status=completed",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    assert step7.status_code == 200
    assert step7.json()["status"] == "completed"


def test_community_post_and_reply_flow():
    farmer_token = get_tokens()

    # 1. Create Question post
    post_res = client.post(
        "/api/v1/community/posts",
        headers={"Authorization": f"Bearer {farmer_token}"},
        json={
            "tag": "question",
            "content": "What is the best moisture percentage when harvesting Soybean for oil mills?",
        },
    )
    assert post_res.status_code == 201
    post_id = post_res.json()["id"]

    # 2. Add reply
    reply_res = client.post(
        f"/api/v1/community/posts/{post_id}/reply",
        headers={"Authorization": f"Bearer {farmer_token}"},
        json={
            "content": "Optimal moisture level is between 10% and 12% to prevent dockage."
        },
    )
    assert reply_res.status_code == 201

    # 3. Fetch filtered by tag
    feed = client.get("/api/v1/community/posts?tag=question")
    assert feed.status_code == 200
    assert any(p["id"] == post_id for p in feed.json())
