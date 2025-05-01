// firebase.js
require("dotenv").config();
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const path = require("path");

const dbId = process.env.FIRESTORE_DATABASE_ID; // e.g. "e-hotel" or "e-hotel-sdm-db"

// Initialize Firebase Admin
try {
  // Initialize with service account credentials
  const serviceAccountPath = path.join(
    process.cwd(),
    "credentials",
    "firebase-sa.json"
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });

  console.log(
    "ℹ️  Using service account credentials, project:",
    admin.app().options.projectId
  );

  // Initialize Firestore
  const db = dbId ? getFirestore(admin.app(), dbId) : getFirestore(admin.app());
  console.log("🎯 Connected to Firestore database:", dbId || "(default)");

  module.exports = { admin, db };
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  throw error;
}
