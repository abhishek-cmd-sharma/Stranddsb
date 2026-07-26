const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '..', 'firebaseServiceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  
  initializeApp({
    credential: cert(serviceAccount)
  });
  console.log('Firebase Admin SDK initialized successfully.');
} else {
  console.warn('\nWARNING: firebaseServiceAccountKey.json not found in backend directory!');
  // We initialize it without credentials just so the app doesn't crash on boot
  initializeApp();
}

module.exports = { auth: getAuth };
