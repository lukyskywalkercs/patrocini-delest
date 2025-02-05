import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDs1w0UhFfDBZSGHAUkjRKcyMvGx2Bswz4",
  authDomain: "patrocini-delest.firebaseapp.com",
  projectId: "patrocini-delest",
  storageBucket: "patrocini-delest.appspot.com",
  messagingSenderId: "157282872575",
  appId: "1:157282872575:web:f210a3d490b568a47470ca"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 