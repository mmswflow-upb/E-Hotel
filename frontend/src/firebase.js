// Correct for Firebase v11 using ES modules:
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "./firebaseConfig"; // your config file

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
