
# 🏠 FlatSharingIndia.com
### AI-Powered Flatmate & Room Discovery Platform

FlatSharingIndia.com is a modern web application designed to help people in India find the perfect flatmate using **Gemini AI Compatibility Matching**. It solves the "bad roommate" problem by analyzing lifestyle preferences (diet, smoking, drinking, budget) against house rules using advanced LLMs.

---

## 🚀 Key Features

- **🤖 AI Match Score**: Every listing shows a compatibility percentage based on your profile vs. the house rules, powered by Google Gemini.
- **🛡️ Secure Onboarding**: Full authentication and user profiles powered by Firebase.
- **📍 Location-Specific Discovery**: Optimized for major Indian hubs like Bangalore, Mumbai, Delhi, Pune, and Chennai.
- **⚡ Real-time Listings**: Create and browse flat listings that sync instantly to the cloud.
- **💬 Direct Connect**: In-app messaging system to reach out to potential flatmates.
- **🏙️ Amenity Insights**: AI-generated estimates for nearby transport (Metro, Bus) and essentials (Hospitals).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS, Lucide Icons
- **Backend-as-a-Service**: Firebase (Auth, Firestore)
- **Intelligence**: Google Gemini API (gemini-3-flash-preview)
- **State Management**: React Hooks

---

## 🔴 IMPORTANT: Fixing "Permission Denied" Errors

If you see a "Missing or insufficient permissions" error, it means your Firestore rules are blocking the app. Follow these steps:

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: `flatsharingapp`.
3. Click on **Firestore Database** in the left sidebar.
4. Click on the **Rules** tab.
5. **Paste the following rules** and click **Publish**:

```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read listings
    match /listings/{listingId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- A Google Cloud Project with the **Gemini API** enabled.
- A Firebase Project with **Firestore** and **Email/Password Auth** enabled.

### 2. Configuration
The application uses the following Firebase configuration (pre-configured in `services/firebase.ts`):
- **Project ID**: `flatsharingapp`
- **Region**: Multi-region (India compatible)

### 3. Running Locally
Since this project uses ES6 modules directly:
1. Open `index.html` using a local development server (like VS Code Live Server).
2. Ensure you have internet connectivity for the CDN-loaded dependencies.

---

## 📈 Roadmap

- [ ] **Native Mobile App**: Conversion to React Native.
- [ ] **Document Verification**: Integration with Aadhaar-based KYC for "Verified" badges.
- [ ] **Map View**: Full Google Maps integration for exact coordinates.
- [ ] **Video Tours**: Support for Veo-generated or uploaded walkthrough videos.

---

## 📄 License
MIT License - feel free to use this for your own projects!

---
*Built with ❤️ for the Indian Flatsharing Community.*
