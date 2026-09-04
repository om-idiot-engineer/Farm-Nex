import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.core.database import db
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


def decode_access_token(token: str) -> Dict[str, Any]:
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
