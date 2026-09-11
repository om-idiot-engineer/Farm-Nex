from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_user
from app.core.database import db
from typing import List

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/users", response_model=List[dict])
async def search_users(
    q: str = Query("", description="Search query"),
    role: str = Query(None, description="Optional role filter"),
    current_user = Depends(get_current_user)
):
    """Search real users by name, phone, or location. Returns a list of user dicts with basic info."""
    if not q and not role:
        return []
    q_lower = q.lower().strip()
    results = []
    for user in db.users.values():
        if role and user.get("role") != role:
            continue
        name = user.get("name", "").lower()
        phone = user.get("phone", "").lower() if user.get("phone") else ""
        location = ""
        if user.get("role") == "farmer":
            profile = db.farmer_profiles.get(user["id"]) or {}
            location = profile.get("location", "").lower()
        elif user.get("role") == "buyer":
            profile = db.buyer_profiles.get(user["id"]) or {}
            location = profile.get("location", "").lower()
        user_id = str(user.get("id", "")).lower()
        if q_lower in name or q_lower in phone or q_lower in location or q_lower in user_id:
            results.append({
                "id": user.get("id"),
                "name": user.get("name"),
                "role": user.get("role"),
                "phone": user.get("phone"),
                "email": user.get("email"),
                "location": location,
            })
    return results[:50]
