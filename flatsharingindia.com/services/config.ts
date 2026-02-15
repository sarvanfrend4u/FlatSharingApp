
/**
 * APP CONFIGURATION
 * 
 * IF YOU STILL SEE 401: invalid_client:
 * 1. Go to https://console.cloud.google.com/apis/credentials
 * 2. Verify the Client ID below is listed under "OAuth 2.0 Client IDs".
 * 3. Verify the "Type" is EXACTLY "Web application".
 * 4. Verify "Authorized JavaScript origins" contains:
 *    - https://flatsharingapp.web.app
 *    - https://flatsharingapp.firebaseapp.com
 *    - http://localhost:3000
 * (Ensure NO trailing slashes are present in the console)
 */

export const GOOGLE_CLIENT_ID = "587734532884-s9g7udtktu52s59po2tlmdpes3ohl505.apps.googleusercontent.com";

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCaY8Uaiynl_rL64weE82Zgs4rGbarBZlA",
  authDomain: "flatsharingapp.firebaseapp.com",
  projectId: "flatsharingapp",
  storageBucket: "flatsharingapp.firebasestorage.app",
  messagingSenderId: "587734532884",
  appId: "1:587734532884:web:377c9dd9bf6d9a29337801",
  measurementId: "G-VFMGP40Q0V"
};
