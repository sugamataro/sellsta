// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCyvl3hKzaMfJnxKB1YCbpUJO5VknfGfWY',
  authDomain: 'inhouseapp-for-staff.firebaseapp.com',
  projectId: 'inhouseapp-for-staff',
  storageBucket: 'inhouseapp-for-staff.firebasestorage.app',
  messagingSenderId: '331224847489',
  appId: '1:331224847489:web:4f3f47d04d751a626fa980',
  measurementId: 'G-22TXHEVBV2',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const auth = getAuth(app)
const db = getFirestore(app)

export { app, analytics, auth, db }
