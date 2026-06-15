import { initializeApp } from 'firebase/app';
import { initializeFirestore, memoryLocalCache } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyArS7-Mh6DwYG1t6m-LU7THcCIHgK3og1E",
  authDomain: "pensei-app.firebaseapp.com",
  projectId: "pensei-app",
  storageBucket: "pensei-app.firebasestorage.app",
  messagingSenderId: "402181231408",
  appId: "1:402181231408:web:49bb9952d10447d4e12ef5",
  measurementId: "G-PJJHQNQSK8"
};

const app = initializeApp(firebaseConfig);

const db = initializeFirestore(app, {
  localCache: memoryLocalCache() 
});

export { db };