const admin = require('firebase-admin');

// In a real production environment, you would use a service account JSON file
// For this simulation/demo, we'll initialize with project ID if available
// or a placeholder if the user hasn't provided a service account.
// Since the user provided the frontend config, we can use the project ID.

try {
  admin.initializeApp({
    projectId: process.env.GOOGLE_PROJECT_ID || 'qolinq-production',
  });
  console.log('Firebase Admin initialized');
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

module.exports = admin;
