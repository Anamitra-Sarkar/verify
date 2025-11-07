# Verify — Data Dragons (Live demo / Project README)

Made by Data Dragons  
Team Lead: Anamitra Sarkar (@Anamitra-Sarkar)  
Team members: Koyeliya Ghosh · Debjit Deb Barman · Sneha Ghorai · Sreeshant Kumar Sharma

A comprehensive, production-focused verification project combining a TypeScript frontend (Vite + Tailwind), a backend service, and a Chrome extension. This repository contains implementation, extensive documentation, deployment guides, and testing/validation artifacts.

---

Table of contents
- [Project overview](#project-overview)
- [Repository layout](#repository-layout)
- [Languages & stack](#languages--stack)
- [Getting started (quick start)](#getting-started-quick-start)
  - [Prerequisites](#prerequisites)
  - [Clone & install](#clone--install)
  - [Environment variables](#environment-variables)
  - [Common scripts](#common-scripts)
- [Architecture & design](#architecture--design)
- [Backend](#backend)
- [Chrome extension](#chrome-extension)
- [Deployment & production](#deployment--production)
- [API keys, auth, and external services](#api-keys-auth-and-external-services)
- [Testing & quality](#testing--quality)
- [Development workflow & contributing](#development-workflow--contributing)
- [Roadmap & known improvements](#roadmap--known-improvements)
- [Credits & contacts](#credits--contacts)
- [Acknowledgements & license](#acknowledgements--license)

---

## Project overview

Verify is a verification platform intended to help validate and verify content, URLs, users, and related artifacts. The repo is a multi-part project containing:

- A TypeScript frontend (Vite + Tailwind) — user-facing verification UI and visual guides
- A backend service (`backend/`) — verification APIs, model integration and business logic
- A Chrome extension (`chrome-extension/`) — quick access integration for verification flows
- Extensive documentation and operational guides for local development and production deployment

This README gives a complete developer and operator view to run the project locally, understand architecture, and deploy.

## Repository layout (top-level)

- `.env`, `.env.example`, `.env.updated` — environment configuration templates
- `package.json`, `package-lock.json` — frontend (and/or monorepo) Node config
- `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js` — frontend toolchain configs
- `src/` — primary frontend source (Vite + TypeScript)
- `backend/` — backend service (see folder for language-specific details)
- `chrome-extension/` — extension source and manifest
- `index.html` — frontend entry
- `vercel.json` — Vercel deployment config
- Documentation files (examples): `ARCHITECTURE.md`, `QUICK_START.md`, `DEPLOYMENT_INSTRUCTIONS.md`, `FIREBASE_SETUP.md`, `GCP_DEPLOYMENT_GUIDE.md`, `API_KEYS_SETUP.md`, `INTEGRATION_GUIDE.md`, `TESTING_REPORT.md`, etc.

For full repository contents view: https://github.com/Anamitra-Sarkar/verify/tree/main

> Note: I fetched the repository contents using the API; results may be incomplete. Use the GitHub UI to browse the complete tree.

## Languages & stack

Languages found in this repository (by bytes):
- TypeScript (primary)
- JavaScript
- Python (significant presence — likely for ML/model/backend scripts)
- HTML, CSS
- Dockerfiles

Stack summary (inferred):
- Frontend: Vite + TypeScript, Tailwind CSS, PostCSS
- Backend: `backend/` (may include Python services or Node services — inspect that folder for details)
- Hosting: Vercel config present; GCP deployment guides provided
- Auth / services: Firebase docs and API key wiring guides included
- Extension: Chrome extension manifests and code under `chrome-extension/`

## Getting started (quick start)

### Prerequisites
- Git
- Node.js (16+ recommended)
- npm or yarn
- Docker (optional, for containerized backends / services)
- Any cloud SDKs if you plan to follow cloud deploy guides (e.g., `gcloud` for GCP)

### Clone & install
```bash
git clone https://github.com/Anamitra-Sarkar/verify.git
cd verify
npm install
# or
# yarn
```

### Environment variables
Copy the example env file and update values:
```bash
cp .env.example .env
```
Populate secrets and service credentials as described in `API_KEYS_SETUP.md`, `FIREBASE_SETUP.md` and `.env.example`.

### Common scripts
Typical frontend (Vite) scripts:
- Development: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

Exact scripts can be found in `package.json` — open that file to verify the available npm scripts.

## Backend & chrome extension

Backend:
- See the `backend/` directory for backend-specific setup, dependencies, and run commands.
- If the backend is Python-based, use a virtual environment and install `requirements.txt` as described inside `backend/`.

Chrome extension:
- Open `chrome-extension/`
- Load as an unpacked extension in Chrome: Chrome → Extensions → Developer mode → Load unpacked → select `chrome-extension/`
- Some extension flows may rely on built frontend assets — build the frontend first if needed.

See:
- `URL_VERIFICATION_IMPLEMENTATION.md`
- `WHATSAPP_INTEGRATION.md`

## Architecture & design

Refer to `ARCHITECTURE.md` for a complete conceptual and component-level explanation. High level:
- Frontend (SPA): built with Vite + TypeScript; visuals and animations in `VISUAL_GUIDE.md` and `ANIMATED_UI_DOCUMENTATION.md`
- Backend: API endpoints for verification, model inference layers, auditing/logging, and worker/queue processing
- Data flows: verification requests from frontend/extension → backend APIs → model services → result storage and notifications
- Deployment: frontend to Vercel, backend optionally to GCP (see `GCP_DEPLOYMENT_GUIDE.md`)

## Deployment & production

- Vercel: `vercel.json` indicates frontend is configured for Vercel deployment.
- Backend: follow `DEPLOYMENT_INSTRUCTIONS.md` and `GCP_DEPLOYMENT_GUIDE.md` to provision and deploy backend services.
- Production checklist:
  - Ensure all env vars and API keys are provisioned
  - Build frontend artifacts and deploy to Vercel (or a CDN)
  - Deploy backend to the chosen cloud provider (GCP / Cloud Run / VMs)
  - Configure monitoring, logging, health checks
  - Run smoke tests and review results (see `DEPLOYMENT_STATUS.md` and `DEPLOYMENT_SUMMARY.md`)

## API keys, auth and external services

- `API_KEYS_SETUP.md` — step-by-step for external keys and secrets required by the application
- `FIREBASE_SETUP.md`, `FIREBASE_AUTH_GUIDE.md` — Firebase configuration and auth flows
- `WHATSAPP_INTEGRATION.md` — (if used) WhatsApp integration details

Never commit secrets. Use `.env.example` as a template.

## Testing & quality

- Test reports: `TESTING_REPORT.md`, `TESTING_RESULTS.md`
- Unit/integration tests: check `package.json` scripts for `test` and CI-related configuration
- Model evaluation and notes: `BACKEND_MODEL_REPORT.md`, experiment logs
- CI recommendation: add GitHub Actions workflows under `.github/workflows/` to run lint/test/build pipelines before merging

## Development workflow & contributing

Recommended workflow:
1. Fork or branch from `main`: `git checkout -b feat/<your-feature>`
2. Implement changes with descriptive commit messages
3. Run tests and lint locally
4. Open a pull request describing the changes and linking issues
5. Request reviews and address feedback
6. Merge when approved

Suggestions:
- Add `CONTRIBUTING.md` if not present (I can draft one on request)
- Add `CODE_OF_CONDUCT.md` if desired
- Use issue and PR templates to standardize contributions

## Roadmap & known improvements

This repository already contains many plan and improvements docs (e.g., `BACKEND_IMPROVEMENTS_GUIDE.md`, `FIX_SUMMARY.md`, `HOMEPAGE_UPDATES.md`). Example short-term items:
- Harden automated tests and add CI
- Containerize backend with Docker Compose for local dev
- Add RBAC (role-based access control) in backend
- Improve model monitoring and drift detection
- Add analytics and usage dashboards

## Credits & contacts

Made by Data Dragons

Team Lead: Anamitra Sarkar (@Anamitra-Sarkar)  
Team members: Koyeliya Ghosh · Debjit Deb Barman · Sneha Ghorai · Sreeshant Kumar Sharma

For issues or questions: open a GitHub issue at https://github.com/Anamitra-Sarkar/verify/issues

## Acknowledgements & license

Many detailed docs are included in this repo — please consult them for implementation specifics.

This project is licensed under the Apache License, Version 2.0. See [LICENSE](./LICENSE) for the full license text.

---

Helpful direct links
- ARCHITECTURE.md: https://github.com/Anamitra-Sarkar/verify/blob/main/ARCHITECTURE.md
- QUICK_START.md: https://github.com/Anamitra-Sarkar/verify/blob/main/QUICK_START.md
- API_KEYS_SETUP.md: https://github.com/Anamitra-Sarkar/verify/blob/main/API_KEYS_SETUP.md
- FIREBASE_SETUP.md: https://github.com/Anamitra-Sarkar/verify/blob/main/FIREBASE_SETUP.md
- GCP_DEPLOYMENT_GUIDE.md: https://github.com/Anamitra-Sarkar/verify/blob/main/GCP_DEPLOYMENT_GUIDE.md
- VISUAL_GUIDE.md: https://github.com/Anamitra-Sarkar/verify/blob/main/VISUAL_GUIDE.md
- BACKEND_MODEL_REPORT.md: https://github.com/Anamitra-Sarkar/verify/blob/main/BACKEND_MODEL_REPORT.md
- DEPLOYMENT_INSTRUCTIONS.md: https://github.com/Anamitra-Sarkar/verify/blob/main/DEPLOYMENT_INSTRUCTIONS.md
- TESTING_REPORT.md: https://github.com/Anamitra-Sarkar/verify/blob/main/TESTING_REPORT.md
