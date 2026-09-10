import math
import uuid
from datetime import datetime, date, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.core.config import settings
from app.core.database import db
from app.core.security import get_current_user, require_role
from app.models.schemas import (
    UserOut,
    UserRole,
    MatchStatus,
    TradeStatus,
    LogisticsEstimate,
    MatchExplanation,
    BuyerMatchOpportunity,
    TradeAgreementOut,
    TradeEarningsBreakdown,
)

router = APIRouter(prefix="/matching", tags=["Buyer Matching"])

# ==========================================
# LOGISTICS CALCULATION HELPER
# ==========================================


def calculate_haversine_distance(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(d_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return max(round(distance, 1), 5.0)


def estimate_logistics(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
    quantity_quintals: float,
    origin_name: str = "",
    destination_name: str = "",
) -> LogisticsEstimate:
    dist_km = calculate_haversine_distance(lat1, lon1, lat2, lon2)
    base_rate = settings.FREIGHT_BASE_RATE_PER_QUINTAL_KM

    if dist_km <= 100:
        cost_per_quintal = dist_km * base_rate
    else:
        cost_per_quintal = (100 * base_rate) + ((dist_km - 100) * base_rate * 0.90)

    cost_per_quintal = max(cost_per_quintal, 25.0)
    total_cost = round(cost_per_quintal * quantity_quintals, 2)
    cost_per_quintal = round(cost_per_quintal, 2)
    duration_hours = round(2.0 + (dist_km / 35.0), 1)

    return LogisticsEstimate(
        distance_km=dist_km,
        duration_hours=duration_hours,
        rate_per_quintal_km=base_rate,
        total_logistics_cost=total_cost,
        cost_per_quintal=cost_per_quintal,
        origin=origin_name,
        destination=destination_name,
    )


# ==========================================
# MATCHING ENGINE
# ==========================================


def compute_matching_score(
    listing: Dict[str, Any],
    demand: Dict[str, Any],
    dist_km: float,
    net_realization_per_q: float,
) -> tuple[float, MatchExplanation, List[str]]:
    w = settings.MATCHING_WEIGHTS
    expected = listing.get("expected_price", 4000)
    offered = demand.get("offered_price", 4000)

    # 1. Net Realization Score
    if net_realization_per_q >= expected:
        net_score = 100.0
    else:
        net_score = max(
            0.0, 100.0 - ((expected - net_realization_per_q) / expected) * 200.0
        )

    # 2. Price Score
    if offered >= expected:
        price_score = min(100.0, 80.0 + ((offered - expected) / expected) * 100.0)
    else:
        price_score = max(0.0, 80.0 - ((expected - offered) / expected) * 200.0)

    # 3. Distance
    distance_score = max(0.0, 100.0 - (dist_km / 5.0))

    # 4. Quantity
    listing_qty = listing.get("quantity", 1)
    demand_qty = demand.get("quantity_needed", 1)
    qty_ratio = min(listing_qty, demand_qty) / max(listing_qty, demand_qty)
    quantity_score = round(qty_ratio * 100.0, 1)

    # 5. Quality
    grade_map = {"Grade A": 4, "Grade B": 3, "Grade C": 2, "FAQ": 1}
    g_listing = grade_map.get(listing.get("quality_grade", "Grade A"), 3)
    g_demand = grade_map.get(demand.get("quality_grade", "Grade A"), 3)
    if g_listing >= g_demand:
        quality_score = 100.0
    else:
        quality_score = max(50.0, 100.0 - (g_demand - g_listing) * 25.0)

    # 6. Reliability (Mocked for MVP)
    reliability_score = 90.0

    # 7. Availability
    availability_score = 95.0

    final_score = (
        w["net_realization"] * net_score
        + w["price"] * price_score
        + w["distance"] * distance_score
        + w["quantity"] * quantity_score
        + w["quality"] * quality_score
        + w["reliability"] * reliability_score
        + w["availability"] * availability_score
    )
    final_score = round(final_score, 1)

    why_this_offer = []
    if net_realization_per_q >= expected:
        why_this_offer.append("Net realization exceeds your minimum expectation.")
    if dist_km < 50:
        why_this_offer.append(f"Only {dist_km} km away.")
    if qty_ratio == 1.0:
        why_this_offer.append("Needs your full quantity.")

    explanation = MatchExplanation(
        net_realization_score=round(net_score, 1),
        price_score=round(price_score, 1),
        distance_score=round(distance_score, 1),
        quantity_score=round(quantity_score, 1),
        quality_score=round(quality_score, 1),
        reliability_score=round(reliability_score, 1),
        availability_score=round(availability_score, 1),
        weights=w,
        formula="Weights based on net realization, distance, and match precision",
    )

    return final_score, explanation, why_this_offer


# ==========================================
# API ENDPOINTS
# ==========================================


@router.get("/best-buyers/{listing_id}", response_model=List[BuyerMatchOpportunity])
async def get_best_buyers(
    listing_id: str, current_user: UserOut = Depends(get_current_user)
):
    listing = db.crop_listings.get(listing_id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Crop listing not found."
        )

    crop_id = listing["crop_id"]
    farmer_qty = listing["quantity"]

    opportunities: List[BuyerMatchOpportunity] = []

    for demand_id, demand in db.demand_posts.items():
        if demand["crop_id"] != crop_id:
            continue

        buyer = db.users.get(demand["buyer_id"], {})
        buyer_prof = db.buyer_profiles.get(demand["buyer_id"], {})

        logistics = estimate_logistics(
            lat1=listing["lat"],
            lon1=listing["lng"],
            lat2=demand["lat"],
            lon2=demand["lng"],
            quantity_quintals=farmer_qty,
            origin_name=listing["location"],
            destination_name=demand["location"],
        )

        offered_price = demand["offered_price"]
        freight_per_q = logistics.cost_per_quintal
        net_realization_per_q = round(offered_price - freight_per_q, 2)
        matched_qty = min(farmer_qty, demand["quantity_needed"])
        net_total = round(net_realization_per_q * matched_qty, 2)

        matching_score, explanation, why_this_offer = compute_matching_score(
            listing=listing,
            demand=demand,
            dist_km=logistics.distance_km,
            net_realization_per_q=net_realization_per_q,
        )

        # Add a couple of dynamic reasons based on buyer stats
        why_this_offer.append("Payment within 2 days")

        existing_match = next(
            (
                m
                for m in db.matches.values()
                if m["listing_id"] == listing_id and m["demand_id"] == demand_id
            ),
            None,
        )

        match_id = existing_match["id"] if existing_match else str(uuid.uuid4())
        match_status = (
            MatchStatus(existing_match["status"])
            if existing_match
            else MatchStatus.PROPOSED
        )

        if not existing_match:
            db.matches[match_id] = {
                "id": match_id,
                "listing_id": listing_id,
                "demand_id": demand_id,
                "matching_score": matching_score,
                "net_realization_estimate": net_realization_per_q,
                "logistics_cost_estimate": freight_per_q,
                "status": MatchStatus.PROPOSED.value,
                "created_at": datetime.now(),
            }

        opportunities.append(
            BuyerMatchOpportunity(
                match_id=match_id,
                demand_id=demand_id,
                buyer_id=demand["buyer_id"],
                buyer_name=buyer.get("name", "Verified Buyer"),
                business_name=buyer_prof.get(
                    "business_name", buyer.get("name", "Agri Buyer")
                ),
                buyer_verified=buyer.get("verified", True),
                crop_id=crop_id,
                quantity_demanded=demand["quantity_needed"],
                quantity_matched=matched_qty,
                offered_price_per_quintal=offered_price,
                distance_km=logistics.distance_km,
                estimated_logistics_per_quintal=freight_per_q,
                estimated_total_logistics=logistics.total_logistics_cost,
                net_realization_per_quintal=net_realization_per_q,
                net_total_realization=net_total,
                matching_score=matching_score,
                score_breakdown=explanation,
                why_this_offer=why_this_offer,
                status=match_status,
            )
        )

    opportunities.sort(key=lambda x: x.net_realization_per_quintal, reverse=True)
    return opportunities


@router.post(
    "/accept", response_model=TradeAgreementOut, status_code=status.HTTP_201_CREATED
)
async def accept_match(
    listing_id: str = Query(...),
    demand_id: str = Query(...),
    current_user: UserOut = Depends(require_role([UserRole.FARMER, UserRole.ADMIN])),
):
    listing = db.crop_listings.get(listing_id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Crop listing not found."
        )

    demand = db.demand_posts.get(demand_id)
    if not demand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Buyer demand post not found."
        )

    if listing["farmer_id"] != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to accept match for this listing.",
        )

    match_record = next(
        (
            m
            for m in db.matches.values()
            if m["listing_id"] == listing_id and m["demand_id"] == demand_id
        ),
        None,
    )
    if not match_record:
        match_id = str(uuid.uuid4())
        match_record = {
            "id": match_id,
            "listing_id": listing_id,
            "demand_id": demand_id,
            "matching_score": 85.0,
            "net_realization_estimate": demand["offered_price"],
            "logistics_cost_estimate": 100.0,
            "status": MatchStatus.ACCEPTED.value,
            "created_at": datetime.now(),
        }
        db.matches[match_id] = match_record
    else:
        match_record["status"] = MatchStatus.ACCEPTED.value

    listing["status"] = "matched"
    matched_qty = min(listing["quantity"], demand["quantity_needed"])
    price_per_q = demand["offered_price"]
    gross_value = round(matched_qty * price_per_q, 2)

    logistics = estimate_logistics(
        lat1=listing["lat"],
        lon1=listing["lng"],
        lat2=demand["lat"],
        lon2=demand["lng"],
        quantity_quintals=matched_qty,
    )
    total_freight = logistics.total_logistics_cost

    platform_fee = round(gross_value * settings.PLATFORM_FEE_PERCENTAGE, 2)
    net_earnings = round(gross_value - total_freight - platform_fee, 2)

    earnings = TradeEarningsBreakdown(
        gross_produce_value=gross_value,
        logistics_cost_deduction=total_freight,
        platform_fee=platform_fee,
        net_farmer_earnings=net_earnings,
    )

    agreement_id = str(uuid.uuid4())
    delivery_date = date.today() + timedelta(days=3)

    trade_agreement = {
        "id": agreement_id,
        "match_id": match_record["id"],
        "listing_id": listing_id,
        "demand_id": demand_id,
        "farmer_id": listing["farmer_id"],
        "farmer_name": current_user.name,
        "buyer_id": demand["buyer_id"],
        "buyer_name": demand.get("business_name") or "Verified Buyer",
        "commodity": listing["crop_id"],
        "quantity": matched_qty,
        "price": price_per_q,
        "delivery_date": delivery_date,
        "status": TradeStatus.MATCHED.value,  # Reset to beginning of lifecycle
        "earnings_breakdown": earnings.model_dump(),
        "created_at": datetime.now(),
    }
    db.trade_agreements[agreement_id] = trade_agreement

    return TradeAgreementOut(
        id=agreement_id,
        match_id=match_record["id"],
        listing_id=listing_id,
        demand_id=demand_id,
        farmer_id=listing["farmer_id"],
        farmer_name=current_user.name,
        buyer_id=demand["buyer_id"],
        buyer_name=trade_agreement["buyer_name"],
        crop_id=listing["crop_id"],
        quantity=matched_qty,
        price_per_quintal=price_per_q,
        delivery_date=delivery_date,
        status=TradeStatus.MATCHED,
        earnings_breakdown=earnings,
        created_at=trade_agreement["created_at"],
    )
