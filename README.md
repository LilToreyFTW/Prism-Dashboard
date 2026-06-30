# PrismDashboard Web

PrismDashboard is structured as a modern full-stack web application. The private VPS/auth runner does not need to be committed; this repo includes a safe generic FastAPI entrypoint that can talk to that private host through environment variables.

```text
PrismDashboard/
  backend/
    main.py                         FastAPI entrypoint on port 4026
    services/keyauth.py             Backend KeyAuth proxy and dev auth fallback
    services/license_keys.py        Server-side 8-character license key generator/store
    services/project_generator.py   App Builder zip generation service
  frontend/
    src/App.tsx                     Main React shell
    src/components/AuthPanel.tsx    Login/register UI
    src/components/Dashboard.tsx    Docking-style live dashboard
    src/components/PrismScene.tsx   React Three Fiber viewport
    src/components/AppBuilderPanel.tsx Project generator UI
    src/components/LicenseKeysPanel.tsx Server-side license key console
  requirements.txt                  Backend dependencies
  scripts/run_backend.bat           Windows backend bootstrap
  scripts/run_frontend.bat          Windows frontend bootstrap
```

## Local Development

Backend:

```cmd
scripts\run_backend.bat
```

Frontend:

```cmd
scripts\run_frontend.bat
```

Open `http://127.0.0.1:5173`.

## Backend API

- `GET /health` — backend health check
- `POST /auth/login` — backend-side KeyAuth login proxy
- `POST /auth/register` — backend-side KeyAuth register proxy
- `GET /api/dashboard` — current dashboard payload
- `WS /ws/dashboard` — live dashboard packets
- `POST /generate/python`, `/generate/cpp`, `/generate/csharp`, `/generate/java` — generated project zip downloads
- `POST /api/licenses/generate` — create 8-character keys for `1_month`, `6_month`, `12_month`, or `lifetime`
- `POST /api/licenses/validate` — validate/redeem a generated key

## VPS Deployment

On the VPS, open port `4026`, install Python 3.11+, then run:

```cmd
python -m venv .venv
call .venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn backend.main:app --host 0.0.0.0 --port 4026
```

For production KeyAuth validation, set these backend environment variables before launch:

```cmd
set KEYAUTH_API_URL=https://keyauth.win/api/1.3/
set KEYAUTH_APP_NAME=your_app_name
set KEYAUTH_OWNER_ID=your_owner_id
set KEYAUTH_APP_SECRET=your_secret
set KEYAUTH_VERSION=1.0
set PRISM_AUTH_DEV_MODE=false
set PRISM_LICENSE_ADMIN_TOKEN=change_this_admin_token
set PRISM_CORS_ORIGINS=http://127.0.0.1:5173,https://your-frontend-domain.example
```

Frontend deployment should use a configurable API URL instead of hardcoding the VPS details:

```cmd
set VITE_API_BASE_URL=https://your-api-host.example
set VITE_WS_BASE_URL=wss://your-api-host.example
```

The frontend keeps KeyAuth secrets and license duration logic out of the browser; the browser only calls FastAPI.
