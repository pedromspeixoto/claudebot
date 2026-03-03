from fastapi.testclient import TestClient

from app.models import User


def test_read_users(
    client: TestClient, superuser_token_headers: dict[str, str], superuser: User
) -> None:
    r = client.get("/api/v1/users/", headers=superuser_token_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["count"] >= 1
    assert len(data["data"]) >= 1


def test_read_users_not_superuser(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    r = client.get("/api/v1/users/", headers=normal_user_token_headers)
    assert r.status_code == 403


def test_read_user_me(
    client: TestClient, superuser_token_headers: dict[str, str], superuser: User
) -> None:
    r = client.get("/api/v1/users/me", headers=superuser_token_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == superuser.email
    assert data["is_superuser"] is True


def test_create_user(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    user_data = {
        "email": "newuser@example.com",
        "password": "newpassword123",
        "full_name": "New User",
    }
    r = client.post("/api/v1/users/", json=user_data, headers=superuser_token_headers)
    assert r.status_code == 201
    data = r.json()
    assert data["email"] == "newuser@example.com"
    assert data["full_name"] == "New User"
    assert "hashed_password" not in data


def test_create_user_duplicate_email(
    client: TestClient, superuser_token_headers: dict[str, str], superuser: User
) -> None:
    user_data = {
        "email": superuser.email,
        "password": "password123",
    }
    r = client.post("/api/v1/users/", json=user_data, headers=superuser_token_headers)
    assert r.status_code == 409


def test_update_user_me(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    r = client.patch(
        "/api/v1/users/me",
        json={"full_name": "Updated Name"},
        headers=normal_user_token_headers,
    )
    assert r.status_code == 200
    assert r.json()["full_name"] == "Updated Name"


def test_read_user_by_id(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    normal_user: User,
) -> None:
    r = client.get(
        f"/api/v1/users/{normal_user.id}", headers=superuser_token_headers
    )
    assert r.status_code == 200
    assert r.json()["email"] == normal_user.email
