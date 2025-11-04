Verify — Data Dragons
Live demo (homepage)

Made by Data Dragons
Team Lead: Anamitra Sarkar
Team members: Koyeliya Ghosh · Debjit Deb Barman · Sneha Ghorai · Sreeshant Kumar Sharma

A comprehensive, production-focused verification project combining a TypeScript frontend (Vite + Tailwind), a backend service, and a Chrome extension. This repository contains implementation, extensive documentation, deployment guides, and testing/validation artifacts.

Table of contents
Project overview
Repository layout
Languages & stack
Getting started (quick start)
Prerequisites
Clone & install
Environment variables
Common scripts
Architecture & design
Backend
Chrome extension
Deployment & production
API keys, auth, and external services
Testing & quality
Development workflow & contributing
Roadmap & known improvements
Credits & contacts
Acknowledgements & license
Project overview
Verify is a verification platform intended to help validate and verify content/URLs/users/etc. The repo is a multi-part project containing:

A TypeScript frontend (Vite + Tailwind) — user-facing verification UI and visual guides
A backend service (folder: backend) — verification APIs, model integration and business logic
A Chrome extension (folder: chrome-extension) — quick access integration for verification flows
Lots of documentation and operational guides (Deployment, Architecture, Integration, Firebase/GCP guides, etc.)
This README gives a complete developer and operator view to run the project locally, understand architecture, and deploy.

Repository layout (top-level)
.env, .env.example, .env.updated — environment configuration templates
package.json, package-lock.json — frontend (and/or monorepo) Node config
tsconfig.json, vite.config.ts, tailwind.config.js, postcss.config.js — frontend toolchain configs
src/ — primary frontend source (Vite + TypeScript)
backend/ — backend service (see folder for language-specific details)
chrome-extension/ — extension source and manifest
index.html — frontend entry
vercel.json — Vercel deployment config
Many documentation files (examples below): ARCHITECTURE.md, QUICK_START.md, DEPLOYMENT_INSTRUCTIONS.md, FIREBASE_SETUP.md, GCP_DEPLOYMENT_GUIDE.md, API_KEYS_SETUP.md, INTEGRATION_GUIDE.md, TESTING_REPORT.md, and many more (see "Documentation & guides").
For full repository contents view these folders/files on GitHub: https://github.com/Anamitra-Sarkar/verify/tree/main

Note: I fetched the repository contents using the API; results may be incomplete. View the repository in the GitHub UI to browse the complete tree.

Key documentation files present in repo (examples)

ARCHITECTURE.md — system architecture and design details
QUICK_START.md — fast local setup
DEPLOYMENT_INSTRUCTIONS.md / GCP_DEPLOYMENT_GUIDE.md — deployment and cloud-specific steps
API_KEYS_SETUP.md — how to provision and wire external API keys
FIREBASE_AUTH_GUIDE.md / FIREBASE_SETUP.md — Firebase authentication guidance
BACKEND_MODEL_REPORT.md — model and backend performance notes
VISUAL_GUIDE.md / ANIMATED_UI_DOCUMENTATION.md — frontend visuals and animations
TESTING_REPORT.md / TESTING_RESULTS.md — testing artifacts and results
(There are many more docs — see the repo for a full list.)

Languages & stack
Languages found in this repository (by bytes):

TypeScript (primary)
JavaScript
Python (significant presence — likely for ML/model/backend scripts)
HTML, CSS
Dockerfile(s)
Stack summary (inferred from files present)

Frontend: Vite + TypeScript, Tailwind CSS, PostCSS
Backend: separate backend/ folder (see that folder for the exact stack — may include Python services or Node services)
Hosting: Vercel config present; GCP deployment guides included
Auth / services: Firebase docs and API key guides included
Extension: Chrome extension manifests and code in chrome-extension/
Getting started (quick start)
Prerequisites

Git
Node.js (16+ recommended)
npm or yarn
Docker (optional, for containerized backends / services)
Any cloud SDKs if you plan to follow cloud deploy guides (gcloud for GCP)
Clone and install

Clone the repo: git clone https://github.com/Anamitra-Sarkar/verify.git cd verify

Install dependencies: npm install (or yarn)

Environment variables

Copy the example env file and update values: cp .env.example .env
Populate secrets and service credentials as described in API_KEYS_SETUP.md, FIREBASE_SETUP.md and .env.example.
Start frontend (typical Vite commands)

Development: npm run dev
Build: npm run build
Preview: npm run preview
(Exact scripts can be found in package.json — open that file to verify the available npm scripts.)

Backend & chrome extension

Backend: see the backend/ directory. Follow BACKEND_IMPROVEMENTS_GUIDE.md, BACKEND_MODEL_REPORT.md, and BACKEND_FIXED.md for running and troubleshooting backend components.
Chrome extension: open chrome-extension/, load as an unpacked extension in Chrome (Developer → Extensions → Load unpacked) pointing to the folder.
Architecture & design
See ARCHITECTURE.md for a complete conceptual and component-level explanation, but at a high level:

Frontend: TypeScript SPA built with Vite and Tailwind. Visual and animated verification flows are documented in VISUAL_GUIDE.md and ANIMATED_UI_DOCUMENTATION.md.
Backend: API endpoints for verification, model inference layers, and auditing/logging. The backend integrates ML components (see BACKEND_MODEL_REPORT.md and REAL_AI_BACKEND.md).
Data flows: verification requests from the frontend/extension → backend APIs → model services → result storage and notifications.
Deployment: Vercel for frontend (vercel.json present), with optional GCP services for backend and model hosting (see GCP_DEPLOYMENT_GUIDE.md).
Backend
Directory: backend/
Responsibilities: verification business logic, persistent storage, model inference, worker/queue processing, API endpoints
Docs: BACKEND_IMPROVEMENTS_GUIDE.md, BACKEND_MODEL_REPORT.md, BACKEND_FIXED.md
If the backend is Python-based (some Python files are present in repo), you will likely need a virtual environment and requirements.txt — check the backend folder for exact commands.

Chrome extension
Directory: chrome-extension/
Typical local test flow:
Build the frontend (if extension depends on built frontend assets).
Open Chrome → Extensions → Developer mode → Load unpacked → select chrome-extension/ directory.
See URL_VERIFICATION_IMPLEMENTATION.md and WHATSAPP_INTEGRATION.md for examples of extension-frontend-backend integration.
Deployment & production
Realtime hosting: vercel.json indicates frontend is configured for Vercel deployment.
Cloud backend: GCP deployment instructions exist — see GCP_DEPLOYMENT_GUIDE.md and DEPLOYMENT_INSTRUCTIONS.md.
Production checklist: PRODUCTION_READINESS_CHECKLIST.md
Suggested deployment steps (high level):

Ensure all env vars and API keys exist in the target environment.
Build frontend artifacts and deploy to Vercel (or CDN).
Provision backend services/VMs or cloud run functions and deploy backend.
Configure monitoring, logging, and health checks.
Run smoke tests and review results (see DEPLOYMENT_STATUS.md and DEPLOYMENT_SUMMARY.md for examples).
API keys, auth and external services
API_KEYS_SETUP.md — step-by-step for every external key the app needs.
FIREBASE_SETUP.md & FIREBASE_AUTH_GUIDE.md — Firebase configuration and auth flows.
WHATSAPP_INTEGRATION.md — WhatsApp integration details (if used for notifications/verifications).
Never commit secrets. Use the .env.example file as a template. The repository contains .env.example and .env.updated to help setup.

Testing & quality
Test reports and results are included: TESTING_REPORT.md, TESTING_RESULTS.md, TESTING_REPORT.md
Unit/integration testing: check package.json scripts for test and test configuration.
Model evaluation: BACKEND_MODEL_REPORT.md and 100_PERCENT_ACCURACY_ACHIEVED.md contain details and experiment logs.
For CI:

Add GitHub Actions workflows under .github/workflows/ (if not present) to run lint/test/build pipelines before merging.
Development workflow & contributing
Recommended workflow:

Fork or branch from main: git checkout -b feat/<short-description>
Implement work with descriptive commit messages
Run tests and lint locally
Open a PR describing changes and linking issues
Request reviews and address feedback
Merge when approved
Contributing resources:

Add a CONTRIBUTING.md (I can draft one for you if you want).
Use issue templates and PR templates to make reviews faster.
Code of conduct:

Consider adding CODE_OF_CONDUCT.md if not present.
Roadmap & known improvements
This repository already contains many "status" and "improvements" documents (e.g., BACKEND_IMPROVEMENTS_GUIDE.md, FIX_SUMMARY.md, HOMEPAGE_UPDATES.md). Use those as planning artifacts. Typical short-term roadmap items:

Harden automated tests and add CI
Containerize backend with Docker Compose for local dev
Add role-based access control (RBAC) in backend
Improve model monitoring and drift detection
Add analytics and usage dashboards
Credits & contacts
Made by Data Dragons

Team Lead: Anamitra Sarkar (@Anamitra-Sarkar)
Team members:
Koyeliya Ghosh
Debjit Deb Barman
Sneha Ghorai
Sreeshant Kumar Sharma
For issues or questions: open a GitHub issue at https://github.com/Anamitra-Sarkar/verify/issues

Acknowledgements & license
Many detailed docs are included in repo — please consult them for implementation specifics.
Add a LICENSE file (MIT, Apache-2.0, etc.) if you want to open-source with a specific license.
Appendix: Helpful direct links in this repo

ARCHITECTURE.md: https://github.com/Anamitra-Sarkar/verify/blob/main/ARCHITECTURE.md
QUICK_START.md: https://github.com/Anamitra-Sarkar/verify/blob/main/QUICK_START.md
API_KEYS_SETUP.md: https://github.com/Anamitra-Sarkar/verify/blob/main/API_KEYS_SETUP.md
FIREBASE_SETUP.md: https://github.com/Anamitra-Sarkar/verify/blob/main/FIREBASE_SETUP.md
GCP_DEPLOYMENT_GUIDE.md: https://github.com/Anamitra-Sarkar/verify/blob/main/GCP_DEPLOYMENT_GUIDE.md
VISUAL_GUIDE.md: https://github.com/Anamitra-Sarkar/verify/blob/main/VISUAL_GUIDE.md
BACKEND_MODEL_REPORT.md: https://github.com/Anamitra-Sarkar/verify/blob/main/BACKEND_MODEL_REPORT.md
DEPLOYMENT_INSTRUCTIONS.md: https://github.com/Anamitra-Sarkar/verify/blob/main/DEPLOYMENT_INSTRUCTIONS.md
TESTING_REPORT.md: https://github.com/Anamitra-Sarkar/verify/blob/main/TESTING_REPORT.md
(There are many other files and specialized guides in the repository; browse the repo to locate the specific doc you need.)
