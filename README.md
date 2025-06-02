# APISIX Frontend

React dashboard frontend for APISIX Custom Dashboard using Vite and MUI.

## Features

- Display APISIX route data with MUI DataGrid
- API key input on UI (no localStorage storage)
- Responsive and modern UI

## Requirements

- Node.js v16+
- npm or yarn

## Setup

1. Clone repo:
```bash
git clone https://github.com/6410685066/apisix-frontend.git
cd apisix-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start dev server:
```bash
npm run dev
# or
yarn dev
```

4. Access UI at `http://localhost:5173`

## Environment variables (optional)

Create `.env` for backend API URL:

```
VITE_BACKEND_URL=http://localhost:8080
VITE_APISIX_ADMIN_URL=http://localhost:9180/apisix/admin
```

## Build
1. Build dist
```bash
npm run build
# or
yarn build
```

2. Build Docker Image
```bash
docker build -t react-app .
```

