from __future__ import annotations

import json
import os
import secrets
import string
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field

KeyDuration = Literal["1_month", "6_month", "12_month", "lifetime"]


class LicenseKeyRequest(BaseModel):
    duration: KeyDuration
    count: int = Field(default=1, ge=1, le=100)
    note: str | None = Field(default=None, max_length=200)


class LicenseKeyRecord(BaseModel):
    key: str
    duration: KeyDuration
    created_at: str
    expires_at: str | None
    redeemed: bool = False
    redeemed_by: str | None = None
    redeemed_at: str | None = None
    note: str | None = None


class LicenseValidationRequest(BaseModel):
    key: str = Field(min_length=8, max_length=32)
    username: str | None = Field(default=None, max_length=80)


class LicenseValidationResponse(BaseModel):
    valid: bool
    message: str
    duration: KeyDuration | None = None
    expires_at: str | None = None


class LicenseKeyStore:
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

    def __init__(self) -> None:
        default_path = Path(__file__).resolve().parents[1] / "generated" / "license_keys.json"
        self.path = Path(os.getenv("PRISM_LICENSE_STORE", str(default_path)))
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def generate(self, request: LicenseKeyRequest) -> list[LicenseKeyRecord]:
        existing = self._load()
        now = datetime.now(UTC)
        records: list[LicenseKeyRecord] = []
        used = set(existing)

        for _ in range(request.count):
            key = self._new_key(used)
            used.add(key)
            record = LicenseKeyRecord(
                key=key,
                duration=request.duration,
                created_at=now.isoformat(),
                expires_at=self._expiry(now, request.duration),
                note=request.note,
            )
            existing[key] = record.model_dump()
            records.append(record)

        self._save(existing)
        return records

    def validate_and_redeem(self, request: LicenseValidationRequest) -> LicenseValidationResponse:
        key = request.key.strip().upper().replace("-", "")
        existing = self._load()
        raw = existing.get(key)
        if not raw:
            return LicenseValidationResponse(valid=False, message="License key was not found.")

        record = LicenseKeyRecord(**raw)
        if record.redeemed and record.redeemed_by != request.username:
            return LicenseValidationResponse(valid=False, message="License key has already been redeemed.")

        if record.expires_at:
            expires = datetime.fromisoformat(record.expires_at)
            if expires < datetime.now(UTC):
                return LicenseValidationResponse(valid=False, message="License key has expired.")

        record.redeemed = True
        record.redeemed_by = request.username
        record.redeemed_at = datetime.now(UTC).isoformat()
        existing[key] = record.model_dump()
        self._save(existing)
        return LicenseValidationResponse(
            valid=True,
            message="License key accepted.",
            duration=record.duration,
            expires_at=record.expires_at,
        )

    def _new_key(self, used: set[str]) -> str:
        while True:
            key = "".join(secrets.choice(self.alphabet) for _ in range(8))
            if key not in used:
                return key

    def _expiry(self, now: datetime, duration: KeyDuration) -> str | None:
        if duration == "lifetime":
            return None
        days = {"1_month": 30, "6_month": 182, "12_month": 365}[duration]
        return (now + timedelta(days=days)).isoformat()

    def _load(self) -> dict[str, dict]:
        if not self.path.exists():
            return {}
        try:
            return json.loads(self.path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {}

    def _save(self, data: dict[str, dict]) -> None:
        self.path.write_text(json.dumps(data, indent=2, sort_keys=True), encoding="utf-8")
