
import React, { useState, useEffect } from 'react';
import { 
  User, Diet, Listing, SmokingHabit, DrinkingHabit, 
  Cleanliness, SocialVibe, GuestPolicy, 
  AcUsage, MaidPreference, CookPreference, Gender,
  ProfessionalType, WorkMode, WorkTiming, RelationshipStatus,
  MoveInTimeline, StayDuration, UserRole
} from '../types';
import { auth, saveUserToFirestore, fetchUserListingsFromFirestore, deleteListingFromFirestore, signOut } from '../services/firebase';
import { 
  ArrowLeft, Home, ShieldCheck, Zap, 
  RefreshCcw, LogOut, Edit3, Save,
  User as UserIcon, Wallet, Utensils, Trash2, MapPin,
  Loader2, Plus, Briefcase, Calendar, Languages, Milestone, MessageCircle,
  Moon, Sun, Wind, Coffee, Droplets, Sparkles, Building2, Linkedin, Instagram,
  Heart as HeartIcon, Clock, Compass, Landmark, Bike, Car, Check, Users, ShieldQuestion
} from 'lucide-react';

interface ProfileProps {
  currentUser: User;
  appRole: UserRole | null;
  onSetRole: (role: UserRole) => void;
  onBack: () => void;
  onHome: () => void;
  onUpdate: (updatedUser: User) => void;
  systemStatus: { connected: boolean; error?: string } | null;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser, appRole, onSetRole, onBack, onHome, onUpdate, systemStatus }) => {
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'LISTINGS'>('IDENTITY');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  
  // Ensure we have a deep-enough copy for editing to avoid reference issues
  const [editUser, setEditUser] = useState<User>(() => ({
    ...currentUser,
    preferences: currentUser.preferences ? { ...currentUser.preferences } : {
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
  }));

  useEffect(() => {
    if (activeTab === 'LISTINGS' && currentUser?.id) {
        loadMyListings();
    }
  }, [activeTab, currentUser?.id]);

  const loadMyListings = async () => {
    setLoadingListings(true);
    try {
        const data = await fetchUserListingsFromFirestore(currentUser.id);
        setMyListings(data || []);
    } catch (e) {
        console.error("Failed to load listings", e);
        setMyListings([]);
    } finally {
        setLoadingListings(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Remove this listing permanently?")) return;
    try {
        await deleteListingFromFirestore(id);
        setMyListings(prev => prev.filter(l => l.id !== id));
    } catch (e) {
        alert("Delete failed.");
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const updated = { 
        ...editUser, 
        role: appRole || UserRole.Seeker, 
        isLister: appRole === UserRole.Lister 
      };
      await saveUserToFirestore(updated);
      onUpdate(updated);
      setIsEditing(false);
    } catch (e) {
      console.error("Failed to save profile", e);
      alert("Save failed. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
        if (auth) await signOut(auth);
        window.location.reload();
    } catch (e) {
        console.error("Logout error", e);
    }
  };

  const InfoCard = ({ title, icon: Icon, children }: { title: string, icon: any, children?: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm mb-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 text-gray-900">
        <Icon size={16} className="text-brand-500" />
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-y-6 gap-x-4">
        {children}
      </div>
    </div>
  );

  const DataItem = ({ label, value, icon: Icon, color = "blue" }: { label: string, value: string | boolean | number | undefined, icon?: any, color?: string }) => {
    const displayValue = value === true ? 'Yes' : value === false ? 'No' : (value || 'N/A');
    const colorClasses: Record<string, string> = {
      blue: "bg-blue-50 text-blue-600",
      rose: "bg-rose-50 text-rose-600",
      emerald: "bg-emerald-50 text-emerald-600",
      amber: "bg-amber-50 text-amber-600",
      slate: "bg-slate-50 text-slate-600",
      indigo: "bg-indigo-50 text-indigo-600",
      purple: "bg-purple-50 text-purple-600"
    };

    return (
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className={`p-2 rounded-xl flex-shrink-0 ${colorClasses[color] || colorClasses.blue}`}>
            <Icon size={16} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider truncate">{label}</p>
          <p className="text-xs font-bold text-gray-900 break-words">{displayValue}</p>
        </div>
      </div>
    );
  };

  const EditSection = ({ title, icon: Icon, children }: { title: string, icon: any, children?: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 mb-6">
      <div className="flex items-center gap-2 text-gray-900 font-black text-[10px] uppercase tracking-[0.2em]">
        <Icon size={16} className="text-brand-500" /> {title}
      </div>
      {children}
    </div>
  );

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 animate-in fade-in duration-500">
      <div className="p-4 border-b border-gray-100 flex flex-col gap-4 bg-white sticky top-0 z-20 shadow-sm">
        <div className="flex justify-between items-center">
            <div className="flex items-center">
                <button onClick={onBack} className="p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20}/></button>
                <h1 className="text-xl font-black text-gray-900">My Profile</h1>
            </div>
            <button onClick={onHome} className="p-2 text-brand-600 hover:bg-gray-100 rounded-full transition-colors"><Home size={20}/></button>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button 
                onClick={() => onSetRole(UserRole.Seeker)}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${appRole === UserRole.Seeker ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400'}`}
            >
                {appRole === UserRole.Seeker && <Check size={12} />} Looking for Flat
            </button>
            <button 
                onClick={() => onSetRole(UserRole.Lister)}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${appRole === UserRole.Lister ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-400'}`}
            >
                {appRole === UserRole.Lister && <Check size={12} />} Offering Room
            </button>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
            
            <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center space-x-5">
                    <div className="relative">
                        <img 
                            src={currentUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} 
                            className="w-24 h-24 rounded-3xl shadow-2xl border-4 border-white object-cover" 
                            alt="Profile" 
                        />
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-white shadow-lg">
                            <ShieldCheck size={14} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 leading-tight">
                            {currentUser.name}
                            {currentUser.age && <span className="text-gray-400 font-bold ml-2">, {currentUser.age}</span>}
                        </h2>
                        <p className="text-sm font-bold text-gray-500 flex items-center gap-1 mt-0.5">
                            <Briefcase size={14} className="text-brand-500" /> {currentUser.profession || 'Tribe Member'}
                        </p>
                        <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mt-2 bg-brand-50 px-3 py-1 rounded-full inline-flex items-center border border-brand-100">
                           <Sparkles size={10} className="mr-1.5" /> High Trust Score
                        </p>
                    </div>
                </div>
                {!isEditing && (
                    <button 
                        onClick={() => { setIsEditing(true); setEditUser({...currentUser}); }}
                        className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl active:scale-90 transition-transform"
                    >
                        <Edit3 size={18} />
                    </button>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 relative z-10">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Personal Bio</h4>
                <p className="text-sm text-gray-600 font-medium leading-relaxed italic">
                    "{currentUser.bio || "Tell the tribe about yourself."}"
                </p>
            </div>
        </div>

        <div className="flex bg-gray-200/50 p-1.5 rounded-2xl mb-8">
            <button 
                onClick={() => { setActiveTab('IDENTITY'); setIsEditing(false); }} 
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'IDENTITY' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}
            >
                Full Identity
            </button>
            <button 
                onClick={() => { setActiveTab('LISTINGS'); setIsEditing(false); }} 
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'LISTINGS' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}
            >
                {appRole === UserRole.Seeker ? 'My Wishlist' : 'My Listings'}
            </button>
        </div>

        {isEditing ? (
            <div className="animate-in slide-in-from-bottom-4 duration-500 pb-20 max-h-[75vh] overflow-y-auto no-scrollbar">
                <EditSection title="Core Identity" icon={UserIcon}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-2">Display Name</label>
                            <input type="text" value={editUser.name} onChange={e => setEditUser({...editUser, name: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-brand-500 font-bold text-sm" />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase mb-2">Age</label>
                            <input type="number" value={editUser.age || ''} onChange={e => setEditUser({...editUser, age: Number(e.target.value)})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-brand-500 font-bold text-sm" />
                        </div>
                    </div>
                </EditSection>

                <EditSection title="Vehicles & Parking" icon={Car}>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setEditUser({...editUser, preferences: {...editUser.preferences, hasBike: !editUser.preferences.hasBike}})} className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${editUser.preferences.hasBike ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                            <Bike size={20} />
                            <span className="text-[10px] font-black uppercase">Bike</span>
                        </button>
                        <button onClick={() => setEditUser({...editUser, preferences: {...editUser.preferences, hasCar: !editUser.preferences.hasCar}})} className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${editUser.preferences.hasCar ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                            <Car size={20} />
                            <span className="text-[10px] font-black uppercase">Car</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 mt-2">
                        <input type="checkbox" id="parkingReq" checked={editUser.preferences.parkingRequired} onChange={e => setEditUser({...editUser, preferences: {...editUser.preferences, parkingRequired: e.target.checked}})} className="w-5 h-5 accent-brand-600 rounded" />
                        <label htmlFor="parkingReq" className="text-xs font-bold text-gray-700">Parking is mandatory</label>
                    </div>
                </EditSection>

                <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-[60] flex gap-3">
                    <button onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-white border border-gray-200 text-gray-500 font-black text-[11px] uppercase tracking-widest rounded-[2rem] shadow-xl">Cancel</button>
                    <button onClick={handleSave} className="flex-[2] py-4 bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest rounded-[2rem] shadow-2xl flex items-center justify-center gap-2">
                        {isSaving ? <RefreshCcw size={18} className="animate-spin" /> : <><Save size={18} /> Sync Tribe Profile</>}
                    </button>
                </div>
            </div>
        ) : activeTab === 'IDENTITY' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
                <InfoCard title="Habit Snapshot" icon={Zap}>
                    <DataItem label="Diet" value={currentUser.preferences?.diet} icon={Utensils} color="rose" />
                    <DataItem label="Smoking" value={currentUser.preferences?.smoking} icon={Wind} color="slate" />
                    <DataItem label="Drinking" value={currentUser.preferences?.drinking} icon={Droplets} color="blue" />
                    <DataItem label="Social Vibe" value={currentUser.preferences?.socialVibe} icon={Users} color="indigo" />
                    <DataItem label="Cleanliness" value={currentUser.preferences?.cleanliness} icon={Sparkles} color="emerald" />
                    <DataItem label="AC Usage" value={currentUser.preferences?.acUsage} icon={Wind} color="blue" />
                </InfoCard>

                <InfoCard title="Logistics & Heritage" icon={MapPin}>
                    <DataItem label="Move-in" value={currentUser.moveInTimeline} icon={Milestone} color="amber" />
                    <DataItem label="Stay" value={currentUser.intendedStay} icon={Calendar} color="blue" />
                    <DataItem label="Hometown" value={currentUser.hometown} icon={Landmark} color="emerald" />
                    <DataItem label="Native State" value={currentUser.nativeState} icon={MapPin} color="rose" />
                    <DataItem label="Relation" value={currentUser.relationshipStatus} icon={HeartIcon} color="rose" />
                    <DataItem label="Budget" value={currentUser.preferences?.budgetMax ? `₹${currentUser.preferences.budgetMax.toLocaleString()}` : 'N/A'} icon={Wallet} color="emerald" />
                </InfoCard>

                <InfoCard title="Professional Footprint" icon={Briefcase}>
                    <DataItem label="Employment" value={currentUser.professionalType} icon={Briefcase} color="indigo" />
                    <DataItem label="Company" value={currentUser.company} icon={Building2} color="slate" />
                    <DataItem label="Mode" value={currentUser.workMode} icon={Compass} color="amber" />
                    <DataItem label="Shift" value={currentUser.workTiming} icon={Clock} color="blue" />
                </InfoCard>

                <InfoCard title="Vehicles & Parking" icon={Car}>
                    <DataItem label="Has Bike" value={currentUser.preferences?.hasBike} icon={Bike} color="indigo" />
                    <DataItem label="Has Car" value={currentUser.preferences?.hasCar} icon={Car} color="blue" />
                    <DataItem label="Parking Req." value={currentUser.preferences?.parkingRequired} icon={ShieldQuestion} color="slate" />
                    <DataItem label="Gate Policy" value={currentUser.preferences?.lateNightGate ? "Restricted" : "Flexible"} icon={Clock} color="rose" />
                </InfoCard>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm mb-6">
                    <div className="flex items-center gap-2 mb-6 text-gray-900">
                        <ShieldCheck size={16} className="text-brand-500" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Social Verification</h3>
                    </div>
                    <div className="flex gap-4">
                        {currentUser.linkedinUrl && (
                            <a href={currentUser.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center p-4 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors">
                                <Linkedin size={24} />
                            </a>
                        )}
                        {currentUser.instagramHandle && (
                            <a href={`https://instagram.com/${currentUser.instagramHandle.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 hover:bg-rose-100 transition-colors">
                                <Instagram size={24} />
                            </a>
                        )}
                        {!currentUser.linkedinUrl && !currentUser.instagramHandle && (
                            <div className="w-full text-center py-4 text-gray-400 text-[10px] font-black uppercase tracking-widest italic">No social proof linked</div>
                        )}
                    </div>
                </div>

                <div className="pt-4 pb-12">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-5 bg-white text-rose-500 font-black text-[11px] uppercase tracking-widest rounded-[2rem] border border-gray-100 shadow-sm active:scale-95 transition-transform"
                    >
                        <LogOut size={16} /> Terminate Tribe Session
                    </button>
                    <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-4">
                        System Identity: {systemStatus?.connected ? 'Synced' : 'Offline'}
                    </p>
                </div>
            </div>
        ) : (
            <div className="space-y-4 animate-in fade-in duration-300 min-h-[40vh]">
                {loadingListings ? (
                    <div className="flex flex-col items-center py-12">
                        <Loader2 className="animate-spin text-brand-600 mb-2" size={32} />
                        <p className="text-[10px] text-gray-400 font-black uppercase">Syncing Cloud Feed...</p>
                    </div>
                ) : myListings.length > 0 ? (
                    myListings.map(listing => (
                        <div key={listing.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <img src={listing.images[0] || 'https://picsum.photos/seed/thumb/200'} className="w-16 h-16 rounded-2xl object-cover" alt="Thumb" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 truncate text-sm">{listing.title}</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center mt-1">
                                    <MapPin size={10} className="mr-1" /> {listing.location.area}
                                </p>
                            </div>
                            <button 
                                onClick={() => handleDeleteListing(listing.id)}
                                className="p-3 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 active:scale-90 transition-transform"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                        {appRole === UserRole.Seeker ? (
                            <>
                                <HeartIcon size={32} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Wishlist is empty</p>
                                <p className="text-xs text-gray-400 font-medium mt-1">Save flats to see them here</p>
                            </>
                        ) : (
                            <>
                                <Plus size={32} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">No listings yet</p>
                                <p className="text-xs text-gray-400 font-medium mt-1">Start by listing your room</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
