
import { initializeApp } from "@firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithCredential, signOut } from "@firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  getDoc, 
  limit, 
  where, 
  deleteDoc,
  onSnapshot
} from "@firebase/firestore";
import { getFunctions } from "@firebase/functions";
import { getAnalytics } from "firebase/analytics";
import { Listing, User } from "../types";
import { MOCK_LISTINGS } from "./mockData";
import { FIREBASE_CONFIG } from "./config";

const firebaseConfig = FIREBASE_CONFIG;

export const isSimulationMode = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("REPLACE_WITH");

let app: any, auth: any, db: any, functions: any, analytics: any;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  functions = getFunctions(app);
  if (!isSimulationMode) {
    analytics = getAnalytics(app);
  }
} catch (e) {
  console.warn("Firebase initialization failed.", e);
}

export const googleProvider = new GoogleAuthProvider();

export { auth, db, functions, analytics, firebaseConfig, signOut };

export const checkFirebaseStatus = async () => {
    if (isSimulationMode || !db) return { connected: false, error: "Missing Credentials" };
    try {
        const q = query(collection(db, "listings"), limit(1));
        await getDocs(q);
        return { connected: true };
    } catch (e: any) {
        return { connected: false, error: e.message };
    }
};

/**
 * Real-time subscription to a specific user's profile
 */
export const subscribeToUserProfile = (userId: string, callback: (user: User | null) => void) => {
  if (!db) return () => {};
  const docRef = doc(db, "users", userId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as User);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("User profile subscription error:", error);
  });
};

/**
 * Real-time subscription to all listings
 */
export const subscribeToListings = (callback: (listings: Listing[]) => void) => {
  if (!db) {
    callback(MOCK_LISTINGS);
    return () => {};
  }
  const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (querySnapshot) => {
    const listings: Listing[] = [];
    querySnapshot.forEach((doc) => {
      listings.push({ ...doc.data(), id: doc.id } as Listing);
    });
    callback(listings);
  }, (error) => {
    console.error("Listings subscription error:", error);
    callback(MOCK_LISTINGS);
  });
};

export const saveUserToFirestore = async (user: User) => {
  if (!db) return;
  try {
    await setDoc(doc(db, "users", user.id), user);
  } catch (e: any) {
    console.error("Failed to save user", e);
    throw e;
  }
};

export const getUserFromFirestore = async (userId: string): Promise<User | null> => {
  if (!db) return null;
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as User) : null;
  } catch (e: any) {
    console.error("Firestore Error:", e);
    return null;
  }
};

export const createListingInFirestore = async (listing: Listing) => {
  if (!db) return;
  try {
    const docRef = await addDoc(collection(db, "listings"), listing);
    return docRef.id;
  } catch (e: any) {
    console.error("Failed to create listing", e);
    throw e;
  }
};

export const deleteListingFromFirestore = async (listingId: string) => {
  if (!db) return;
  try {
    await deleteDoc(doc(db, "listings", listingId));
  } catch (e) {
    console.error("Delete failed", e);
    throw e;
  }
};

export const fetchListingsFromFirestore = async (): Promise<Listing[]> => {
  if (!db) return MOCK_LISTINGS;
  try {
    const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const listings: Listing[] = [];
    querySnapshot.forEach((doc) => {
      listings.push({ ...doc.data(), id: doc.id } as Listing);
    });
    return listings;
  } catch (e: any) {
    return MOCK_LISTINGS;
  }
};

export const fetchUserListingsFromFirestore = async (userId: string): Promise<Listing[]> => {
  if (!db) return [];
  try {
    const q = query(collection(db, "listings"), where("ownerId", "==", userId));
    const querySnapshot = await getDocs(q);
    const listings: Listing[] = [];
    querySnapshot.forEach((doc) => {
      listings.push({ ...doc.data(), id: doc.id } as Listing);
    });
    return listings;
  } catch (e) {
    console.error("Fetch user listings error", e);
    return [];
  }
};

export const signInWithGoogleCredential = async (idToken: string) => {
  if (!auth) return;
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
};
