import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyC5b6N6A1fFxdUyWdZh0RqxvfdM--YD8P0",
  authDomain: "signal-9546d.firebaseapp.com",
  projectId: "signal-9546d",
  storageBucket: "signal-9546d.appspot.com",
  messagingSenderId: "312735607354",
  appId: "1:312735607354:web:78b487832370b170e32303",
}

initializeApp(firebaseConfig)

export const auth = getAuth()
