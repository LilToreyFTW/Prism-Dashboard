# PrismDashboard Web

PrismDashboard is now structured as a modern full-stack web application:

```text
PrismDashboard/
  dashboard_server.py             FastAPI entrypoint on port 4026
  backend/
    services/keyauth.py           Backend KeyAuth proxy and dev auth fallback
    services/project_generator.py App Builder zip generation service
  frontend/
    src/App.tsx                   Main React shell
    src/components/AuthPanel.tsx  Login/register UI
    src/components/Dashboard.tsx  Docking-style live dashboard
    src/components/PrismScene.tsx React Three Fiber viewport
    src/components/AppBuilderPanel.tsx Project generator UI
  requirements.txt                Backend dependencies
  scripts/run_backend.bat         Windows backend bootstrap
  scripts/run_frontend.bat        Windows frontend bootstrap
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

## VPS Deployment

On `147.189.172.104`, open port `4026`, install Python 3.11+, then run:

```cmd
python -m venv .venv
call .venv\Scripts\activate
pip install -r requirements.txt
python dashboard_server.py
```

For production KeyAuth validation, set these backend environment variables before launch:

```cmd
set KEYAUTH_API_URL=https://keyauth.win/api/1.3/
set KEYAUTH_APP_NAME=your_app_name
set KEYAUTH_OWNER_ID=your_owner_id
set KEYAUTH_APP_SECRET=your_secret
set KEYAUTH_VERSION=1.0
set PRISM_AUTH_DEV_MODE=false
```

The frontend keeps KeyAuth secrets out of the browser and talks only to FastAPI.
