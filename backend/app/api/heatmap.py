from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from app.core.database import db
from app.models.schemas import TradeStatus

router = APIRouter(prefix="/intelligence", tags=["Intelligence"])

@router.get("/heatmap", response_model=List[Dict[str, Any]])
async def get_heatmap_data(commodity: Optional[str] = Query(None)):
    buckets = {}

    # Process Listings
    for l in db.crop_listings.values():
        if commodity and l.get("crop_id") != commodity:
            continue
        lat = round(l.get("lat", 22.7196), 1)
        lng = round(l.get("lng", 75.8577), 1)
        key = f"{lat},{lng}"

        if key not in buckets:
            buckets[key] = {"lat": lat, "lng": lng, "volume": 0.0, "intensity": 0.0}

        buckets[key]["volume"] += float(l.get("quantity", 0))

    # Process Demands
    for d in db.demand_posts.values():
        if commodity and d.get("crop_id") != commodity:
            continue
        lat = round(d.get("lat", 22.7196), 1)
        lng = round(d.get("lng", 75.8577), 1)
        key = f"{lat},{lng}"

        if key not in buckets:
            buckets[key] = {"lat": lat, "lng": lng, "volume": 0.0, "intensity": 0.0}

        buckets[key]["volume"] += float(d.get("quantity_needed", 0))

    # Process Completed Trades for higher weighting
    for ta in db.trade_agreements.values():
        if ta.get("status") == TradeStatus.COMPLETED:
            match_id = ta.get("match_id")
            if match_id in db.matches:
                match = db.matches[match_id]
                listing_id = match.get("listing_id")
                listing = db.crop_listings.get(listing_id)
                if listing:
                    if commodity and listing.get("crop_id") != commodity:
                        continue
                    lat = round(listing.get("lat", 22.7196), 1)
                    lng = round(listing.get("lng", 75.8577), 1)
                    key = f"{lat},{lng}"
                    if key not in buckets:
                        buckets[key] = {"lat": lat, "lng": lng, "volume": 0.0, "intensity": 0.0}
                    # Add extra weight to trade volume (e.g., multiplier of 2)
                    buckets[key]["volume"] += float(ta.get("quantity", 0)) * 2

    # Calculate intensity
    max_vol = max([b["volume"] for b in buckets.values()]) if buckets else 1.0
    for b in buckets.values():
        b["intensity"] = round(min(b["volume"] / max_vol, 1.0), 2)

    return list(buckets.values())
