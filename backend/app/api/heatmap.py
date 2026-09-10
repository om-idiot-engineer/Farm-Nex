from fastapi import APIRouter
from typing import List, Dict, Any
from app.core.database import db

router = APIRouter(prefix="/intelligence", tags=["Intelligence"])

@router.get("/heatmap", response_model=List[Dict[str, Any]])
async def get_heatmap_data():
    # Return aggregated data for heatmap
    data = []
    # Count demands and listings per location
    locations = {}
    
    for l in db.crop_listings.values():
        loc = l.get("location", "Unknown")
        lat = l.get("lat", 22.7196)
        lng = l.get("lng", 75.8577)
        if loc not in locations:
            locations[loc] = {"location": loc, "lat": lat, "lng": lng, "listings": 0, "demands": 0}
        locations[loc]["listings"] += 1

    for d in db.demand_posts.values():
        loc = d.get("location", "Unknown")
        lat = d.get("lat", 22.7196)
        lng = d.get("lng", 75.8577)
        if loc not in locations:
            locations[loc] = {"location": loc, "lat": lat, "lng": lng, "listings": 0, "demands": 0}
        locations[loc]["demands"] += 1

    return list(locations.values())
