import hashlib
import os
import time
from typing import Any

import httpx
from pydantic import BaseModel


class AuthRequest(BaseModel):
    username: str
    password: str
    license_key: str | None = None
    remember: bool = True


class AuthResponse(BaseModel):
    success: bool
    message: str
    token: str | None = None
    username: str | None = None
    subscription: str | None = None
    expires: str | None = None


class KeyAuthClient:
    def __init__(self) -> None:
        self.api_url = os.getenv("KEYAUTH_API_URL", "https://keyauth.win/api/1.3/")
        self.app_name = os.getenv("KEYAUTH_APP_NAME", "")
        self.owner_id = os.getenv("KEYAUTH_OWNER_ID", "")
        self.app_secret = os.getenv("KEYAUTH_APP_SECRET", "")
        self.version = os.getenv("KEYAUTH_VERSION", "1.0")
        self.dev_mode = os.getenv("PRISM_AUTH_DEV_MODE", "true").lower() == "true"

    async def login(self, request: AuthRequest) -> AuthResponse:
        if not request.username.strip() or not request.password:
            return AuthResponse(success=False, message="Username and password are required.")
        return await self._call_keyauth("login", {
            "username": request.username,
            "pass": request.password,
        })

    async def register(self, request: AuthRequest) -> AuthResponse:
        if not request.username.strip() or not request.password or not request.license_key:
            return AuthResponse(success=False, message="Username, password, and license key are required.")
        return await self._call_keyauth("register", {
            "username": request.username,
            "pass": request.password,
            "key": request.license_key,
        })

    async def _call_keyauth(self, request_type: str, payload: dict[str, Any]) -> AuthResponse:
        if not self._configured():
            if self.dev_mode:
                token = hashlib.sha256(f"{payload.get('username', 'dev')}:{time.time()}".encode()).hexdigest()
                return AuthResponse(
                    success=True,
                    message="Development auth accepted. Configure KEYAUTH_* environment variables for production validation.",
                    token=token,
                    username=str(payload.get("username", "dev-user")),
                    subscription="development",
                    expires="never",
                )
            return AuthResponse(success=False, message="KeyAuth environment variables are not configured on the backend.")

        base_payload = {
            "type": request_type,
            "name": self.app_name,
            "ownerid": self.owner_id,
            "secret": self.app_secret,
            "ver": self.version,
        }
        base_payload.update(payload)

        try:
            async with httpx.AsyncClient(timeout=12) as client:
                response = await client.post(self.api_url, data=base_payload)
                response.raise_for_status()
                data = response.json()
        except httpx.TimeoutException:
            return AuthResponse(success=False, message="KeyAuth request timed out.")
        except httpx.HTTPError as exc:
            return AuthResponse(success=False, message=f"KeyAuth network error: {exc}")
        except ValueError:
            return AuthResponse(success=False, message="KeyAuth returned an invalid response.")

        if not data.get("success", False):
            return AuthResponse(success=False, message=str(data.get("message", "Authentication failed.")))

        info = data.get("info", {}) if isinstance(data.get("info"), dict) else {}
        subscriptions = info.get("subscriptions", [])
        first_subscription = subscriptions[0] if subscriptions else {}
        return AuthResponse(
            success=True,
            message=str(data.get("message", "Authenticated.")),
            token=str(data.get("sessionid", "")) or None,
            username=str(info.get("username", payload.get("username", ""))),
            subscription=str(first_subscription.get("subscription", "active")),
            expires=str(first_subscription.get("expiry", "")),
        )

    def _configured(self) -> bool:
        return all([self.api_url, self.app_name, self.owner_id, self.app_secret, self.version])
