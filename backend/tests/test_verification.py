from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_verification_endpoints_exist():
    response = client.get("/api/v1/verification/admin/queue")
    # Will be 401 because we aren't passing a valid admin token, which proves it's mounted
    assert response.status_code == 401

    response = client.post("/api/v1/verification/requests", json={"document_type": "aadhaar", "document_url": "http://example.com/doc"})
    assert response.status_code == 401
