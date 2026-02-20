"""
Mock corporate users API using Faker.

- Simulates the response shape of RandomUser API: {"results": [...]}.
- Used when USER_SYNC_MODE=mock (e.g. Docker where randomuser.me blocks).
- Clean Architecture: only infrastructure depends on Faker; use case receives
  a callable fetch_users(limit) -> dict and does not know about Faker.
- Guarantees: unique emails, valid identification-like data, structure compatible
  with SyncUsersFromCorporateAPIUseCase._raw_to_user().
"""

import uuid as uuid_module
from faker import Faker

# Each item matches the "raw" shape expected by the use case: email, name.{first,last}, login.uuid
MAX_LIMIT = 100


def fetch_users(limit: int = 100) -> dict:
    """
    Generate fake corporate users in RandomUser API shape.
    Returns {"results": [{"email", "name": {"first","last"}, "login": {"uuid"}}, ...]}.
    Emails are unique per call.
    """
    limit = min(max(1, limit), MAX_LIMIT)
    fake = Faker()
    results = []

    for _ in range(limit):
        first = fake.first_name()
        last = fake.last_name()
        email = fake.unique.email()
        results.append({
            "email": email,
            "name": {"first": first, "last": last},
            "login": {"uuid": str(uuid_module.uuid4())},
        })

    fake.unique.clear()
    return {"results": results}
