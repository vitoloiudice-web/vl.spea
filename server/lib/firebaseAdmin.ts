import { initializeApp, getApps, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App;
if (getApps().length === 0) {
  app = initializeApp();  // ADC automatiche su Cloud Run, zero env vars
} else {
  app = getApps()[0]!;
}

export const db: Firestore = getFirestore(app);
export const COLLECTION_NAME = "companies" as const;
