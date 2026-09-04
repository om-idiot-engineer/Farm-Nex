import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field

from app.core.database import db
from app.core.security import get_current_user, require_role
from app.models.schemas import (
    UserOut,
    UserRole,
    CommunityTag,
    CommunityPostCreate,
)

router = APIRouter(prefix="/community", tags=["Community Board"])


class PostReplyCreate(BaseModel):
    content: str = Field(..., min_length=2, max_length=1000)


# In-memory reply store
POST_REPLIES: dict[str, list[dict]] = {}


@router.get("/posts", response_model=List[dict])
async def list_community_posts(
    tag: Optional[CommunityTag] = Query(
        None,
        description="Filter posts by tag: question, market, machinery, expert_verified",
    )
):
    """
    Returns filterable community discussion posts.
    """
    results = []
    for item in db.community_posts.values():
        if tag:
            if tag == CommunityTag.EXPERT_VERIFIED:
                if not item.get("expert_verified", False):
                    continue
            elif item.get("tag") != tag.value:
                continue

        author = db.users.get(item["user_id"], {})
        replies = POST_REPLIES.get(item["id"], [])

        results.append(
            {
                "id": item["id"],
                "user_id": item["user_id"],
                "author_name": author.get("name", "Community Member"),
                "author_role": author.get("role", "farmer"),
                "tag": item.get("tag", "question"),
                "content": item["content"],
                "expert_verified": item.get("expert_verified", False),
                "replies": replies,
                "created_at": item["created_at"],
            }
        )

    results.sort(key=lambda x: x["created_at"], reverse=True)
    return results


@router.post("/posts", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_community_post(
    payload: CommunityPostCreate, current_user: UserOut = Depends(get_current_user)
):
    """
    Creates a new community board post.
    """
    post_id = str(uuid.uuid4())
    now = datetime.now()

    post = {
        "id": post_id,
        "user_id": current_user.id,
        "tag": payload.tag.value,
        "content": payload.content.strip(),
        "expert_verified": False,
        "created_at": now,
    }

    db.community_posts[post_id] = post
    POST_REPLIES[post_id] = []

    return {
        "id": post["id"],
        "user_id": post["user_id"],
        "author_name": current_user.name,
        "author_role": current_user.role.value,
        "tag": post["tag"],
        "content": post["content"],
        "expert_verified": False,
        "replies": [],
        "created_at": now,
    }


@router.post("/posts/{post_id}/verify", response_model=dict)
async def verify_post_as_expert(
    post_id: str, current_user: UserOut = Depends(require_role([UserRole.ADMIN]))
):
    """
    Admin verifies an answer or advice with the 'Expert Verified' badge.
    """
    post = db.community_posts.get(post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found."
        )

    post["expert_verified"] = True
    return {"success": True, "message": "Post marked as Expert Verified.", "post": post}


@router.post(
    "/posts/{post_id}/reply", response_model=dict, status_code=status.HTTP_201_CREATED
)
async def add_post_reply(
    post_id: str,
    payload: PostReplyCreate,
    current_user: UserOut = Depends(get_current_user),
):
    """
    Adds a reply to an existing community post.
    """
    post = db.community_posts.get(post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found."
        )

    reply_id = str(uuid.uuid4())
    now = datetime.now()

    reply = {
        "id": reply_id,
        "post_id": post_id,
        "author_id": current_user.id,
        "author_name": current_user.name,
        "author_role": current_user.role.value,
        "content": payload.content.strip(),
        "created_at": now,
    }

    if post_id not in POST_REPLIES:
        POST_REPLIES[post_id] = []
    POST_REPLIES[post_id].append(reply)

    return reply
