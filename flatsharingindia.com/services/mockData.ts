
import { 
  Listing, Gender, OccupancyType, User, Diet, FlatType, 
  FurnishingStatus, ForumQuestion, ChatSession, SmokingHabit, 
  DrinkingHabit, Cleanliness, SocialVibe, GuestPolicy, AcUsage, 
  MaidPreference, CookPreference, ProfessionalType, WorkMode,
  WorkTiming, RelationshipStatus, MoveInTimeline, StayDuration,
  UserRole, ForumAnswer
} from '../types';

export const CITY_LOCATIONS: Record<string, string[]> = {
  'Bangalore': ['Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'Bellandur', 'Jayanagar', 'Electronic City', 'Malleswaram', 'Marathahalli', 'BTM Layout'],
  'Mumbai': ['Bandra West', 'Andheri West', 'Powai', 'Juhu', 'Colaba', 'Dadar', 'Thane', 'Goregaon', 'Lower Parel', 'Worli'],
  'Delhi': ['Connaught Place', 'Hauz Khas', 'Dwarka', 'Saket', 'Vasant Kunj', 'Rohini', 'Lajpat Nagar', 'Greater Kailash', 'Noida', 'Gurgaon'],
  'Pune': ['Koregaon Park', 'Viman Nagar', 'Baner', 'Hinjewadi', 'Wakad', 'Kothrud', 'Magarpatta', 'Kalyani Nagar'],
  'Chennai': ['OMR', 'Adyar', 'Velachery', 'Anna Nagar', 'T Nagar', 'Tambaram', 'Guindy', 'Thiruvanmiyur']
};

export const MOCK_USER: User = {
  id: "u1",
  name: "Arjun Mehta",
  avatar: "https://picsum.photos/seed/arjun/100/100",
  isLister: false,
  role: UserRole.Seeker,
  verified: true,
  age: 27,
  gender: Gender.Male,
  professionalType: ProfessionalType.Professional,
  workMode: WorkMode.Hybrid,
  workTiming: WorkTiming.Fixed,
  relationshipStatus: RelationshipStatus.Single,
  moveInTimeline: MoveInTimeline.FifteenDays,
  intendedStay: StayDuration.LongTerm,
  profession: "Sr. Software Engineer",
  company: "Zomato",
  hometown: "Lucknow",
  nativeState: "Uttar Pradesh",
  motherTongue: "Hindi",
  languages: ["Hindi", "English", "Punjabi"],
  bio: "Looking for a quiet, organized space in Indiranagar.",
  linkedinUrl: "https://linkedin.com/in/arjun-mehta",
  preferences: {
    diet: Diet.NonVeg,
    dietStrictness: 'Flexible',
    smoking: SmokingHabit.StrictNo,
    drinking: DrinkingHabit.Social,
    pets: false,
    earlyBird: false,
    genderPreference: Gender.Male,
    budgetMax: 28000,
    hasBike: true,
    hasCar: false,
    parkingRequired: true,
    cleanliness: Cleanliness.Organized,
    socialVibe: SocialVibe.Social,
    guestPolicy: GuestPolicy.DayGuests,
    oppositeGenderGuests: false,
    acUsage: AcUsage.Moderate,
    maidPreference: MaidPreference.DailyMaid,
    cookPreference: CookPreference.CommonCook,
    lateNightGate: false,
    utensilSharing: 'Common',
    morningBathroomTime: '08:00 AM'
  }
};

export const MOCK_LISTINGS: Listing[] = [
  {
    id: "l1",
    title: "Spacious Room in Indiranagar",
    description: "Looking for a chill flatmate. Fully furnished 2BHK.",
    price: 18000,
    deposit: 50000,
    maintenance: 2500,
    noticePeriod: "1 Month",
    location: { city: "Bangalore", area: "Indiranagar" },
    type: OccupancyType.Single,
    bhk: FlatType.BHK2,
    washroom: 'Attached',
    totalRoommates: 2,
    furnishing: FurnishingStatus.Full,
    availableFrom: "2023-11-01",
    gender: Gender.Male,
    amenities: ["WiFi", "AC", "Washing Machine"],
    detailedAmenities: {
      fridge: true,
      washingMachine: true,
      microwave: true,
      induction: true,
      ro: true,
      wifi: true,
      ac: true
    },
    bikeParking: true,
    carParking: true,
    rules: { 
      smoking: false, 
      drinking: true, 
      pets: false, 
      visitors: 'Overnight Allowed', 
      oppositeGenderGuests: true, 
      nonVeg: true, 
      vegOnlyHouse: false, 
      separateUtensils: false, 
      gateRestrictions: false 
    },
    maidAvailable: true,
    cookPreference: CookPreference.CommonCook,
    images: ["https://picsum.photos/seed/room1/400/300"],
    ownerId: "o1",
    createdAt: "2023-10-25"
  }
];

export const MOCK_FORUM_QUESTIONS: ForumQuestion[] = [
  {
    id: "q1",
    authorId: "u10",
    authorName: "Rahul Sharma",
    authorAvatar: "https://picsum.photos/seed/rahul/100/100",
    authorRole: UserRole.Seeker,
    city: "Bangalore",
    category: 'RENT',
    title: "Why are rents in Koramangala sky-rocketing?",
    body: "I've been looking for a 1BHK in Koramangala 4th block and everyone is asking for 35k+. Is this normal now or am I being overcharged?",
    upvotes: 42,
    answerCount: 3,
    createdAt: "2023-10-28T10:00:00Z",
    isVerifiedLocal: true
  },
  {
    id: "q2",
    authorId: "u11",
    authorName: "Priya K.",
    authorAvatar: "https://picsum.photos/seed/priya/100/100",
    authorRole: UserRole.Lister,
    city: "Mumbai",
    category: 'LEGAL',
    title: "Standard rental agreement clauses for Mumbai?",
    body: "Is it mandatory to have a 11-month agreement or can we go for longer? Also, what's the standard notice period for Bandra?",
    upvotes: 28,
    answerCount: 5,
    createdAt: "2023-10-29T14:30:00Z"
  }
];

export const MOCK_FORUM_ANSWERS: Record<string, ForumAnswer[]> = {
  "q1": [
    {
      id: "a1",
      questionId: "q1",
      authorId: "u20",
      authorName: "Sneha G.",
      authorAvatar: "https://picsum.photos/seed/sneha/100/100",
      authorRole: UserRole.Lister,
      body: "Koramangala is currently high demand due to its proximity to the new tech parks and startup hubs. 30-35k for a good 1BHK is unfortunately the new market rate.",
      upvotes: 15,
      createdAt: "2023-10-28T12:00:00Z"
    },
    {
      id: "a2",
      questionId: "q1",
      authorId: "gemini",
      authorName: "Tribe AI",
      authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=gemini",
      authorRole: UserRole.Lister,
      body: "Consensus from the tribe: Rents in Koramangala have seen a 20% hike this year. Most seekers recommend looking at BTM Layout or HSR Sector 2 for better value if you work in the area.",
      upvotes: 99,
      isGeminiSummary: true,
      createdAt: "2023-10-28T13:00:00Z"
    }
  ]
};

export const MOCK_CHATS: ChatSession[] = [
  {
    id: "c1",
    partnerName: "Siddharth Rao",
    partnerAvatar: "https://picsum.photos/seed/sid/100/100",
    lastMessage: "Hey, is the Indiranagar room still available?",
    unreadCount: 2
  }
];
