// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "./firebaseConfig";

// Make sure firebaseConfig is defined and imported correctly
if (!firebaseConfig) {
  console.error("Firebase configuration is missing!");
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase Auth (and any other service you need)
export const auth = getAuth(app);
export default app;
