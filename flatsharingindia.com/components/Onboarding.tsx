
import React, { useState } from 'react';
import { 
  User, Diet, Gender, SmokingHabit, DrinkingHabit, 
  Cleanliness, SocialVibe, GuestPolicy, AcUsage, 
  MaidPreference, CookPreference, ProfessionalType, 
  WorkMode, WorkTiming, RelationshipStatus, 
  MoveInTimeline, StayDuration, UserRole 
} from '../types';
import { auth, googleProvider, saveUserToFirestore, getUserFromFirestore } from '../services/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@firebase/auth';
import { ArrowLeft, Home, Sparkles, Loader2, Eye, EyeOff, Mail, Lock, ShieldCheck, Chrome, Briefcase, User as UserIcon, Calendar, Bike, Car } from 'lucide-react';

interface OnboardingProps {
  onComplete: (user: User) => void;
  onBack?: () => void;
  onHome?: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onBack, onHome }) => {
  const [mode, setMode] = useState<'GATE' | 'EMAIL_SIGNUP' | 'EMAIL_LOGIN' | 'PREFERENCES'>('GATE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.Male);
  const [tempUserId, setTempUserId] = useState('');
  const [tempAvatar, setTempAvatar] = useState('');
  
  // Preference & Vehicle States
  const [budget, setBudget] = useState(25000);
  const [diet, setDiet] = useState<Diet>(Diet.Veg);
  const [genderPref, setGenderPref] = useState<Gender>(Gender.Any);
  const [profType, setProfType] = useState<ProfessionalType>(ProfessionalType.Professional);
  const [timeline, setTimeline] = useState<MoveInTimeline>(MoveInTimeline.FifteenDays);
  const [hasBike, setHasBike] = useState(false);
  const [hasCar, setHasCar] = useState(false);
  const [parkingReq, setParkingReq] = useState(false);

  const handleGoogleSSO = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await getUserFromFirestore(result.user.uid);
      
      if (profile) {
        onComplete(profile);
      } else {
        setName(result.user.displayName || '');
        setTempUserId(result.user.uid);
        setTempAvatar(result.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user.uid}`);
        setMode('PREFERENCES');
      }
    } catch (err: any) {
      setError("Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    setLoading(true);
    setError('');
    try {
      if (mode === 'EMAIL_LOGIN') {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const profile = await getUserFromFirestore(cred.user.uid);
        if (profile) onComplete(profile);
        else { setTempUserId(cred.user.uid); setMode('PREFERENCES'); }
      } else {
        setMode('PREFERENCES');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishSignup = async () => {
    setLoading(true);
    setError('');
    try {
      let userId = tempUserId;
      if (!userId) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        userId = cred.user.uid;
      }

      const role = localStorage.getItem('app_role') as UserRole || UserRole.Seeker;

      const newUser: User = {
        id: userId,
        name: name || email.split('@')[0],
        avatar: tempAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        isLister: role === UserRole.Lister,
        role: role,
        verified: true,
        gender: gender,
        professionalType: profType,
        workMode: WorkMode.Hybrid,
        workTiming: WorkTiming.Fixed,
        relationshipStatus: RelationshipStatus.Single,
        moveInTimeline: timeline,
        intendedStay: StayDuration.LongTerm,
        preferences: {
            diet,
            dietStrictness: 'Flexible',
            smoking: SmokingHabit.StrictNo,
            drinking: DrinkingHabit.Social,
            pets: false,
            earlyBird: true,
            genderPreference: genderPref,
            budgetMax: budget,
            hasBike,
            hasCar,
            parkingRequired: parkingReq,
            cleanliness: Cleanliness.Organized,
            socialVibe: SocialVibe.Social,
            guestPolicy: GuestPolicy.DayGuests,
            oppositeGenderGuests: true,
            acUsage: AcUsage.Moderate,
            maidPreference: MaidPreference.DailyMaid,
            cookPreference: CookPreference.SelfCooking,
            lateNightGate: false,
            utensilSharing: 'Common'
        }
      };
      
      await saveUserToFirestore(newUser);
      onComplete(newUser);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'GATE') {
    return (
      <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center px-8 z-10 text-center">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center mb-8 border border-brand-50 animate-bounce-slow">
                <Sparkles size={48} className="text-brand-600" />
            </div>
            
            <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight">Find Your <span className="text-brand-600">Perfect</span> Tribe.</h1>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mb-12">Login to verify your profile</p>

            <div className="w-full space-y-4 max-w-xs">
                <button 
                    onClick={handleGoogleSSO}
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-2xl flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Chrome size={18} />}
                    Continue with Google
                </button>
                <button 
                    onClick={() => setMode('EMAIL_LOGIN')}
                    className="w-full bg-white text-gray-600 border border-gray-200 font-black py-4 rounded-2xl text-xs uppercase tracking-widest"
                >
                    Email Address
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      <div className="p-4 border-b border-gray-50 flex justify-between items-center sticky top-0 bg-white z-20">
        <div className="flex items-center">
            <button onClick={() => setMode('GATE')} className="p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20}/></button>
            <h1 className="text-lg font-black text-gray-900 uppercase tracking-widest text-[11px]">Syncing Lifestyle</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 max-w-md mx-auto w-full py-12">
        {mode === 'PREFERENCES' && (
          <div className="space-y-8 py-4 max-h-[70vh] overflow-y-auto no-scrollbar animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl"><ShieldCheck size={24} /></div>
                <div>
                    <h2 className="text-xl font-black text-gray-900">Final Verification</h2>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Complete your matching profile</p>
                </div>
            </div>
            
            <div className="space-y-10">
              <div>
                  <label className="block text-[10px] font-black text-gray-800 mb-4 uppercase tracking-widest">Target Budget</label>
                  <input type="range" min="5000" max="100000" step="1000" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full accent-brand-600" />
              </div>

              <div>
                   <label className="block text-[10px] font-black text-gray-800 mb-4 uppercase tracking-widest">Vehicles I Own</label>
                   <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setHasBike(!hasBike)}
                            className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${hasBike ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-gray-50 border-transparent text-gray-400'}`}
                        >
                            <Bike size={20} />
                            <span className="text-[10px] font-black uppercase">Bike</span>
                        </button>
                        <button 
                            onClick={() => setHasCar(!hasCar)}
                            className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${hasCar ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-gray-50 border-transparent text-gray-400'}`}
                        >
                            <Car size={20} />
                            <span className="text-[10px] font-black uppercase">Car</span>
                        </button>
                   </div>
                   <div className="mt-4 flex items-center gap-3">
                        <input type="checkbox" id="obParking" checked={parkingReq} onChange={e => setParkingReq(e.target.checked)} className="w-5 h-5 accent-brand-600" />
                        <label htmlFor="obParking" className="text-xs font-bold text-gray-600">Parking is mandatory for me</label>
                   </div>
              </div>

              <div>
                   <label className="block text-[10px] font-black text-gray-800 mb-4 uppercase tracking-widest">My Status</label>
                   <div className="grid grid-cols-2 gap-2">
                      {Object.values(ProfessionalType).map(p => (
                          <button key={p} onClick={() => setProfType(p)} className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border ${profType === p ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-gray-100 text-gray-400'}`}>{p}</button>
                      ))}
                   </div>
              </div>
            </div>

            <button 
              disabled={loading}
              onClick={handleFinishSignup}
              className="w-full bg-brand-600 text-white font-black py-5 rounded-2xl shadow-2xl text-xs uppercase tracking-widest"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Complete Discovery Setup"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
