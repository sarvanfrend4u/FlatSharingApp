
import { GoogleGenAI, Type } from "@google/genai";
import { httpsCallable } from "@firebase/functions";
import { functions } from "./firebase";
import { User, Listing, ForumAnswer } from '../types';

/**
 * PRODUCTION TOGGLE:
 * Set to true to route heavy AI calls through your secure Firebase Cloud Function.
 */
const USE_MIDDLEWARE = true; 

// Local SDK instance (Fallback)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMatchAnalysis = async (user: User | null, listing: Listing): Promise<{ score: number; reason: string }> => {
  if (!user) {
    return { score: 0, reason: "Please log in to view match compatibility." };
  }
  
  if (USE_MIDDLEWARE && functions) {
    try {
      const getAiAnalysis = httpsCallable(functions, 'getAiAnalysis');
      const response: any = await getAiAnalysis({ listingData: listing, userData: user });
      
      const data = typeof response.data.analysis === 'string' 
        ? JSON.parse(response.data.analysis) 
        : response.data.analysis;
        
      return {
        score: data.score ?? 50,
        reason: data.reason ?? "Analysis completed via secure middleware."
      };
    } catch (e) {
      console.warn("Middleware failed, using local fallback...", e);
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze matching between User: ${JSON.stringify(user)} and Listing: ${JSON.stringify(listing)} for Indian flatsharing. Return JSON {score: number, reason: string}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            reason: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { score: 0, reason: "Unable to calculate match score." };
  }
};

/**
 * AI Moderation for Forum Posts
 */
export const moderateForumPost = async (title: string, body: string): Promise<{ approved: boolean, reason?: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a community moderator for FlatSharingIndia.com. Your job is to ensure all posts are strictly about Indian real estate, flat-sharing, renting, or urban logistics. Reject off-topic posts. 
      Title: ${title}
      Body: ${body}
      Return JSON {approved: boolean, reason: string}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            approved: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{"approved": false, "reason": "System Error"}');
  } catch (e) {
    return { approved: true }; // Fallback to permissive if AI fails
  }
};

/**
 * AI TL;DR for Forum Threads
 */
export const getThreadSummary = async (question: string, answers: string[]): Promise<string> => {
  if (answers.length === 0) return "";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the community consensus for this housing question in India. Keep it helpful and under 40 words.
      Question: ${question}
      Answers: ${answers.join(" | ")}`,
    });
    return response.text || "";
  } catch (e) {
    return "";
  }
};

export interface AmenityGrounding {
  bus: string;
  metro: string;
  hospital: string;
  sources: { title: string; uri: string }[];
}

export const calculateNearbyAmenities = async (city: string, area: string, landmark: string): Promise<AmenityGrounding> => {
  try {
    const prompt = `Identify the single nearest Bus Stop, Metro Station, and Hospital to ${landmark || area}, ${city}, India. Provide names and approx distances.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const text = response.text || "";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = chunks
      .filter((c: any) => c.maps)
      .map((c: any) => ({
        title: c.maps.title,
        uri: c.maps.uri
      }));

    const extractName = (type: string) => {
        const regex = new RegExp(`${type}[^,.]*`, 'i');
        const match = text.match(regex);
        return match ? match[0].trim().replace(/\*/g, '') : "Nearby Available";
    };

    return {
      bus: extractName("Bus Stop"),
      metro: extractName("Metro"),
      hospital: extractName("Hospital"),
      sources: sources.slice(0, 3) 
    };

  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return { bus: "Nearby", metro: "Nearby", hospital: "Nearby", sources: [] };
  }
};

export const generateListingDescription = async (details: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Write a punchy, 40-word real estate description for a flat in India: ${details}`,
        });
        return response.text || "Spacious room in a prime locality.";
    } catch (e) {
        return "Cozy flat sharing opportunity.";
    }
}
