
export enum Gender {
  Male = "Male",
  Female = "Female",
  NonBinary = "Non-Binary",
  Any = "Any"
}

export enum UserRole {
  Seeker = "SEEKER",
  Lister = "LISTER"
}

export enum OccupancyType {
  Single = "Single",
  Shared = "Shared",
  EntireFlat = "Entire Flat"
}

export enum Diet {
  Veg = "Veg",
  NonVeg = "Non-Veg",
  Eggetarian = "Eggetarian",
  Vegan = "Vegan"
}

export enum FurnishingStatus {
  Full = "Fully Furnished",
  Semi = "Semi-Furnished",
  None = "Unfurnished"
}

export enum FlatType {
  RK1 = "1 RK",
  BHK1 = "1 BHK",
  BHK2 = "2 BHK",
  BHK3 = "3 BHK",
  BHK4Plus = "4+ BHK"
}

export enum SmokingHabit {
  StrictNo = "Strict No",
  Social = "Social (Outside)",
  Regular = "Regular"
}

export enum DrinkingHabit {
  Teetotaler = "Teetotaler",
  Social = "Social",
  Regular = "Regular"
}

export enum ProfessionalType {
  Professional = "Working Professional",
  Student = "Student",
  Freelancer = "Freelancer",
  Entrepreneur = "Entrepreneur",
  JobSeeker = "Job Seeker"
}

export enum WorkMode {
  WFH = "WFH",
  WFO = "WFO",
  Hybrid = "Hybrid"
}

export enum WorkTiming {
  Fixed = "Fixed (9-6)",
  Rotational = "Rotational",
  Night = "Night Shift"
}

export enum RelationshipStatus {
  Single = "Single",
  Committed = "In a Relationship",
  Married = "Married"
}

export enum MoveInTimeline {
  Immediate = "Immediate",
  FifteenDays = "Within 15 days",
  OneMonth = "1 Month+",
  Browsing = "Just Browsing"
}

export enum StayDuration {
  ShortTerm = "Short Term (< 6m)",
  LongTerm = "Long Term (1y+)"
}

export enum Cleanliness {
  Minimalist = "Minimalist",
  Organized = "Organized",
  Relaxed = "Relaxed"
}

export enum SocialVibe {
  Private = "Private",
  Social = "Social/Friendly"
}

export enum GuestPolicy {
  NoGuests = "No Guests",
  DayGuests = "Day Guests Only",
  Overnight = "Overnight Allowed"
}

export enum MaidPreference {
  DailyMaid = "Daily Maid",
  Independent = "Independent",
  NoMaid = "No Maid"
}

export enum CookPreference {
  CommonCook = "Common Cook",
  SelfCooking = "Self Cooking",
  TiffinTakeout = "Tiffin/Takeout"
}

export enum AcUsage {
  Low = "Fan Only",
  Moderate = "Night Only",
  Heavy = "Always On"
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  isLister: boolean;
  role?: UserRole;
  verified?: boolean;
  
  // Demographic & Professional
  age?: number;
  gender: Gender;
  professionalType: ProfessionalType;
  workMode: WorkMode;
  workTiming: WorkTiming;
  university?: string;
  relationshipStatus: RelationshipStatus;
  moveInTimeline: MoveInTimeline;
  intendedStay: StayDuration;
  
  // Identity Details
  profession?: string;
  company?: string;
  hometown?: string;
  nativeState?: string;
  motherTongue?: string;
  languages?: string[];
  bio?: string;

  // Social Proof
  linkedinUrl?: string;
  instagramHandle?: string;

  // Lifestyle Preferences
  preferences: {
    diet: Diet;
    dietStrictness?: 'Flexible' | 'Strict (No Non-Veg in house)' | 'Sattvic (No Onion/Garlic)';
    smoking: SmokingHabit;
    drinking: DrinkingHabit;
    pets: boolean;
    earlyBird: boolean;
    genderPreference: Gender;
    budgetMax: number;
    
    // Parking / Vehicle
    hasBike: boolean;
    hasCar: boolean;
    parkingRequired: boolean;
    
    // Detailed Lifestyle
    cleanliness: Cleanliness;
    socialVibe: SocialVibe;
    guestPolicy: GuestPolicy;
    oppositeGenderGuests: boolean;
    acUsage: AcUsage;
    
    // Indian House Nuances
    maidPreference: MaidPreference;
    cookPreference: CookPreference;
    lateNightGate: boolean;
    utensilSharing: 'Common' | 'Separate';
    morningBathroomTime?: string;
  };
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  deposit: number;
  maintenance: number;
  noticePeriod: string;
  location: {
    city: string;
    area: string;
    coordinates?: { lat: number; lng: number };
  };
  address?: string;
  landmark?: string;
  nearbyDistances?: {
    busStop: string;
    metro: string;
    hospital: string;
  };
  type: OccupancyType;
  bhk: FlatType;
  washroom: 'Attached' | 'Common';
  totalRoommates: number;
  furnishing: FurnishingStatus;
  availableFrom: string;
  gender: Gender;
  amenities: string[];
  
  // Detailed Amenities
  detailedAmenities: {
    fridge: boolean;
    washingMachine: boolean;
    microwave: boolean;
    induction: boolean;
    ro: boolean;
    wifi: boolean;
    ac: boolean;
  };

  // Parking availability
  bikeParking: boolean;
  carParking: boolean;
  
  rules: {
    smoking: boolean; 
    drinking: boolean; 
    pets: boolean; 
    visitors: 'Day Only' | 'Overnight Allowed' | 'No Guests';
    oppositeGenderGuests: boolean;
    nonVeg: boolean; 
    vegOnlyHouse: boolean;
    separateUtensils: boolean;
    gateRestrictions: boolean;
  };

  maidAvailable: boolean;
  cookPreference: CookPreference;

  images: string[];
  ownerId: string;
  matchScore?: number; 
  createdAt: string;
}

export type ForumCategory = 'RENT' | 'LOCALITY' | 'LEGAL' | 'LOGISTICS' | 'LIFESTYLE';

export interface ForumQuestion {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  city: string;
  category: ForumCategory;
  title: string;
  body: string;
  upvotes: number;
  answerCount: number;
  createdAt: string;
  isVerifiedLocal?: boolean;
}

export interface ForumAnswer {
  id: string;
  questionId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  body: string;
  upvotes: number;
  isGeminiSummary?: boolean;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  partnerName: string;
  partnerAvatar: string;
  lastMessage: string;
  unreadCount: number;
}

export type ViewState = 'ONBOARDING' | 'DISCOVERY' | 'CREATE_LISTING' | 'COMMUNITY' | 'PROFILE' | 'LISTING_DETAIL';
