import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.models.schemas import UserOut, UserRole, FarmerProfileOut, BuyerProfileOut

security_bearer = HTTPBearer(auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt

def refresh_access_token(refresh_token: str) -> str:
    try:
        payload = jwt.decode(
            refresh_token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type.")
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload.")
        return create_access_token({"sub": user_id})
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired. Please log in again.",
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
        )


def decode_access_token(token: str) -> Dict[str, Any]:
    # Handle demo / dev mode tokens gracefully
    if token.startswith("demo_token_") or token.startswith("demo-"):
        from app.core.database import db
        cleaned_id = token.replace("demo_token_", "").replace("demo-", "")
        # 1. Direct ID match in seeded/registered users
        if cleaned_id in db.users:
            return {"sub": cleaned_id, "role": db.users[cleaned_id]["role"]}
        # 2. Check if token itself (without prefix) matches a user ID
        token_sub = token.replace("demo_token_", "")
        if token_sub in db.users:
            return {"sub": token_sub, "role": db.users[token_sub]["role"]}

        # 3. Fallback by role keyword
        role_part = cleaned_id.lower()
        if "buyer" in role_part:
            return {"sub": "b0000000-0000-0000-0000-000000000001", "role": "buyer"}
        elif "fpo" in role_part:
            return {"sub": "fpo00000-0000-0000-0000-000000000001", "role": "fpo"}
        elif "admin" in role_part:
            return {"sub": "a0000000-0000-0000-0000-000000000001", "role": "admin"}
        elif "expert" in role_part:
            return {"sub": "exp00000-0000-0000-0000-000000000001", "role": "expert"}
        elif "consumer" in role_part:
            return {"sub": "con00000-0000-0000-0000-000000000001", "role": "consumer"}
        else:
            return {"sub": "f0000000-0000-0000-0000-000000000001", "role": "farmer"}

    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please log in again.",
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
        )


def get_user_out_from_id(user_id: str) -> Optional[UserOut]:
    """Helper to construct UserOut with profile data."""
    from app.core.database import db
    # Check in-memory store or supabase
    user_data = db.users.get(user_id)
    if not user_data:
        return None

    farmer_prof = None
    if user_id in db.farmer_profiles:
        fp_data = db.farmer_profiles[user_id]
        farmer_prof = FarmerProfileOut(
            user_id=user_id,
            location=fp_data["location"],
            lat=fp_data["lat"],
            lng=fp_data["lng"],
            fpo_name=fp_data.get("fpo_name"),
            headline=fp_data.get("headline") or user_data.get("headline"),
            about=fp_data.get("about") or user_data.get("about"),
            crops=fp_data.get("crops"),
            farm_size_acres=fp_data.get("farm_size_acres"),
            soil_type=fp_data.get("soil_type"),
            updated_at=fp_data.get("updated_at"),
        )

    buyer_prof = None
    if user_id in db.buyer_profiles:
        bp_data = db.buyer_profiles[user_id]
        buyer_prof = BuyerProfileOut(
            user_id=user_id,
            business_name=bp_data["business_name"],
            gst_verified=bp_data.get("gst_verified", False),
            location=bp_data.get("location"),
            lat=bp_data.get("lat"),
            lng=bp_data.get("lng"),
            headline=bp_data.get("headline") or user_data.get("headline"),
            about=bp_data.get("about") or user_data.get("about"),
            procurement_capacity=bp_data.get("procurement_capacity"),
            gst_number=bp_data.get("gst_number"),
            commodities=bp_data.get("commodities"),
            updated_at=bp_data.get("updated_at"),
        )

    return UserOut(
        id=user_data["id"],
        name=user_data["name"],
        role=UserRole(user_data["role"]),
        phone=user_data.get("phone"),
        email=user_data.get("email"),
        language_pref=user_data.get("language_pref", "hi"),
        verified=user_data.get("verified", False),
        headline=user_data.get("headline"),
        about=user_data.get("about"),
        created_at=user_data.get("created_at", datetime.now()),
        farmer_profile=farmer_prof,
        buyer_profile=buyer_prof,
    )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
) -> UserOut:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header.",
        )
    token = credentials.credentials
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user identity.",
        )

    user = get_user_out_from_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )
    return user


def require_role(allowed_roles: list[UserRole]):
    async def role_checker(
        current_user: UserOut = Depends(get_current_user),
    ) -> UserOut:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires role in {[r.value for r in allowed_roles]}",
            )
        return current_user

    return role_checker
