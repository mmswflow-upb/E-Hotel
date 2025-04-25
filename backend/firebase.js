// firebase.js
require("dotenv").config();
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

const dbId = process.env.FIRESTORE_DATABASE_ID; // e.g. "e-hotel" or "e-hotel-sdm-db"

// Initialize Firebase Admin
try {
  // Initialize with Application Default Credentials
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });

  console.log("ℹ️  Using ADC, project:", admin.app().options.projectId);

  // Initialize Firestore
  const db = dbId ? getFirestore(admin.app(), dbId) : getFirestore(admin.app());
  console.log("🎯 Connected to Firestore database:", dbId || "(default)");

  module.exports = { admin, db };
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  throw error;
}
