import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.core.database import db
from app.core.security import get_current_user, require_role
from app.models.schemas import (
    UserOut,
    UserRole,
    CropListingStatus,
    CropListingCreate,
    CropListingOut,
    DemandPostCreate,
    DemandPostOut,
    TradeStatus,
)

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])

# ==========================================
# CROP LISTINGS (Farmer Concern)
# ==========================================


@router.post(
    "/listings", response_model=CropListingOut, status_code=status.HTTP_201_CREATED
)
async def create_crop_listing(
    payload: CropListingCreate,
    current_user: UserOut = Depends(require_role([UserRole.FARMER, UserRole.ADMIN])),
):
    """
    Creates a new crop listing for a farmer.
    Validates commodity, positive quantity, future or valid harvest date, and expected price.
    """
    if payload.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Crop quantity must be greater than 0 quintals.",
        )
    if payload.expected_price <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Expected price must be greater than ₹0 per quintal.",
        )

    listing_id = str(uuid.uuid4())
    now = datetime.now()

    new_listing = {
        "id": listing_id,
        "farmer_id": current_user.id,
        "farmer_name": current_user.name,
        "crop_id": payload.crop_id,
        "quantity": float(payload.quantity),
        "quality_grade": payload.quality_grade.value,
        "harvest_date": payload.harvest_date,
        "location": payload.location.strip(),
        "lat": payload.lat,
        "lng": payload.lng,
        "expected_price": float(payload.expected_price),
        "photo_url": payload.photo_url,
        "status": CropListingStatus.LISTED.value,
        "created_at": now,
    }

    db.crop_listings[listing_id] = new_listing

    return CropListingOut(
        id=new_listing["id"],
        farmer_id=new_listing["farmer_id"],
        farmer_name=new_listing["farmer_name"],
        crop_id=new_listing["crop_id"],
        quantity=new_listing["quantity"],
        quality_grade=new_listing["quality_grade"],
        harvest_date=new_listing["harvest_date"],
        location=new_listing["location"],
        lat=new_listing["lat"],
        lng=new_listing["lng"],
        expected_price=new_listing["expected_price"],
        photo_url=new_listing.get("photo_url"),
        status=CropListingStatus(new_listing["status"]),
        created_at=new_listing["created_at"],
    )


@router.get("/listings", response_model=List[CropListingOut])
async def list_all_crop_listings(
    crop_id: Optional[str] = Query(
        None, description="Filter by crop commodity"
    ),
    status: Optional[CropListingStatus] = Query(None, description="Filter by status"),
):
    """
    Publicly browsable marketplace listings.
    """
    results: List[CropListingOut] = []
    for item in db.crop_listings.values():
        if crop_id and item["crop_id"] != crop_id:
            continue
        if status and item["status"] != status.value:
            continue

        results.append(
            CropListingOut(
                id=item["id"],
                farmer_id=item["farmer_id"],
                farmer_name=item.get("farmer_name")
                or db.users.get(item["farmer_id"], {}).get("name", "Farmer"),
                crop_id=item["crop_id"],
                quantity=item["quantity"],
                quality_grade=item["quality_grade"],
                harvest_date=item["harvest_date"],
                location=item["location"],
                lat=item["lat"],
                lng=item["lng"],
                expected_price=item["expected_price"],
                photo_url=item.get("photo_url"),
                status=CropListingStatus(item["status"]),
                created_at=item["created_at"],
            )
        )

    # Sort latest first
    results.sort(key=lambda x: x.created_at, reverse=True)
    return results


@router.get("/listings/my", response_model=List[CropListingOut])
async def get_my_crop_listings(
    current_user: UserOut = Depends(get_current_user)
):
    """
    Fetches listings belonging to the authenticated farmer.
    """
    if current_user.role not in [UserRole.FARMER, UserRole.ADMIN]:
        return []

    my_listings = [
        CropListingOut(
            id=item["id"],
            farmer_id=item["farmer_id"],
            farmer_name=current_user.name,
            crop_id=item["crop_id"],
            quantity=item["quantity"],
            quality_grade=item["quality_grade"],
            harvest_date=item["harvest_date"],
            location=item["location"],
            lat=item["lat"],
            lng=item["lng"],
            expected_price=item["expected_price"],
            photo_url=item.get("photo_url"),
            status=CropListingStatus(item["status"]),
            created_at=item["created_at"],
        )
        for item in db.crop_listings.values()
        if item["farmer_id"] == current_user.id
    ]
    my_listings.sort(key=lambda x: x.created_at, reverse=True)
    return my_listings


@router.delete("/listings/{listing_id}", status_code=status.HTTP_200_OK)
async def delete_crop_listing(
    listing_id: str,
    current_user: UserOut = Depends(require_role([UserRole.FARMER, UserRole.ADMIN])),
):
    """
    Farmers can withdraw or delete their own listing.
    """
    listing = db.crop_listings.get(listing_id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found."
        )

    # RLS ownership check: only owner or admin can delete
    if listing["farmer_id"] != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this listing.",
        )

    del db.crop_listings[listing_id]
    return {"success": True, "message": "Listing deleted successfully."}


# ==========================================
# DEMAND POSTS (Buyer Concern)
# ==========================================


@router.post(
    "/demands", response_model=DemandPostOut, status_code=status.HTTP_201_CREATED
)
async def create_demand_post(
    payload: DemandPostCreate,
    current_user: UserOut = Depends(require_role([UserRole.BUYER, UserRole.ADMIN])),
):
    """
    Creates a new bulk procurement demand post for a buyer.
    """
    if payload.quantity_needed <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Quantity needed must be greater than 0 quintals.",
        )
    if payload.offered_price <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Offered price must be greater than ₹0 per quintal.",
        )

    demand_id = str(uuid.uuid4())
    now = datetime.now()

    business_name = None
    if current_user.buyer_profile:
        business_name = current_user.buyer_profile.business_name

    new_demand = {
        "id": demand_id,
        "buyer_id": current_user.id,
        "buyer_name": current_user.name,
        "business_name": business_name or current_user.name,
        "crop_id": payload.crop_id,
        "quantity_needed": float(payload.quantity_needed),
        "quality_grade": payload.quality_grade.value,
        "offered_price": float(payload.offered_price),
        "location": payload.location.strip(),
        "lat": payload.lat,
        "lng": payload.lng,
        "created_at": now,
    }

    db.demand_posts[demand_id] = new_demand

    return DemandPostOut(
        id=new_demand["id"],
        buyer_id=new_demand["buyer_id"],
        buyer_name=new_demand["buyer_name"],
        business_name=new_demand["business_name"],
        crop_id=new_demand["crop_id"],
        quantity_needed=new_demand["quantity_needed"],
        quality_grade=new_demand["quality_grade"],
        offered_price=new_demand["offered_price"],
        location=new_demand["location"],
        lat=new_demand["lat"],
        lng=new_demand["lng"],
        created_at=new_demand["created_at"],
    )


@router.get("/demands", response_model=List[DemandPostOut])
async def list_all_demands(
    crop_id: Optional[str] = Query(None, description="Filter by crop commodity")
):
    """
    Returns all active buyer demand posts.
    """
    results: List[DemandPostOut] = []
    for item in db.demand_posts.values():
        if crop_id and item["crop_id"] != crop_id:
            continue

        results.append(
            DemandPostOut(
                id=item["id"],
                buyer_id=item["buyer_id"],
                buyer_name=item.get("buyer_name")
                or db.users.get(item["buyer_id"], {}).get("name", "Buyer"),
                business_name=item.get("business_name")
                or db.buyer_profiles.get(item["buyer_id"], {}).get("business_name"),
                crop_id=item["crop_id"],
                quantity_needed=item["quantity_needed"],
                quality_grade=item["quality_grade"],
                offered_price=item["offered_price"],
                location=item["location"],
                lat=item["lat"],
                lng=item["lng"],
                created_at=item["created_at"],
            )
        )

    results.sort(key=lambda x: x.created_at, reverse=True)
    return results


@router.get("/demands/my", response_model=List[DemandPostOut])
async def get_my_demands(
    current_user: UserOut = Depends(get_current_user)
):
    """
    Returns demand requirements posted by the authenticated buyer.
    """
    if current_user.role not in [UserRole.BUYER, UserRole.ADMIN]:
        return []

    my_demands = [
        DemandPostOut(
            id=item["id"],
            buyer_id=item["buyer_id"],
            buyer_name=current_user.name,
            business_name=(
                current_user.buyer_profile.business_name
                if current_user.buyer_profile
                else current_user.name
            ),
            crop_id=item["crop_id"],
            quantity_needed=item["quantity_needed"],
            quality_grade=item["quality_grade"],
            offered_price=item["offered_price"],
            location=item["location"],
            lat=item["lat"],
            lng=item["lng"],
            created_at=item["created_at"],
        )
        for item in db.demand_posts.values()
        if item["buyer_id"] == current_user.id
    ]
    my_demands.sort(key=lambda x: x.created_at, reverse=True)
    return my_demands


@router.delete("/demands/{demand_id}", status_code=status.HTTP_200_OK)
async def delete_demand_post(
    demand_id: str,
    current_user: UserOut = Depends(require_role([UserRole.BUYER, UserRole.ADMIN])),
):
    """
    Buyers can cancel their procurement demand post.
    """
    demand = db.demand_posts.get(demand_id)
    if not demand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Demand post not found."
        )

    # RLS check: only owner or admin can delete
    if demand["buyer_id"] != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this demand post.",
        )

    del db.demand_posts[demand_id]
    return {"success": True, "message": "Demand post deleted successfully."}


# ==========================================
# TRADE AGREEMENTS (Order Tracking Concern)
# ==========================================


@router.get("/agreements", response_model=List[dict])
async def list_user_agreements(current_user: UserOut = Depends(get_current_user)):
    """
    Fetches all active trade agreements for the current farmer or buyer.
    """
    results = []
    for item in db.trade_agreements.values():
        if (
            current_user.role == UserRole.ADMIN
            or item["farmer_id"] == current_user.id
            or item["buyer_id"] == current_user.id
        ):
            results.append(item)
    results.sort(key=lambda x: x["created_at"], reverse=True)
    return results


@router.get("/agreements/{agreement_id}", response_model=dict)
async def get_agreement_detail(
    agreement_id: str, current_user: UserOut = Depends(get_current_user)
):
    """
    Returns single trade agreement details.
    """
    agreement = db.trade_agreements.get(agreement_id)
    if not agreement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Trade agreement not found."
        )

    # RLS check: only participants or admin can view
    if (
        agreement["farmer_id"] != current_user.id
        and agreement["buyer_id"] != current_user.id
        and current_user.role != UserRole.ADMIN
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this agreement.",
        )

    return agreement


@router.patch("/agreements/{agreement_id}/status", response_model=dict)
async def update_agreement_status(
    agreement_id: str,
    new_status: TradeStatus = Query(
        ..., description="The new status in the trade lifecycle"
    ),
    current_user: UserOut = Depends(get_current_user),
):
    """
    Advances trade agreement status through the real trade lifecycle:
    matched -> trade_confirmed -> pickup_scheduled -> pickup_completed -> in_transit -> delivered -> payment_confirmed -> completed
    """
    agreement = db.trade_agreements.get(agreement_id)
    if not agreement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Trade agreement not found."
        )

    # State transition validation mapping
    state_machine = {
        TradeStatus.MATCHED: [TradeStatus.TRADE_CONFIRMED],
        TradeStatus.TRADE_CONFIRMED: [TradeStatus.PICKUP_SCHEDULED],
        TradeStatus.PICKUP_SCHEDULED: [TradeStatus.PICKUP_COMPLETED],
        TradeStatus.PICKUP_COMPLETED: [TradeStatus.IN_TRANSIT],
        TradeStatus.IN_TRANSIT: [TradeStatus.DELIVERED],
        TradeStatus.DELIVERED: [TradeStatus.PAYMENT_CONFIRMED],
        TradeStatus.PAYMENT_CONFIRMED: [TradeStatus.COMPLETED],
        TradeStatus.COMPLETED: [],
    }

    current_status = TradeStatus(agreement["status"])
    if new_status not in state_machine.get(current_status, []):
        # Allow backward movement or admin overrides if needed, but strict for now
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid transition from {current_status} to {new_status}",
            )

    agreement["status"] = new_status.value

    # Synchronize crop listing status for backward compatibility
    listing = db.crop_listings.get(agreement.get("listing_id"))
    if listing:
        if new_status in [TradeStatus.PICKUP_COMPLETED, TradeStatus.IN_TRANSIT]:
            listing["status"] = "in_transit"
        elif new_status in [
            TradeStatus.DELIVERED,
            TradeStatus.PAYMENT_CONFIRMED,
            TradeStatus.COMPLETED,
        ]:
            listing["status"] = "delivered"

    return agreement
