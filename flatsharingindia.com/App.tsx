
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ViewState, User, Diet, Gender, Listing, SmokingHabit, DrinkingHabit,
  ProfessionalType, WorkMode, WorkTiming, RelationshipStatus,
  MoveInTimeline, StayDuration, UserRole 
} from './types';
import { 
  auth, 
  googleProvider, 
  checkFirebaseStatus, 
  signInWithGoogleCredential,
  subscribeToListings,
  subscribeToUserProfile
} from './services/firebase';
import { MOCK_USER } from './services/mockData';
import { onAuthStateChanged, signInWithPopup } from '@firebase/auth';
import { GOOGLE_CLIENT_ID } from './services/config';

// Components
import { Navigation } from './components/Navigation';
import { Discovery } from './components/Discovery';
import { Onboarding } from './components/Onboarding';
import { CreateListing } from './components/CreateListing';
import { Community } from './components/Community';
import { ListingDetail } from './components/ListingDetail';
import { Profile } from './components/Profile';
import { Loader2, Chrome, X, Sparkles, ShieldAlert, Search, Home as HomeIcon, Building2 } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

const AUTH_BYPASS = true; 

function App() {
  const [appRole, setAppRole] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem('app_role');
    return saved ? (saved as UserRole) : null;
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [view, setView] = useState<ViewState>('DISCOVERY'); 
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [systemStatus, setSystemStatus] = useState<{connected: boolean, error?: string} | null>(null);
  const [pendingAction, setPendingAction] = useState<{view: ViewState, listing: Listing | null} | null>(null);
  const [showGuestNudge, setShowGuestNudge] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const oneTapInitialized = useRef(false);

  const handleSetRole = (role: UserRole) => {
    setAppRole(role);
    localStorage.setItem('app_role', role);
  };

  useEffect(() => {
    if (AUTH_BYPASS) {
      const mockWithRole = { ...MOCK_USER, role: appRole || UserRole.Seeker };
      setCurrentUser(mockWithRole);
      setIsInitializing(false);
      return;
    }

    if (!auth) {
      setIsInitializing(false);
      return;
    }

    let unsubscribeProfile: (() => void) | null = null;
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        const provisionalUser: any = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
          isLister: appRole === UserRole.Lister,
          role: appRole,
          verified: false,
          gender: Gender.Male,
          professionalType: ProfessionalType.Professional,
          workMode: WorkMode.Hybrid,
          workTiming: WorkTiming.Fixed,
          relationshipStatus: RelationshipStatus.Single,
          moveInTimeline: MoveInTimeline.FifteenDays,
          intendedStay: StayDuration.LongTerm,
          preferences: {
            diet: Diet.Veg,
            smoking: SmokingHabit.StrictNo,
            drinking: DrinkingHabit.Teetotaler,
            pets: false,
            earlyBird: true,
            genderPreference: Gender.Any,
            budgetMax: 25000,
            hasBike: false,
            hasCar: false,
            parkingRequired: false,
            cleanliness: 'Organized',
            socialVibe: 'Social/Friendly',
            guestPolicy: 'Day Guests Only',
            oppositeGenderGuests: true,
            acUsage: 'Night Only',
            maidPreference: 'Daily Maid',
            cookPreference: 'Self Cooking',
            lateNightGate: false,
            utensilSharing: 'Common'
          }
        };
        setCurrentUser(provisionalUser as User);

        unsubscribeProfile = subscribeToUserProfile(firebaseUser.uid, (userData) => {
          if (userData) {
            setCurrentUser(userData);
            if (userData.role && !appRole) {
              setAppRole(userData.role);
              localStorage.setItem('app_role', userData.role);
            }
            if (pendingAction) {
              setView(pendingAction.view);
              setSelectedListing(pendingAction.listing);
              setPendingAction(null);
            }
          } else {
            if (view !== 'ONBOARDING') setView('ONBOARDING');
          }
          setIsInitializing(false);
        });
      } else {
        setCurrentUser(null);
        setIsInitializing(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [pendingAction, view, appRole]);

  useEffect(() => {
    const verifySystem = async () => {
        const status = await checkFirebaseStatus();
        setSystemStatus(status);
    };
    verifySystem();
    const unsubscribe = subscribeToListings((data) => {
      setListings(data);
      setIsLoadingListings(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCredentialResponse = useCallback(async (response: any) => {
    if (AUTH_BYPASS) return;
    try {
      const result = await signInWithGoogleCredential(response.credential);
      if (result?.user) setAuthError(null);
    } catch (error: any) {
      setAuthError(`One Tap Error: ${error.message}`);
    }
  }, []);

  useEffect(() => {
    if (AUTH_BYPASS || currentUser || !auth || oneTapInitialized.current) return;
    const initializeOneTap = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            use_fedcm_for_prompt: true,
            auto_select: false,
            ux_mode: 'popup',
            context: 'signin'
          });
          window.google.accounts.id.prompt();
          oneTapInitialized.current = true;
        } catch (e) {
          console.error("GSI Init Failed", e);
        }
      }
    };
    const scriptCheck = setInterval(() => {
      if (window.google?.accounts?.id) {
        initializeOneTap();
        clearInterval(scriptCheck);
      }
    }, 1500);
    return () => clearInterval(scriptCheck);
  }, [currentUser, handleCredentialResponse]);

  const handleLoginPopup = async () => {
    if (AUTH_BYPASS) return;
    setAuthError(null);
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      return await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setAuthError(`Login failed: ${error.message}`);
      }
      throw error;
    }
  };

  const handleNavigation = (targetView: ViewState) => {
    if (['COMMUNITY', 'PROFILE', 'CREATE_LISTING'].includes(targetView) && !currentUser) {
      if (AUTH_BYPASS) {
        setCurrentUser(MOCK_USER);
        setView(targetView);
      } else {
        setPendingAction({ view: targetView, listing: null });
        handleLoginPopup().catch(() => {});
      }
    } else {
      setView(targetView);
    }
  };

  const handleListingSelect = (listing: Listing) => {
    setSelectedListing(listing);
    setView('LISTING_DETAIL');
  };

  const handleBack = () => {
    if (view === 'LISTING_DETAIL') {
      setSelectedListing(null);
      setView('DISCOVERY');
    } else {
      setView('DISCOVERY');
    }
  };

  const handleHome = () => {
    setSelectedListing(null);
    setView('DISCOVERY');
  };

  function triggerAuthToCurrentListing() {
    if (AUTH_BYPASS) {
      setCurrentUser(MOCK_USER);
      return;
    }
    setPendingAction({ view, listing: selectedListing });
    handleLoginPopup().catch(() => {});
  }

  // Role Gate UI
  if (!appRole) {
    return (
      <div className="fixed inset-0 bg-white z-[999] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[120%] h-[50%] bg-brand-50 rounded-[100%] blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[100%] h-[40%] bg-blue-50 rounded-[100%] blur-3xl opacity-60"></div>
        
        <div className="z-10 mb-12">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 mx-auto border border-brand-50">
                <Sparkles size={40} className="text-brand-600" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2 leading-tight">Welcome to <span className="text-brand-600">FlatSharing</span></h1>
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Select your current intent</p>
        </div>

        <div className="w-full max-w-sm space-y-4 z-10">
          <button 
            onClick={() => handleSetRole(UserRole.Seeker)}
            className="w-full bg-slate-900 group hover:bg-brand-600 text-white p-8 rounded-[2.5rem] shadow-2xl transition-all flex flex-col items-center gap-3 active:scale-95"
          >
            <div className="p-4 bg-white/10 rounded-2xl"><Search size={32} /></div>
            <div className="text-center">
              <span className="block font-black text-lg">I am looking for a Flat</span>
              <span className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Find compatible roommates</span>
            </div>
          </button>

          <button 
            onClick={() => handleSetRole(UserRole.Lister)}
            className="w-full bg-white group hover:bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem] shadow-xl transition-all flex flex-col items-center gap-3 active:scale-95"
          >
            <div className="p-4 bg-brand-50 text-brand-600 rounded-2xl"><Building2 size={32} /></div>
            <div className="text-center">
              <span className="block font-black text-lg text-gray-900">I have a Room to offer</span>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">List your property today</span>
            </div>
          </button>
        </div>
        
        <p className="mt-12 text-[10px] text-gray-400 font-bold uppercase tracking-tighter z-10">
            You can switch this anytime in your profile
        </p>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="max-w-md mx-auto h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="animate-spin text-brand-600 mb-4" size={40} />
        <h1 className="text-xl font-black text-gray-900 mb-2 tracking-tighter italic text-brand-600">FlatSharingIndia</h1>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Syncing Tribe Cloud...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white h-screen relative shadow-2xl overflow-hidden flex flex-col">
      {authError && (
        <div className="fixed top-4 left-4 right-4 z-[100] bg-slate-900 text-white p-5 rounded-[2.5rem] shadow-2xl flex flex-col gap-3 animate-in slide-in-from-top-8 duration-300 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-rose-500 flex-shrink-0" size={24} />
              <h4 className="font-black text-[10px] uppercase tracking-widest text-rose-400">Auth Error</h4>
            </div>
            <button onClick={() => setAuthError(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-500">
              <X size={18} />
            </button>
          </div>
          <p className="text-[11px] font-bold leading-relaxed text-slate-300">{authError}</p>
          <button onClick={handleLoginPopup} className="w-full bg-brand-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">Retry Login</button>
        </div>
      )}

      {AUTH_BYPASS && (
        <div className="bg-brand-600 text-white text-[8px] font-black uppercase tracking-[0.2em] py-2 px-4 text-center shrink-0 z-[60] flex items-center justify-center gap-2">
          <Sparkles size={10} className="animate-pulse" />
          Hard Auth Bypass • Mode: {appRole}
          <Sparkles size={10} className="animate-pulse" />
        </div>
      )}

      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        {view === 'ONBOARDING' && <Onboarding onComplete={(u) => { setCurrentUser(u); setView('DISCOVERY'); }} onBack={handleBack} onHome={handleHome} />}
        {view === 'DISCOVERY' && <Discovery listings={listings} currentUser={currentUser} appRole={appRole} onSelectListing={handleListingSelect} refreshListings={() => {}} isLoading={isLoadingListings} />}
        {view === 'LISTING_DETAIL' && selectedListing && <ListingDetail listing={selectedListing} currentUser={currentUser} onBack={handleBack} onHome={handleHome} onConnect={() => currentUser ? handleNavigation('COMMUNITY') : triggerAuthToCurrentListing()} />}
        {view === 'CREATE_LISTING' && <CreateListing currentUser={currentUser} onSuccess={() => setView('DISCOVERY')} onBack={handleBack} onHome={handleHome} />}
        {view === 'COMMUNITY' && <Community currentUser={currentUser} onBack={handleBack} onHome={handleHome} />}
        {view === 'PROFILE' && currentUser && <Profile currentUser={currentUser} appRole={appRole} onSetRole={handleSetRole} onBack={handleBack} onHome={handleHome} onUpdate={(u) => setCurrentUser(u)} systemStatus={systemStatus} />}
      </main>

      {!currentUser && view === 'DISCOVERY' && showGuestNudge && (
        <div className="absolute bottom-20 left-4 right-4 bg-slate-900 text-white p-3 rounded-2xl shadow-2xl z-50 flex items-center justify-between border border-slate-700 animate-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center gap-2">
              <div className="bg-brand-500 p-1.5 rounded-lg"><Sparkles size={14} className="text-white" /></div>
              <p className="text-[10px] font-bold tracking-tight">Login for AI Match Scores</p>
           </div>
           <div className="flex items-center gap-2">
              <button onClick={handleLoginPopup} className="bg-white text-slate-900 text-[9px] font-black uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-transform"><Chrome size={10} /> Sign In</button>
              <button onClick={() => setShowGuestNudge(false)} className="p-1 text-slate-500 hover:text-white transition-colors"><X size={12}/></button>
           </div>
        </div>
      )}

      {view !== 'CREATE_LISTING' && (
        <Navigation currentView={view} setView={handleNavigation} unreadCount={currentUser ? 3 : 0} />
      )}
    </div>
  );
}

export default App;
