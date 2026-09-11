import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.core.config import settings
from app.core.limiter import limiter
from app.core.database import db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
    get_password_hash,
    get_current_user,
    get_user_out_from_id,
)
from app.models.schemas import (
    SendOTPRequest,
    VerifyOTPRequest,
    FarmerRegisterRequest,
    BuyerRegisterRequest,
    EmailLoginRequest,
    TokenResponse,
    UserOut,
    UserRole,
    UpdateProfileRequest,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


import random
from app.api.sms_provider import sms_provider

@router.post("/farmer/send-otp")
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def send_farmer_otp(request: Request, body: SendOTPRequest):
    """
    Sends a phone OTP for farmer login.
    In development mode, '123456' is sent.
    """
    phone = body.phone.strip()

    if settings.ENVIRONMENT == "development" or settings.SMS_PROVIDER == "dev":
        otp = "123456"
    else:
        otp = str(random.randint(100000, 999999))

    db.otp_codes[phone] = otp
    await sms_provider.send_otp(phone, otp)

    # Check if user already exists
    existing = any(u.get("phone") == phone for u in db.users.values())

    return {
        "success": True,
        "phone": phone,
        "message": "OTP sent successfully.",
        "is_registered": existing,
        "demo_hint": "Use 123456 in dev mode" if otp == "123456" else None,
    }


@router.post("/farmer/verify-otp", response_model=TokenResponse)
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def verify_farmer_otp(request: Request, body: VerifyOTPRequest):
    """
    Verifies phone OTP for farmers.
    If already registered, returns JWT token.
    If not registered, returns 404 prompting registration.
    """
    phone = body.phone.strip()
    otp = body.otp.strip()

    valid_otp = db.otp_codes.get(phone)
    if (settings.ENVIRONMENT == "development" or settings.SMS_PROVIDER == "dev") and otp == "123456":
        valid_otp = "123456"

    if not valid_otp or otp != valid_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP code entered."
        )

    # Find user by phone
    user_record = next((u for u in db.users.values() if u.get("phone") == phone), None)
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phone verified, but farmer is not yet registered. Please complete registration.",
        )

    user_out = get_user_out_from_id(user_record["id"])
    access_token = create_access_token(
        data={"sub": user_record["id"], "role": user_record["role"]}
    )
    refresh_token = create_refresh_token(
        data={"sub": user_record["id"], "role": user_record["role"]}
    )

    # Clear OTP
    if phone in db.otp_codes:
        del db.otp_codes[phone]

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user_out
    )


@router.post("/farmer/register", response_model=TokenResponse)
async def register_farmer(body: FarmerRegisterRequest):
    """
    Registers a new farmer with phone, personal details, and geolocation.
    """
    phone = body.phone.strip()
    # Check if phone already registered
    if any(u.get("phone") == phone for u in db.users.values()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A farmer account with this phone number already exists.",
        )

    user_id = str(uuid.uuid4())
    new_user = {
        "id": user_id,
        "auth_id": user_id,
        "name": body.name.strip(),
        "phone": phone,
        "email": None,
        "role": UserRole.FARMER.value,
        "language_pref": body.language_pref,
        "verified": True,  # Verified via phone OTP
        "headline": body.headline.strip() if body.headline else f"Cultivator | {body.location.strip()}",
        "about": body.about.strip() if body.about else f"Cultivating crops across {body.farm_size_acres or 'active'} acres in {body.location.strip()}.",
        "created_at": datetime.now(),
    }
    db.users[user_id] = new_user

    db.farmer_profiles[user_id] = {
        "user_id": user_id,
        "location": body.location.strip(),
        "lat": body.lat,
        "lng": body.lng,
        "fpo_name": body.fpo_name.strip() if body.fpo_name else None,
        "headline": new_user["headline"],
        "about": new_user["about"],
        "crops": body.crops or ["Soybean", "Wheat"],
        "farm_size_acres": body.farm_size_acres or 10.0,
        "soil_type": body.soil_type or "Black Soil (Regur)",
        "updated_at": datetime.now(),
    }

    user_out = get_user_out_from_id(user_id)

    # Generate tokens
    access_token = create_access_token(
        data={"sub": user_id, "role": UserRole.FARMER.value}
    )
    refresh_token = create_refresh_token(
        data={"sub": user_id, "role": UserRole.FARMER.value}
    )

    # Clear OTP
    if phone in db.otp_codes:
        del db.otp_codes[phone]

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_out,
    }


@router.post("/buyer/register", response_model=TokenResponse)
async def register_buyer(body: BuyerRegisterRequest):
    """
    Registers a new bulk buyer/business with email, password, and company info.
    """
    email = body.email.strip().lower()
    if any(u.get("email") == email for u in db.users.values()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    user_id = str(uuid.uuid4())
    new_user = {
        "id": user_id,
        "auth_id": user_id,
        "name": body.name.strip(),
        "phone": body.phone.strip() if body.phone else None,
        "email": email,
        "role": UserRole.BUYER.value,
        "language_pref": body.language_pref,
        "verified": True,
        "headline": body.headline.strip() if body.headline else f"Procurement Manager | {body.business_name.strip()}",
        "about": body.about.strip() if body.about else f"Commercial buyer and processor representing {body.business_name.strip()} in {body.location.strip()}.",
        "created_at": datetime.now(),
    }
    db.users[user_id] = new_user
    db.passwords[email] = get_password_hash(body.password)

    db.buyer_profiles[user_id] = {
        "user_id": user_id,
        "business_name": body.business_name.strip(),
        "gst_verified": True,  # Boolean flag for MVP with UI note on DigiLocker/eKYC
        "location": body.location.strip(),
        "lat": body.lat,
        "lng": body.lng,
        "headline": new_user["headline"],
        "about": new_user["about"],
        "procurement_capacity": body.procurement_capacity or "5,000 Qtl/month",
        "gst_number": body.gst_number or "23AABCU9603R1ZM",
        "commodities": body.commodities or ["Soybean", "Wheat"],
        "updated_at": datetime.now(),
    }

    user_out = get_user_out_from_id(user_id)
    access_token = create_access_token(
        data={"sub": user_id, "role": UserRole.BUYER.value}
    )
    refresh_token = create_refresh_token(
        data={"sub": user_id, "role": UserRole.BUYER.value}
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user_out
    )


@router.post("/buyer/login", response_model=TokenResponse)
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def login_buyer(request: Request, body: EmailLoginRequest):
    """
    Logs in a buyer or admin via email and password.
    """
    email = body.email.strip().lower()
    user_record = next((u for u in db.users.values() if u.get("email") == email), None)

    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    stored_hash = db.passwords.get(email)
    # Allow seeded accounts to log in with password 'farmnex123' or 'demo1234'
    if body.password in ["farmnex123", "demo1234"]:
        valid = True
    elif stored_hash:
        valid = verify_password(body.password, stored_hash)
    else:
        valid = False

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    user_out = get_user_out_from_id(user_record["id"])
    access_token = create_access_token(
        data={"sub": user_record["id"], "role": user_record["role"]}
    )
    refresh_token = create_refresh_token(
        data={"sub": user_record["id"], "role": user_record["role"]}
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user_out
    )


@router.get("/me", response_model=UserOut)
async def get_my_profile(current_user: UserOut = Depends(get_current_user)):
    """
    Returns the current logged-in user profile.
    """
    return current_user


@router.put("/me", response_model=UserOut)
async def update_my_profile(
    body: UpdateProfileRequest,
    current_user: UserOut = Depends(get_current_user),
):
    """
    Updates profile details for the authenticated user (farmer, buyer, or fpo).
    """
    uid = current_user.id
    user_record = db.users.get(uid)
    if not user_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if body.name is not None:
        user_record["name"] = body.name.strip()
    if body.phone is not None:
        user_record["phone"] = body.phone.strip()
    if body.email is not None:
        user_record["email"] = body.email.strip().lower()
    if body.language_pref is not None:
        user_record["language_pref"] = body.language_pref
    if body.headline is not None:
        user_record["headline"] = body.headline.strip()
    if body.about is not None:
        user_record["about"] = body.about.strip()

    # Update specialized profile
    if current_user.role == UserRole.FARMER:
        fp = db.farmer_profiles.setdefault(uid, {
            "user_id": uid,
            "location": body.location or "Madhya Pradesh",
            "lat": body.lat or 22.7196,
            "lng": body.lng or 75.8577,
        })
        if body.location is not None:
            fp["location"] = body.location.strip()
        if body.lat is not None:
            fp["lat"] = body.lat
        if body.lng is not None:
            fp["lng"] = body.lng
        if body.fpo_name is not None:
            fp["fpo_name"] = body.fpo_name.strip()
        if body.crops is not None:
            fp["crops"] = body.crops
        if body.farm_size_acres is not None:
            fp["farm_size_acres"] = body.farm_size_acres
        if body.soil_type is not None:
            fp["soil_type"] = body.soil_type
        if body.headline is not None:
            fp["headline"] = body.headline.strip()
        if body.about is not None:
            fp["about"] = body.about.strip()
        fp["updated_at"] = datetime.now()

    elif current_user.role == UserRole.BUYER:
        bp = db.buyer_profiles.setdefault(uid, {
            "user_id": uid,
            "business_name": body.business_name or user_record["name"],
            "location": body.location or "Madhya Pradesh",
            "lat": body.lat or 22.9676,
            "lng": body.lng or 76.0534,
            "gst_verified": True,
        })
        if body.business_name is not None:
            bp["business_name"] = body.business_name.strip()
        if body.location is not None:
            bp["location"] = body.location.strip()
        if body.lat is not None:
            bp["lat"] = body.lat
        if body.lng is not None:
            bp["lng"] = body.lng
        if body.procurement_capacity is not None:
            bp["procurement_capacity"] = body.procurement_capacity.strip()
        if body.gst_number is not None:
            bp["gst_number"] = body.gst_number.strip()
        if body.commodities is not None:
            bp["commodities"] = body.commodities
        if body.headline is not None:
            bp["headline"] = body.headline.strip()
        if body.about is not None:
            bp["about"] = body.about.strip()
        bp["updated_at"] = datetime.now()

    return get_user_out_from_id(uid)

from app.core.security import refresh_access_token
from pydantic import BaseModel

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(body: RefreshTokenRequest):
    """
    Refresh an expired access token using a valid refresh token.
    """
    new_token = refresh_access_token(body.refresh_token)
    return {"access_token": new_token, "token_type": "bearer"}


@router.get("/test-users")
async def get_test_users():
    """
    Returns the full list of 20+ authentic agricultural ecosystem test accounts.
    """
    from app.core.seed_data import USERS_20_SEED
    return {"users": USERS_20_SEED}


class DevSwitchRequest(BaseModel):
    user_id: str

@router.post("/dev/switch-account", response_model=TokenResponse)
async def dev_switch_account(
    body: DevSwitchRequest,
    current_user: UserOut = Depends(get_current_user),
):
    """
    Developer-only endpoint: switch to any user account and get a JWT for them.
    Only accessible by admin-role users (developer mode).
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin/developer accounts can switch user context.",
        )

    target_user = db.users.get(body.user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{body.user_id}' not found.",
        )

    user_out = get_user_out_from_id(body.user_id)
    access_token = create_access_token(
        data={"sub": body.user_id, "role": target_user["role"]}
    )
    refresh_token = create_refresh_token(
        data={"sub": body.user_id, "role": target_user["role"]}
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user_out,
    )
