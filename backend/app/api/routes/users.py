import uuid

from fastapi import APIRouter, HTTPException, status
from sqlmodel import func, select

from app.api.deps import CurrentSuperUser, CurrentUser, SessionDep
from app.crud import create_user, get_user_by_email, update_user
from app.models import User, UserCreate, UserPublic, UserUpdate, UsersPublic

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=UsersPublic)
def read_users(
    session: SessionDep,
    current_user: CurrentSuperUser,
    skip: int = 0,
    limit: int = 100,
) -> UsersPublic:
    count_statement = select(func.count()).select_from(User)
    count = session.exec(count_statement).one()
    statement = select(User).offset(skip).limit(limit)
    users = session.exec(statement).all()
    return UsersPublic(data=users, count=count)  # type: ignore[arg-type]


@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> User:
    return current_user


@router.patch("/me", response_model=UserPublic)
def update_user_me(
    session: SessionDep,
    user_in: UserUpdate,
    current_user: CurrentUser,
) -> User:
    if user_in.email:
        existing = get_user_by_email(session=session, email=user_in.email)
        if existing and existing.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
    return update_user(session=session, db_user=current_user, user_in=user_in)


@router.post("/", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def create_new_user(
    session: SessionDep,
    user_in: UserCreate,
    current_user: CurrentSuperUser,
) -> User:
    existing = get_user_by_email(session=session, email=user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    return create_user(session=session, user_create=user_in)


@router.get("/{user_id}", response_model=UserPublic)
def read_user_by_id(
    user_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentSuperUser,
) -> User:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user
