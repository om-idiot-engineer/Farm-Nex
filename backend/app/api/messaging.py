import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.database import db
from app.core.security import get_current_user
from app.models.schemas import UserOut

router = APIRouter(prefix="/messages", tags=["Messaging"])

if not hasattr(db, "conversations"):
    db.conversations = {}
if not hasattr(db, "messages"):
    db.messages = {}

# Pydantic Schemas

class OfferData(BaseModel):
    rate: float
    quantity: float
    pickup: str
    payment: str

class MessageCreate(BaseModel):
    body: str
    kind: str = "text"
    offerData: Optional[OfferData] = None

class MessageOut(BaseModel):
    id: str
    senderId: str
    body: str
    createdAt: str
    kind: str = "text"
    offerData: Optional[OfferData] = None

class ContextData(BaseModel):
    label: str
    crop: str
    quantity: float
    quality: str
    offer: float
    location: str
    payment: str
    listingId: Optional[str] = None
    demandId: Optional[str] = None

class ConversationCreate(BaseModel):
    participantId: str

class ConversationOut(BaseModel):
    id: str
    participantId: str
    participantName: str
    participantRole: str
    participantVerified: bool
    lastMessage: str
    updatedAt: str
    unread: int
    context: Optional[ContextData] = None
    messages: List[MessageOut]

def _build_conversation_out(conv: dict, current_user_id: str) -> ConversationOut:
    # Identify the other participant
    p_id = conv["participant_1"] if conv["participant_2"] == current_user_id else conv["participant_2"]
    other_user = db.users.get(p_id, {})

    # Get messages
    msgs = [m for m in db.messages.values() if m["conversation_id"] == conv["id"]]
    msgs.sort(key=lambda x: x["created_at"])

    return ConversationOut(
        id=conv["id"],
        participantId=p_id,
        participantName=other_user.get("name", "Unknown User"),
        participantRole=other_user.get("role", "farmer"),
        participantVerified=other_user.get("verified", False),
        lastMessage=conv.get("last_message", ""),
        updatedAt=conv["updated_at"].isoformat() if isinstance(conv["updated_at"], datetime) else conv["updated_at"],
        unread=0,
        context=conv.get("context"),
        messages=[
            MessageOut(
                id=m["id"],
                senderId=m["sender_id"],
                body=m["body"],
                createdAt=m["created_at"].isoformat() if isinstance(m["created_at"], datetime) else m["created_at"],
                kind=m.get("kind", "text"),
                offerData=m.get("offerData")
            ) for m in msgs
        ]
    )

@router.get("", response_model=List[ConversationOut])
async def get_conversations(current_user: UserOut = Depends(get_current_user)):
    user_convs = [
        c for c in db.conversations.values()
        if c["participant_1"] == current_user.id or c["participant_2"] == current_user.id
    ]
    user_convs.sort(key=lambda x: x["updated_at"], reverse=True)
    return [_build_conversation_out(c, current_user.id) for c in user_convs]


@router.get("/{conversation_id}", response_model=ConversationOut)
async def get_conversation(
    conversation_id: str,
    current_user: UserOut = Depends(get_current_user)
):
    conv = db.conversations.get(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if current_user.id not in [conv["participant_1"], conv["participant_2"]]:
        raise HTTPException(status_code=403, detail="Not a participant")

    return _build_conversation_out(conv, current_user.id)


@router.post("", response_model=ConversationOut, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    payload: ConversationCreate,
    current_user: UserOut = Depends(get_current_user)
):
    # Check if conversation already exists
    for c in db.conversations.values():
        if (c["participant_1"] == current_user.id and c["participant_2"] == payload.participantId) or \
           (c["participant_2"] == current_user.id and c["participant_1"] == payload.participantId):
            return _build_conversation_out(c, current_user.id)

    # Create new
    conv_id = f"conv_{uuid.uuid4().hex[:12]}"
    now = datetime.now()
    conv = {
        "id": conv_id,
        "participant_1": current_user.id,
        "participant_2": payload.participantId,
        "last_message": "",
        "updated_at": now,
        "context": None,
    }
    db.conversations[conv_id] = conv
    return _build_conversation_out(conv, current_user.id)


@router.post("/{conversation_id}", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
async def send_message(
    conversation_id: str,
    payload: MessageCreate,
    current_user: UserOut = Depends(get_current_user)
):
    conv = db.conversations.get(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if current_user.id not in [conv["participant_1"], conv["participant_2"]]:
        raise HTTPException(status_code=403, detail="Not a participant")

    msg_id = f"msg_{uuid.uuid4().hex[:12]}"
    now = datetime.now()

    msg = {
        "id": msg_id,
        "conversation_id": conversation_id,
        "sender_id": current_user.id,
        "body": payload.body,
        "created_at": now,
        "kind": payload.kind,
        "offerData": payload.offerData.dict() if payload.offerData else None
    }

    db.messages[msg_id] = msg

    # Update conversation last_message
    conv["last_message"] = payload.body
    conv["updated_at"] = now

    return MessageOut(
        id=msg["id"],
        senderId=msg["sender_id"],
        body=msg["body"],
        createdAt=msg["created_at"].isoformat() if isinstance(msg["created_at"], datetime) else msg["created_at"],
        kind=msg["kind"],
        offerData=msg["offerData"]
    )
