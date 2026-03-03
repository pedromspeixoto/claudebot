import uuid
from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    full_name: str | None = Field(default=None, max_length=255)
    hashed_password: str
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Pydantic schemas
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str | None = None
    is_superuser: bool = False


class UserUpdate(BaseModel):
    email: str | None = None
    full_name: str | None = None
    password: str | None = None


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    full_name: str | None
    is_active: bool
    is_superuser: bool
    created_at: datetime


class UsersPublic(BaseModel):
    data: list[UserPublic]
    count: int


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
