// firebase.js
require("dotenv").config();
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const dbId = process.env.FIRESTORE_DATABASE_ID; // e.g. "e-hotel" or "e-hotel-sdm-db"

// Initialize Firebase Admin
try {
  if (saPath && fs.existsSync(saPath)) {
    const serviceAccount = require(saPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("🔑 Using SA:", serviceAccount.client_email);
    console.log("⚙️  Project ID:", serviceAccount.project_id);
  } else {
    console.warn(
      "⚠️  Service account path not found or invalid, falling back to ADC"
    );
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log("ℹ️  Using ADC, project:", admin.app().options.projectId);
  }

  // Initialize Firestore
  const db = dbId ? getFirestore(admin.app(), dbId) : getFirestore(admin.app());
  console.log("🎯 Connected to Firestore database:", dbId || "(default)");

  module.exports = { admin, db };
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  throw error;
}
