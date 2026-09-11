from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_heatmap_data():
    response = client.get("/api/v1/intelligence/heatmap")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "lat" in data[0]
        assert "lng" in data[0]
        assert "volume" in data[0]
        assert "intensity" in data[0]

def test_get_heatmap_data_with_commodity():
    response = client.get("/api/v1/intelligence/heatmap?commodity=c0000000-0000-0000-0000-000000000001")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
