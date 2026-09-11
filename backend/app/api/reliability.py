from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any

from app.core.database import db
from app.core.security import get_current_user
from app.models.schemas import UserOut, UserReliabilityScore

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/{user_id}/reliability", response_model=UserReliabilityScore)
async def get_user_reliability(
    user_id: str,
    current_user: UserOut = Depends(get_current_user)
):
    user = db.users.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # In a real app, query trade_agreements and ratings tables
    # Here we simulate the reliability score based on user role
    role = user.get("role", "farmer")

    # Calculate from demo trade agreements
    user_agreements = [
        ta for ta in db.trade_agreements.values()
        if ta.get("farmer_id") == user_id or ta.get("buyer_id") == user_id
    ]

    total_transactions = len(user_agreements)
    successful_transactions = sum(
        1 for ta in user_agreements if ta.get("status") == "completed"
    )

    # Calculate from ratings (if we had them seeded)
    user_ratings = [
        r for r in db.ratings.values() if r.get("ratee_id") == user_id
    ] if hasattr(db, "ratings") else []

    average_rating = sum(r.get("stars", 0) for r in user_ratings) / len(user_ratings) if user_ratings else 0.0

    if role == "farmer":
        quality_consistency = sum(r.get("quality_score", 0) for r in user_ratings if r.get("quality_score")) / len([r for r in user_ratings if r.get("quality_score")]) * 20 if user_ratings and any(r.get("quality_score") for r in user_ratings) else None
        return UserReliabilityScore(
            role=role,
            total_transactions=total_transactions,
            successful_transactions=successful_transactions,
            quality_consistency_percent=quality_consistency,
            average_rating=average_rating,
            verification_status=user.get("verified", False)
        )
    else:
        payment_reliability = sum(r.get("payment_or_reliability_score", 0) for r in user_ratings if r.get("payment_or_reliability_score")) / len([r for r in user_ratings if r.get("payment_or_reliability_score")]) * 20 if user_ratings and any(r.get("payment_or_reliability_score") for r in user_ratings) else None
        return UserReliabilityScore(
            role=role,
            total_transactions=total_transactions,
            successful_transactions=successful_transactions,
            payment_reliability_percent=payment_reliability,
            average_rating=average_rating,
            verification_status=user.get("verified", False)
        )
