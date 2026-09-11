import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field

from app.core.database import db
from app.core.security import get_current_user, require_role, security_bearer, decode_access_token
from app.models.schemas import (
    UserOut,
    UserRole,
    CommunityTag,
    CommunityPostCreate,
    CommunityPostOut,
    PostReplyItem
)

router = APIRouter(prefix="/community", tags=["Community Board"])


class PostReplyCreate(BaseModel):
    content: str = Field(..., min_length=2, max_length=1000)


# Initialize persistent-like storage
if not hasattr(db, "post_comments"):
    db.post_comments = {}
if not hasattr(db, "post_likes"):
    db.post_likes = {}
if not hasattr(db, "post_media"):
    db.post_media = {}


def get_optional_user(token = Depends(security_bearer)):
    if not token:
        return None
    try:
        payload = decode_access_token(token.credentials)
        return payload.get("sub")
    except:
        return None


@router.get("/posts", response_model=List[CommunityPostOut])
async def list_community_posts(
    tag: Optional[CommunityTag] = Query(
        None,
        description="Filter posts by tag: question, market, machinery, expert_verified",
    ),
    current_user_id: Optional[str] = Depends(get_optional_user)
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

        # Get replies
        post_replies = [
            r for r in db.post_comments.values() if r["post_id"] == item["id"]
        ]
        post_replies.sort(key=lambda x: x["created_at"])

        # Get likes
        post_likes = [
            l for l in db.post_likes.values() if l["post_id"] == item["id"]
        ]
        has_liked = any(l["user_id"] == current_user_id for l in post_likes) if current_user_id else False

        # Get media
        media_urls = [
            m["url"] for m in db.post_media.values() if m["post_id"] == item["id"]
        ]

        results.append(
            CommunityPostOut(
                id=item["id"],
                user_id=item["user_id"],
                author_name=author.get("name", "Community Member"),
                author_role=author.get("role", "farmer"),
                tag=item.get("tag", "question"),
                content=item["content"],
                expert_verified=item.get("expert_verified", False),
                like_count=len(post_likes),
                has_liked=has_liked,
                replies=[
                    PostReplyItem(
                        id=r["id"],
                        post_id=r["post_id"],
                        author_id=r["author_id"],
                        author_name=r["author_name"],
                        author_role=r["author_role"],
                        content=r["content"],
                        created_at=r["created_at"]
                    ) for r in post_replies
                ],
                media_urls=media_urls,
                created_at=item["created_at"],
            )
        )

    results.sort(key=lambda x: x.created_at, reverse=True)
    return results


@router.post("/posts", response_model=CommunityPostOut, status_code=status.HTTP_201_CREATED)
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

    return CommunityPostOut(
        id=post["id"],
        user_id=post["user_id"],
        author_name=current_user.name,
        author_role=current_user.role,
        tag=post["tag"],
        content=post["content"],
        expert_verified=False,
        like_count=0,
        has_liked=False,
        replies=[],
        media_urls=[],
        created_at=now,
    )


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
    "/posts/{post_id}/reply", response_model=PostReplyItem, status_code=status.HTTP_201_CREATED
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
        "author_role": current_user.role,
        "content": payload.content.strip(),
        "created_at": now,
    }

    db.post_comments[reply_id] = reply

    return PostReplyItem(**reply)

@router.post("/posts/{post_id}/like", response_model=dict)
async def like_post(
    post_id: str, current_user: UserOut = Depends(get_current_user)
):
    post = db.community_posts.get(post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found."
        )

    like_key = f"{post_id}_{current_user.id}"
    if like_key not in db.post_likes:
        db.post_likes[like_key] = {
            "id": str(uuid.uuid4()),
            "post_id": post_id,
            "user_id": current_user.id,
            "created_at": datetime.now()
        }
    return {"success": True, "like_count": len([l for l in db.post_likes.values() if l["post_id"] == post_id])}

@router.delete("/posts/{post_id}/like", response_model=dict)
async def unlike_post(
    post_id: str, current_user: UserOut = Depends(get_current_user)
):
    like_key = f"{post_id}_{current_user.id}"
    if like_key in db.post_likes:
        del db.post_likes[like_key]
    return {"success": True, "like_count": len([l for l in db.post_likes.values() if l["post_id"] == post_id])}


@router.get("/posts/{post_id}", response_model=CommunityPostOut)
async def get_post_detail(post_id: str, current_user_id: Optional[str] = Depends(get_optional_user)):
    item = db.community_posts.get(post_id)
    if not item:
        raise HTTPException(status_code=404, detail="Post not found")

    author = db.users.get(item["user_id"], {})

    post_replies = [r for r in db.post_comments.values() if r["post_id"] == post_id]
    post_replies.sort(key=lambda x: x["created_at"])

    post_likes = [l for l in db.post_likes.values() if l["post_id"] == post_id]
    has_liked = any(l["user_id"] == current_user_id for l in post_likes) if current_user_id else False

    media_urls = [m["url"] for m in db.post_media.values() if m["post_id"] == post_id]

    return CommunityPostOut(
        id=item["id"],
        user_id=item["user_id"],
        author_name=author.get("name", "Community Member"),
        author_role=author.get("role", "farmer"),
        tag=item.get("tag", "question"),
        content=item["content"],
        expert_verified=item.get("expert_verified", False),
        like_count=len(post_likes),
        has_liked=has_liked,
        replies=[
            PostReplyItem(
                id=r["id"],
                post_id=r["post_id"],
                author_id=r["author_id"],
                author_name=r["author_name"],
                author_role=r["author_role"],
                content=r["content"],
                created_at=r["created_at"]
            ) for r in post_replies
        ],
        media_urls=media_urls,
        created_at=item["created_at"],
    )
