"""HTTP client for external Random User API. Only handles the HTTP call and returns parsed JSON."""

import httpx

RANDOM_USER_API_URL = "https://randomuser.me/api/?results=100"


class RandomUserClient:
    """Fetches user data from the Random User API."""

    @staticmethod
    def fetch_users(limit: int = 100) -> dict:
        """
        GET request to randomuser.me. Returns parsed JSON.
        """
        url = f"https://randomuser.me/api/?results={limit}"
        response = httpx.get(url, timeout=30.0)
        response.raise_for_status()
        return response.json()
