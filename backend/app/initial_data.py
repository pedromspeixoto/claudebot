from sqlmodel import Session

from app.core.db import engine, init_db


def main() -> None:
    with Session(engine) as session:
        init_db(session)


if __name__ == "__main__":
    main()
