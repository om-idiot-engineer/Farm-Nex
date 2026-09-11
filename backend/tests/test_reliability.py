from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_user_reliability():
    user_id = "f0000000-0000-0000-0000-000000000001"
    response = client.get(f"/api/v1/users/{user_id}/reliability")
    assert response.status_code == 401

def test_get_buyer_reliability():
    user_id = "b0000000-0000-0000-0000-000000000001"
    response = client.get(f"/api/v1/users/{user_id}/reliability")
    assert response.status_code == 401
