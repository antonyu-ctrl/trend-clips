import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFunctions as getFirebaseFunctions, type Functions } from "firebase/functions";
import { firebaseConfig } from "./config";

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _functions: Functions | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return _app;
}

export function getClientAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
    // Use local persistence to avoid third-party cookie issues in Chrome
    setPersistence(_auth, browserLocalPersistence).catch(() => {});
  }
  return _auth;
}

export function getClientDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getFirebaseApp());
  }
  return _db;
}

export function getClientFunctions(): Functions {
  if (!_functions) {
    _functions = getFirebaseFunctions(getFirebaseApp());
  }
  return _functions;
}
