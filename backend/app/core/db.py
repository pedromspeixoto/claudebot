from sqlmodel import Session, create_engine

from app.core.config import settings

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


def get_db():
    with Session(engine) as session:
        yield session


def init_db(session: Session) -> None:
    from app.core.security import get_password_hash
    from app.crud import get_user_by_email
    from app.models import User

    user = get_user_by_email(session=session, email=settings.FIRST_SUPERUSER)
    if not user:
        user = User(
            email=settings.FIRST_SUPERUSER,
            hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
            full_name="Admin",
            is_superuser=True,
        )
        session.add(user)
        session.commit()
