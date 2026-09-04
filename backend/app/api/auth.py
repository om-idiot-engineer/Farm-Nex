import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.core.config import settings
from app.core.limiter import limiter
from app.core.database import db
from app.core.security import (
    create_access_token,
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
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/farmer/send-otp")
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def send_farmer_otp(request: Request, body: SendOTPRequest):
    """
    Sends a phone OTP for farmer login.
    In development/demo mode, code '123456' is generated and stored.
    """
    phone = body.phone.strip()
    # In development/hackathon demo mode, we use a fixed demo OTP code
    otp = "123456"
    db.otp_codes[phone] = otp

    # Check if user already exists
    existing = any(u.get("phone") == phone for u in db.users.values())

    return {
        "success": True,
        "phone": phone,
        "message": "OTP sent successfully. (Demo OTP is 123456)",
        "is_registered": existing,
        "demo_hint": "Use 123456 to verify",
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

    valid_otp = db.otp_codes.get(phone, "123456")
    if otp != valid_otp:
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

    return TokenResponse(access_token=access_token, token_type="bearer", user=user_out)


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
        "created_at": datetime.now(),
    }
    db.users[user_id] = new_user

    db.farmer_profiles[user_id] = {
        "user_id": user_id,
        "location": body.location.strip(),
        "lat": body.lat,
        "lng": body.lng,
        "fpo_name": body.fpo_name.strip() if body.fpo_name else None,
        "updated_at": datetime.now(),
    }

    user_out = get_user_out_from_id(user_id)
    access_token = create_access_token(
        data={"sub": user_id, "role": UserRole.FARMER.value}
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=user_out)


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
        "updated_at": datetime.now(),
    }

    user_out = get_user_out_from_id(user_id)
    access_token = create_access_token(
        data={"sub": user_id, "role": UserRole.BUYER.value}
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=user_out)


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
    # Allow seeded demo buyers to log in with password 'demo1234'
    if not stored_hash:
        if body.password == "demo1234":
            valid = True
        else:
            valid = False
    else:
        valid = verify_password(body.password, stored_hash)

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    user_out = get_user_out_from_id(user_record["id"])
    access_token = create_access_token(
        data={"sub": user_record["id"], "role": user_record["role"]}
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=user_out)


@router.get("/me", response_model=UserOut)
async def get_my_profile(current_user: UserOut = Depends(get_current_user)):
    """
    Fetches the authenticated user profile and details.
    """
    return current_user
