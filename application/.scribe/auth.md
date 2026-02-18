# Authenticating requests

To authenticate requests, include an **`Authorization`** header with the value **`"Bearer Bearer {YOUR_TOKEN}"`**.

All authenticated endpoints are marked with a `requires authentication` badge in the documentation below.

Some endpoints require authentication. You can authenticate using Laravel Sanctum tokens or session-based authentication for web requests.
