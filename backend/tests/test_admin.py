from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_admin_kpis_endpoint():
    res = client.get("/api/v1/admin/stats")
    assert res.status_code == 200
    data = res.json()
    assert "total_active_listings" in data
    assert "total_active_demands" in data
    assert "total_matched_trades" in data
    assert "total_farmers_connected" in data
    assert "total_buyers_connected" in data
    assert "total_estimated_logistics_savings_inr" in data
    assert data["total_farmers_connected"] >= 1
    assert data["total_buyers_connected"] >= 3
    assert data["total_estimated_logistics_savings_inr"] > 0


def test_admin_map_nodes():
    res = client.get("/api/v1/admin/map-nodes")
    assert res.status_code == 200
    data = res.json()
    assert data["region"] == "Madhya Pradesh"
    assert "supply_nodes" in data
    assert "demand_nodes" in data
    assert len(data["demand_nodes"]) >= 3
    # Check demand node structure
    d_node = data["demand_nodes"][0]
    assert d_node["type"] == "demand"
    assert "lat" in d_node
    assert "lng" in d_node
