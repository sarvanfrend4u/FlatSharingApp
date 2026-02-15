
/**
 * FIREBASE CLOUD FUNCTION MIDDLEWARE TEMPLATE
 * 
 * Deployment Instructions:
 * 1. Copy this file into your Firebase project's 'functions/src' folder.
 * 2. Run: firebase functions:secrets:set GEMINI_API_KEY
 * 3. Run: npm install @google/genai
 * 4. Deploy: firebase deploy --only functions
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { GoogleGenAI, Type } from "@google/genai";

export const getAiAnalysis = onCall({ 
  secrets: ["GEMINI_API_KEY"],
  region: "asia-south1" // Optimized for Indian users (Mumbai region)
}, async (request) => {
  // 1. SECURITY: Ensure the user is authenticated via Firebase Auth
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated", 
      "The function must be called while authenticated."
    );
  }

  // 2. INPUT: Get the data sent from the frontend
  const { listingData, userData } = request.data;
  if (!listingData || !userData) {
    throw new HttpsError("invalid-argument", "Missing listing or user data.");
  }

  try {
    // 3. INITIALIZATION: Access the secret key from the environment
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    
    // 4. LOGIC: Replicate the prompt logic securely on the server
    const prompt = `
      Analyze the compatibility between this user and this flat listing for a roommate/rental scenario in India.
      
      User Profile: ${JSON.stringify(userData)}
      Listing Details: ${JSON.stringify(listingData)}

      Return a JSON object with:
      1. score: A number between 0 and 100.
      2. reason: A 2-sentence explanation of the compatibility result.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { 
              type: Type.INTEGER,
              description: 'The compatibility score from 0-100'
            },
            reason: { 
              type: Type.STRING,
              description: 'Short explanation of the score'
            }
          }
        }
      }
    });

    // 5. RESPONSE: Return the analysis to the client
    return {
      analysis: response.text
    };

  } catch (error: any) {
    console.error("AI Middleware Error:", error);
    throw new HttpsError("internal", "AI Analysis failed to process.");
  }
});
