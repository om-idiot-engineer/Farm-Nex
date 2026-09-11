from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_agreements_endpoints_exist():
    # Because we haven't mocked auth here, we just expect 401 Unauthorized
    # instead of 404 Not Found, proving the router is mounted.
    response = client.patch("/api/v1/marketplace/agreements/test-id/delivery")
    assert response.status_code == 401

    response = client.patch("/api/v1/marketplace/agreements/test-id/payment")
    assert response.status_code == 401

    response = client.post("/api/v1/marketplace/agreements/test-id/rate", json={"stars": 5, "review": "Great"})
    assert response.status_code == 401
