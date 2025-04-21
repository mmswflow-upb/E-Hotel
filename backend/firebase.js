// firebase.js
require("dotenv").config();
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const dbId = process.env.FIRESTORE_DATABASE_ID; // e.g. "e-hotel" or "e-hotel-sdm-db"

if (saPath) {
  const serviceAccount = require(saPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("🔑 Using SA:", serviceAccount.client_email);
  console.log("⚙️  Project ID:", serviceAccount.project_id);
} else {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
  console.log("ℹ️  Using ADC, project:", admin.app().options.projectId);
}

// **Here’s the magic**:
const db = dbId ? getFirestore(admin.app(), dbId) : getFirestore(admin.app());

console.log("🎯 Connected to Firestore database:", dbId || "(default)");

module.exports = { admin, db };
