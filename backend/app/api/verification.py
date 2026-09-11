import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any

from app.core.database import db
from app.core.security import get_current_user, require_role
from app.models.schemas import UserOut, UserRole, VerificationRequestCreate, VerificationRequestOut, VerificationDecision

router = APIRouter(prefix="/verification", tags=["Trust & Verification"])

# Initialize in-memory storage for verification requests if not exists
if not hasattr(db, "verification_requests"):
    db.verification_requests = {}

@router.post("/requests", response_model=VerificationRequestOut)
async def submit_verification_request(
    request_data: VerificationRequestCreate,
    current_user: UserOut = Depends(get_current_user)
):
    """Users submit documents to get verified."""
    req_id = f"v{uuid.uuid4().hex[:12]}"
    new_req = {
        "id": req_id,
        "user_id": current_user.id,
        "document_type": request_data.document_type,
        "document_url": request_data.document_url,
        "status": "pending",
        "admin_notes": None,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    }
    db.verification_requests[req_id] = new_req
    return new_req

@router.get("/admin/queue", response_model=List[VerificationRequestOut])
async def get_verification_queue(
    current_user: UserOut = Depends(require_role([UserRole.ADMIN]))
):
    """Admins view pending requests."""
    return [req for req in db.verification_requests.values() if req["status"] == "pending"]

@router.post("/admin/{request_id}/decide", response_model=VerificationRequestOut)
async def decide_verification(
    request_id: str,
    decision: VerificationDecision,
    current_user: UserOut = Depends(require_role([UserRole.ADMIN]))
):
    """Admins approve or reject verification requests."""
    req = db.verification_requests.get(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    req["status"] = decision.status
    req["admin_notes"] = decision.admin_notes
    req["updated_at"] = datetime.now()

    # If approved, update user's verified status
    if decision.status == "approved":
        user_id = req["user_id"]
        if user_id in db.users:
            db.users[user_id]["verified"] = True

            # also update business_verified if it's a buyer/fpo
            if "buyer_profiles" in db.__dict__ and user_id in db.buyer_profiles:
                db.buyer_profiles[user_id]["gst_verified"] = True

    return req
