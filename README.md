# E-Hotel Platform

## Overview

E-Hotel is a private prototype reservation platform for a fictional hotel chain. It showcases a complete software development lifecycle, from business analysis and UML modeling to a working implementation using modern web technologies, containerization, and cloud deployment.

## Architecture & Tech Stack

* **Front-End**: ReactJS + Vite, styled with Tailwind CSS
* **Back-End**: Node.js + ExpressJS REST API
* **Authentication & Data**: Firebase Authentication & Firestore
* **Containerization**: Docker (separate Dockerfiles in `/backend` and `/frontend`)
* **CI/CD**: GitHub Actions (build, test, and deploy on merge to `main`)
* **Cloud Infrastructure**: Google Cloud Run, Firestore, Cloud Storage
* **Documentation File**: Contains all explanations, business logic, diagrams

## Business Analysis & UML Models

All analysis deliverables were created in StarUML and exported as images into the [documentation file](SDM-PROJECT.pdf):

* **Use Case Diagrams** & Descriptions
* **Activity & Sequence Diagrams** for booking, check-in, check-out, cancellation
* **Domain Class Diagram** capturing entities (Room, Booking, PaymentTransaction, Invoice, etc.) and relationships
* **Business Rules Classes** (PricingRule, CancellationPolicy)

## Repository Structure

```
/      (root)
├─ backend/         # Express API service
│  ├─ controllers/
│  ├─ middleware/
│  ├─ models/
│  ├─ routes/
│  ├─ services/
│  ├─ credentials/  # service account JSONs (firebase-sa.json, GCP_SA_KEY.json)
│  ├─ .env          # environment variables
│  ├─ Dockerfile
│  ├─ server.js
│  └─ package.json
├─ frontend/        # React + Vite application
│  ├─ public/
│  ├─ src/
│  ├─ .env
│  ├─ firebase.json
│  ├─ tailwind.config.js
│  ├─ vite.config.js
│  ├─ Dockerfile
│  └─ package.json
└─ SDM-Project.docx
```

## Prerequisites

* **Node.js** v16+
* **Docker** (for container builds)
* **Firebase CLI** (for auth and Firestore emulation)
* **Google Cloud SDK** (for deployments)

## Local Development

### 1. Backend

```bash
cd backend
cp credentials/.example.env .env       # populate with your keys
npm install
npm run dev                           # starts Express server (nodemon)
```

API runs at [http://localhost:8080](http://localhost:8080)

### 2. Frontend

```bash
cd frontend
cp .env.example .env                  # add your Firebase config
npm install
npm run dev                           # starts Vite dev server
```

App runs at [http://localhost:5173](http://localhost:5173)

## Containerization

### Build Images

```bash
docker build -t e-hotel-backend ./backend
docker build -t e-hotel-frontend ./frontend
```

### Run Containers

```bash
docker run -d -p 5000:5000 e-hotel-backend
docker run -d -p 3000:4173 e-hotel-frontend
```

*(Adjust ports as needed)*

## CI/CD & Deployment

* **GitHub Actions** workflows reside in `.github/workflows/`.
* On merge to `main`, actions will lint, test, build Docker images, and deploy to Google Cloud Run.
* **Cloud Run** services auto-scale; images are pushed to Google Container Registry.

## UML Diagrams & Documentation

All UML models are in the `/docs` folder, including `.mdj` (StarUML) and exported PNG/SVG formats for easy reference.

---
