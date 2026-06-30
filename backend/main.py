from __future__ import annotations

import asyncio
import math
import os
import random
import time
from typing import Any

from fastapi import FastAPI, Header, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from backend.services.keyauth import AuthRequest, AuthResponse, KeyAuthClient
from backend.services.license_keys import (
    LicenseKeyRecord,
    LicenseKeyRequest,
    LicenseKeyStore,
    LicenseValidationRequest,
    LicenseValidationResponse,
)
from backend.services.project_generator import GenerateRequest, ProjectGenerator

app = FastAPI(title="PrismDashboard API", version="1.0.0")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("PRISM_CORS_ORIGINS", "http://127.0.0.1:5173,http://localhost:5173").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

keyauth = KeyAuthClient()
project_generator = ProjectGenerator()
license_store = LicenseKeyStore()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "PrismDashboard API"}


@app.post("/auth/login", response_model=AuthResponse)
async def login(request: AuthRequest) -> AuthResponse:
    return await keyauth.login(request)


@app.post("/auth/register", response_model=AuthResponse)
async def register(request: AuthRequest) -> AuthResponse:
    return await keyauth.register(request)


@app.get("/api/dashboard")
def dashboard() -> dict[str, Any]:
    return _dashboard_payload()


@app.websocket("/ws/dashboard")
async def dashboard_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        while True:
            await websocket.send_json(_dashboard_payload())
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        return
    except RuntimeError:
        return


@app.post("/generate/{language}")
def generate_project(language: str, request: GenerateRequest) -> Response:
    if request.language != language:
        request = request.model_copy(update={"language": language})
    try:
        generated = project_generator.generate_zip(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return Response(
        content=generated.content,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{generated.filename}"'},
    )


@app.post("/api/licenses/generate", response_model=list[LicenseKeyRecord])
def generate_license_keys(request: LicenseKeyRequest, x_prism_admin_token: str | None = Header(default=None)) -> list[LicenseKeyRecord]:
    _require_license_admin(x_prism_admin_token)
    return license_store.generate(request)


@app.post("/api/licenses/validate", response_model=LicenseValidationResponse)
def validate_license_key(request: LicenseValidationRequest) -> LicenseValidationResponse:
    return license_store.validate_and_redeem(request)


def _require_license_admin(token: str | None) -> None:
    expected = os.getenv("PRISM_LICENSE_ADMIN_TOKEN")
    dev_mode = os.getenv("PRISM_AUTH_DEV_MODE", "true").lower() == "true"
    if expected and token == expected:
        return
    if not expected and dev_mode:
        return
    raise HTTPException(status_code=401, detail="License admin token required.")


def _dashboard_payload() -> dict[str, Any]:
    now = time.time()
    nodes = []
    for index in range(18):
        angle = now * 0.35 + index * 0.72
        radius = 1.4 + (index % 5) * 0.32
        nodes.append(
            {
                "id": f"node-{index}",
                "label": f"Node {index + 1}",
                "value": round(45 + 35 * (0.5 + 0.5 * math.sin(now * 0.6 + index)), 2),
                "x": round(math.sin(angle) * radius, 3),
                "y": round(math.cos(angle * 0.8) * 1.6, 3),
                "z": round(math.cos(angle) * radius, 3),
            }
        )
    edges = [[f"node-{index}", f"node-{(index + 3) % 18}"] for index in range(18)]
    return {
        "status": "online",
        "timestamp": now,
        "metrics": {
            "cpu": int(38 + 18 * math.sin(now / 7) + random.randint(0, 6)),
            "memory": int(54 + 15 * math.cos(now / 9) + random.randint(0, 5)),
            "active_users": 1200 + int(80 * math.sin(now / 13)),
            "prism_score": round(94 + 4 * math.sin(now / 11), 1),
        },
        "prism_3d_data": {
            "nodes": nodes,
            "edges": edges,
            "alerts": random.randint(0, 3),
        },
    }
