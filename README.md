# E-Hotel Platform

## Overview

E-Hotel is a private prototype reservation platform for a fictional hotel chain. It showcases a complete software development lifecycle, from business analysis and UML modeling to a working implementation using modern web technologies, containerization, and cloud deployment.

## Architecture & Tech Stack

- **Front-End**: ReactJS + Vite, styled with Tailwind CSS
- **Back-End**: Node.js + ExpressJS REST API
- **Authentication & Data**: Firebase Authentication & Firestore
- **Containerization**: Docker (backend only)
- **CI/CD**: GitHub Actions (build, test, and deploy on merge to `main`)
- **Cloud Infrastructure**: Google Cloud Run, Firestore
- **Documentation File**: Contains all explanations, business logic, diagrams

## Business Analysis & UML Models

All analysis deliverables were created in StarUML and exported as images into the [documentation file](SDM-Project.pdf):

- **Use Case Diagrams** & Descriptions
- **Activity & Sequence Diagrams** for booking, check-in, check-out, cancellation
- **Domain Class Diagram** capturing entities (Room, Booking, PaymentTransaction, Invoice, etc.) and relationships
- **Business Rules Classes** (PricingRule, CancellationPolicy)

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
│  └─ package.json
└─ SDM-Project.pdf
```

## Prerequisites

- **Node.js** v18.18.0+
- **Docker** (for backend container builds)
- **Firebase CLI** (for auth and Firestore emulation)
- **Google Cloud SDK** (for deployments)

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Firebase Configuration
GOOGLE_APPLICATION_CREDENTIALS=./credentials/firebase-sa.json
FIRESTORE_DATABASE_ID=e-hotel

# Server Configuration
PORT=3000
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory with the following variable:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api
```

## Local Development

### 1. Backend Setup

```bash
cd backend
npm install
npm start                           # starts Express server
```

API runs at [http://localhost:3000](http://localhost:3000)

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev                         # starts Vite dev server
```

App runs at [http://localhost:5173](http://localhost:5173)

## Containerization (Backend Only)

### Build Backend Image

```bash
docker build -t e-hotel-backend ./backend
```

### Run Backend Container

```bash
docker run -d -p 3000:3000 e-hotel-backend
```

## CI/CD & Deployment

- **GitHub Actions** workflows reside in `.github/workflows/`.
- On merge to `main`, actions will build Docker images and deploy to Google Cloud Run.
- **Cloud Run** services auto-scale; images are pushed to Google Container Registry.

## UML Diagrams & Documentation

All UML models are in the `SDM-Project.pdf` file, including (StarUML/PlantUML) as exported PNG/SVG formats for easy reference.

---
