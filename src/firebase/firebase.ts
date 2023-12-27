import { initializeApp } from "firebase/app"
import { connectAuthEmulator, getAuth } from "firebase/auth"
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore"
import { connectFunctionsEmulator, getFunctions } from "firebase/functions"

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const firestore = getFirestore(app)
export const functions = getFunctions(app)

if (process.env.NODE_ENV !== "production") {
  connectAuthEmulator(auth, "http://localhost:9099")
  connectFirestoreEmulator(firestore, "localhost", 8080)
  connectFunctionsEmulator(functions, "localhost", 5001)
}
