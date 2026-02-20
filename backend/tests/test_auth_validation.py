"""Validate that protected routes return 401 without token and 403 with wrong role."""
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_users_create_without_token_returns_401():
    response = client.post(
        "/users/",
        json={
            "identification": "1",
            "name": "Test",
            "email": "test@example.com",
            "role": "ADMIN",
            "password": "secret",
            "warehouses": [],
        },
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_users_update_without_token_returns_401():
    response = client.put(
        "/users/00000000-0000-0000-0000-000000000001",
        json={"name": "Updated"},
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_inventory_sessions_create_without_token_returns_401():
    response = client.post(
        "/inventory-sessions/",
        json={
            "warehouse_id": "00000000-0000-0000-0000-000000000001",
            "month": "2025-02-01T00:00:00.000Z",
            "created_by": "00000000-0000-0000-0000-000000000001",
        },
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_health_does_not_require_token():
    """Public routes like /health are accessible without authentication."""
    response = client.get("/health")
    assert response.status_code == 200


def test_users_create_with_valid_token_wrong_role_returns_403():
    from app.infrastructure.security.jwt_service import JWTService

    token = JWTService.create_access_token(
        data={
            "sub": "00000000-0000-0000-0000-000000000001",
            "role": "WAREHOUSE_MANAGER",
            "warehouses": [],
        }
    )
    response = client.post(
        "/users/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "identification": "1",
            "name": "Test",
            "email": "test2@example.com",
            "role": "ADMIN",
            "password": "secret",
            "warehouses": [],
        },
    )
    assert response.status_code == 403
    assert "detail" in response.json()
