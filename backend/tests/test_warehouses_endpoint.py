"""Test GET /warehouses/ requires auth and returns list."""
import pytest
from fastapi.testclient import TestClient

from app.infrastructure.security.jwt_service import JWTService
from app.main import app

client = TestClient(app)


def test_warehouses_without_token_returns_401():
    response = client.get("/warehouses/")
    assert response.status_code == 401


def test_warehouses_with_admin_token_returns_200():
    token = JWTService.create_access_token(
        data={
            "sub": "00000000-0000-0000-0000-000000000001",
            "role": "ADMIN",
            "warehouses": [],
        }
    )
    response = client.get(
        "/warehouses/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_warehouses_with_warehouse_manager_token_returns_200():
    token = JWTService.create_access_token(
        data={
            "sub": "00000000-0000-0000-0000-000000000001",
            "role": "WAREHOUSE_MANAGER",
            "warehouses": [],
        }
    )
    response = client.get(
        "/warehouses/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
