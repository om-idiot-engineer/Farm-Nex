from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_price_trend_endpoint():
    res = client.get(
        "/api/v1/intelligence/price-trend?commodity=soybean&region=Madhya%20Pradesh&timeframe=6m"
    )
    assert res.status_code == 200
    data = res.json()
    assert data["commodity"] == "soybean"
    assert data["region"] == "Madhya Pradesh"
    assert (
        len(data["history"]) > 50
    ), "Expected at least 50 historical points for 6-month timeframe"
    first_pt = data["history"][0]
    assert "date" in first_pt
    assert "price" in first_pt
    assert first_pt["price"] > 4000.0  # Soybean MP range ~₹4,500-₹5,200


def test_demand_forecast_endpoint_transparency():
    res = client.get(
        "/api/v1/intelligence/demand-forecast?commodity=soybean&region=Madhya%20Pradesh"
    )
    assert res.status_code == 200
    data = res.json()
    assert data["commodity"] == "soybean"
    assert data["forecasted_next_30d_price"] > 0
    assert data["price_direction"] in ["upward", "stable", "downward"]
    # Check transparency guarantee
    assert "alpha = 0.3" in data["methodology"]
    assert "30-Day Moving Average" in data["methodology"]
    assert "Agmarknet" in data["explanation"]
    assert "ExpSmooth" in data["formula"]


def test_why_price_moved_rule_based_explainer():
    res = client.get(
        "/api/v1/intelligence/why-price-moved?commodity=wheat&region=Madhya%20Pradesh"
    )
    assert res.status_code == 200
    data = res.json()
    assert data["commodity"] == "wheat"
    assert "period_change_percentage" in data
    assert len(data["primary_factors"]) >= 2
    assert "Rule-Based Heuristic" in data["confidence_label"]
    assert "Not an unverified causal ML black-box" in data["disclaimer"]
