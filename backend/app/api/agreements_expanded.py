from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from app.core.database import db
from app.core.security import get_current_user
from app.models.schemas import UserOut

router = APIRouter(prefix="/marketplace/agreements", tags=["Marketplace"])

@router.patch("/{agreement_id}/delivery", response_model=Dict[str, Any])
async def confirm_delivery(
    agreement_id: str,
    current_user: UserOut = Depends(get_current_user)
):
    agreement = db.trade_agreements.get(agreement_id)
    if not agreement:
        raise HTTPException(status_code=404, detail="Agreement not found")

    # Allow buyer to confirm delivery
    if agreement["buyer_id"] != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    agreement["status"] = "delivered"
    return agreement

@router.patch("/{agreement_id}/payment", response_model=Dict[str, Any])
async def confirm_payment(
    agreement_id: str,
    current_user: UserOut = Depends(get_current_user)
):
    agreement = db.trade_agreements.get(agreement_id)
    if not agreement:
        raise HTTPException(status_code=404, detail="Agreement not found")

    # Allow farmer to confirm payment
    if agreement["farmer_id"] != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    agreement["status"] = "completed"
    return agreement

from pydantic import BaseModel
from typing import Optional

class RatingCreate(BaseModel):
    stars: int
    review: str
    quality_score: Optional[int] = None
    payment_or_reliability_score: Optional[int] = None

@router.post("/{agreement_id}/rate", response_model=Dict[str, Any])
async def rate_transaction(
    agreement_id: str,
    payload: RatingCreate,
    current_user: UserOut = Depends(get_current_user)
):
    agreement = db.trade_agreements.get(agreement_id)
    if not agreement:
        raise HTTPException(status_code=404, detail="Agreement not found")

    if agreement["status"] != "completed":
        raise HTTPException(status_code=400, detail="Can only rate completed agreements")

    import uuid
    rating_id = str(uuid.uuid4())

    # Determine who is being rated
    if current_user.id == agreement["farmer_id"]:
        ratee_id = agreement["buyer_id"]
    elif current_user.id == agreement["buyer_id"]:
        ratee_id = agreement["farmer_id"]
    else:
        raise HTTPException(status_code=403, detail="Not a party to this agreement")

    rating = {
        "id": rating_id,
        "agreement_id": agreement_id,
        "rater_id": current_user.id,
        "ratee_id": ratee_id,
        "stars": payload.stars,
        "quality_score": payload.quality_score,
        "payment_or_reliability_score": payload.payment_or_reliability_score,
        "review": payload.review
    }

    if not hasattr(db, 'ratings'):
        db.ratings = {}

    db.ratings[rating_id] = rating
    return rating
