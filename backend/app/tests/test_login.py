from fastapi.testclient import TestClient

from app.core.config import settings
from app.models import User


def test_login_access_token(client: TestClient, superuser: User) -> None:
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = client.post("/api/v1/login/access-token", data=login_data)
    assert r.status_code == 200
    token = r.json()
    assert "access_token" in token
    assert token["token_type"] == "bearer"


def test_login_wrong_password(client: TestClient, superuser: User) -> None:
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": "wrongpassword",
    }
    r = client.post("/api/v1/login/access-token", data=login_data)
    assert r.status_code == 400


def test_login_nonexistent_user(client: TestClient) -> None:
    login_data = {
        "username": "nonexistent@example.com",
        "password": "password",
    }
    r = client.post("/api/v1/login/access-token", data=login_data)
    assert r.status_code == 400
