"""HTTP client for external Random User API. Only handles the HTTP call and returns parsed JSON."""

import os
import httpx

DEFAULT_RANDOM_USER_API_URL = "https://randomuser.me/api/"


class RandomUserClient:
    """Fetches user data from the Random User API."""

    def __init__(self, base_url: str | None = None):
        self.base_url = (base_url or os.getenv("RANDOM_USER_API_URL") or DEFAULT_RANDOM_USER_API_URL).rstrip("/")

    def fetch_users(self, limit: int = 100) -> dict:
        """
        GET request to randomuser.me. Returns parsed JSON with "results" list.
        Uses User-Agent so the API does not block server requests.
        """
        url = f"{self.base_url}?results={limit}"
        response = httpx.get(
            url,
            timeout=30.0,
            headers={"User-Agent": "Soberana-Backend/1.0"},
        )
        response.raise_for_status()
        return response.json()
