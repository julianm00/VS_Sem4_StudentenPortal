import firebaseAdmin from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json";

const useEmulator = true;
if (useEmulator) {
  process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8080";
  process.env["FIREBASE_AUTH_EMULATOR_HOST"] = "localhost:9099";
}

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  storageBucket: "gs://testme-fabf7.appspot.com",
  projectId: "testme-fabf7",
});

export const transformCollectionIntoMap = (collection) => {
  return collection.map((doc) => {
    return doc.data();
  });
};

export const db = firebaseAdmin.firestore();
export const auth = firebaseAdmin.auth();
