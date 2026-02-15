
import React, { useState } from 'react';
import { generateListingDescription } from '../services/geminiService';
import { createListingInFirestore } from '../services/firebase';
import { 
  Listing, OccupancyType, Gender, FlatType, 
  FurnishingStatus, User, CookPreference 
} from '../types';
import { 
  Home, ArrowLeft, Loader2, Bike, Car, 
  IndianRupee, Calendar, MapPin, Building, Users, Sofa, Droplets, 
  Wifi, Wind, ChefHat, ShieldCheck, ChevronRight,
  Cigarette, Wine, Dog, Users2, Lock, UtensilsCrossed, Sparkles,
  Refrigerator, Waves
} from 'lucide-react';
import { CITY_LOCATIONS } from '../services/mockData';

interface CreateListingProps {
  currentUser: User | null;
  onSuccess: () => void;
  onBack?: () => void;
  onHome?: () => void;
}

export const CreateListing: React.FC<CreateListingProps> = ({ currentUser, onSuccess, onBack, onHome }) => {
  const [loadingAI, setLoadingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    deposit: '',
    maintenance: '0',
    noticePeriod: '1 Month',
    city: 'Bangalore',
    area: '',
    landmark: '',
    type: OccupancyType.Single,
    bhk: FlatType.BHK2,
    washroom: 'Attached' as 'Attached' | 'Common',
    totalRoommates: 2,
    furnishing: FurnishingStatus.Semi,
    availableFrom: new Date().toISOString().split('T')[0],
    gender: Gender.Any,
    detailedAmenities: {
        fridge: true,
        washingMachine: true,
        microwave: false,
        induction: true,
        ro: true,
        wifi: true,
        ac: false
    },
    bikeParking: true,
    carParking: false,
    rules: {
        smoking: false,
        drinking: true,
        pets: false,
        visitors: 'Day Only' as 'Day Only' | 'Overnight Allowed' | 'No Guests',
        oppositeGenderGuests: false,
        nonVeg: true,
        vegOnlyHouse: false,
        separateUtensils: false,
        gateRestrictions: false
    },
    maidAvailable: true,
    cookPreference: CookPreference.SelfCooking,
    images: ["https://picsum.photos/seed/indianhouse/800/600"]
  });

  const handleAIWrite = async () => {
    if (!formData.area) return;
    setLoadingAI(true);
    const details = `
      Flat in ${formData.area}, ${formData.city}. 
      Price: ${formData.price}, Type: ${formData.type}. 
      BHK: ${formData.bhk}. Furnishing: ${formData.furnishing}.
      Rules: ${formData.rules.nonVeg ? 'Non-veg allowed' : 'Strictly Veg'}.
      Social: ${formData.rules.visitors}.
    `;
    const desc = await generateListingDescription(details);
    setFormData(prev => ({ ...prev, description: desc }));
    setLoadingAI(false);
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    if (!formData.area || !formData.price) {
        setError("Missing critical fields: Please select area and enter rent.");
        const mainEl = document.querySelector('main');
        if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    setIsSubmitting(true);
    try {
      const newListing: Listing = {
        id: "", 
        ...formData,
        price: Number(formData.price),
        deposit: Number(formData.deposit),
        maintenance: Number(formData.maintenance),
        totalRoommates: Number(formData.totalRoommates),
        location: { city: formData.city, area: formData.area },
        amenities: [], 
        ownerId: currentUser.id, 
        createdAt: new Date().toISOString()
      };
      await createListingInFirestore(newListing);
      onSuccess();
    } catch (err) {
      setError("Cloud Save Failed. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const Toggle = ({ active, onClick, icon: Icon, label }: any) => (
    <button 
      type="button"
      onClick={onClick}
      className={`p-3 rounded-2xl border transition-all flex items-center gap-2 ${active ? 'bg-brand-50 border-brand-500 text-brand-600 shadow-sm ring-1 ring-brand-100' : 'bg-white border-gray-100 text-gray-400'}`}
    >
      <Icon size={14} />
      <span className="text-[9px] font-black uppercase tracking-widest leading-none text-left">{label}</span>
    </button>
  );

  return (
    <div className="bg-gray-50 pb-96 animate-in fade-in duration-500 min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center">
            <button onClick={onBack} className="p-2 mr-3 bg-gray-50 rounded-full active:scale-90 transition-transform"><ArrowLeft size={18} /></button>
            <div>
                <h2 className="text-xs font-black text-gray-900 uppercase tracking-tighter">List Your Property</h2>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Single Scroll Setup</p>
            </div>
        </div>
        <button onClick={onHome} className="p-2 text-brand-600 bg-brand-50 rounded-full"><Home size={18} /></button>
      </div>

      <div className="p-5 max-w-md mx-auto w-full space-y-6">
        {/* Section 1: Location & Financials */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 space-y-5">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2"><MapPin size={14} className="text-brand-500" /> Geography & Money</h3>
            
            <div className="grid grid-cols-2 gap-3">
                <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-3.5 bg-gray-50 rounded-xl border border-gray-100 font-bold text-xs outline-none focus:border-brand-500">
                    {['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Chennai'].map(c => <option key={c}>{c}</option>)}
                </select>
                <select required value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full p-3.5 bg-gray-50 rounded-xl border border-gray-100 font-bold text-xs outline-none focus:border-brand-500">
                    <option value="">Select Locality</option>
                    {CITY_LOCATIONS[formData.city]?.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
            </div>

            <div className="relative">
                <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="Monthly Rent" className="w-full p-3.5 pl-10 bg-gray-50 rounded-xl border border-gray-100 font-bold text-xs outline-none focus:border-brand-500" />
                <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <input type="number" value={formData.deposit} onChange={e => setFormData({...formData, deposit: e.target.value})} placeholder="Security Deposit" className="w-full p-3.5 bg-gray-50 rounded-xl border border-gray-100 font-bold text-xs outline-none" />
                <input type="number" value={formData.maintenance} onChange={e => setFormData({...formData, maintenance: e.target.value})} placeholder="Maint. / Mo" className="w-full p-3.5 bg-gray-50 rounded-xl border border-gray-100 font-bold text-xs outline-none" />
            </div>
            
            <input type="text" value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} placeholder="Nearby Landmark" className="w-full p-3.5 bg-gray-50 rounded-xl border border-gray-100 font-bold text-xs outline-none focus:border-brand-500" />
        </div>

        {/* Section 2: Availability & Timeline */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2"><Calendar size={14} className="text-brand-500" /> Timeline</h3>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-[8px] font-black uppercase text-gray-400 mb-1 ml-2">Available From</label>
                    <input type="date" value={formData.availableFrom} onChange={e => setFormData({...formData, availableFrom: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 font-bold text-[10px]" />
                </div>
                <div>
                    <label className="block text-[8px] font-black uppercase text-gray-400 mb-1 ml-2">Notice Period</label>
                    <select value={formData.noticePeriod} onChange={e => setFormData({...formData, noticePeriod: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 font-bold text-[10px]">
                        {['Immediate', '15 Days', '1 Month', '2 Months'].map(n => <option key={n}>{n}</option>)}
                    </select>
                </div>
            </div>
        </div>

        {/* Section 3: Configuration */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 space-y-5">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Building size={14} className="text-brand-500" /> Property Config</h3>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="block text-[8px] font-black uppercase text-gray-400 ml-2">Flat Type</label>
                    <select value={formData.bhk} onChange={e => setFormData({...formData, bhk: e.target.value as FlatType})} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-xs border border-gray-100">
                        {Object.values(FlatType).map(t => <option key={t}>{t}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="block text-[8px] font-black uppercase text-gray-400 ml-2">Occupancy</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as OccupancyType})} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-xs border border-gray-100">
                        {Object.values(OccupancyType).map(t => <option key={t}>{t}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="block text-[8px] font-black uppercase text-gray-400 ml-2">Who can move in?</label>
                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as Gender})} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-xs border border-gray-100">
                        <option value={Gender.Any}>Any Gender OK</option>
                        <option value={Gender.Male}>Male Flatmate</option>
                        <option value={Gender.Female}>Female Flatmate</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="block text-[8px] font-black uppercase text-gray-400 ml-2">Furnishing</label>
                    <select value={formData.furnishing} onChange={e => setFormData({...formData, furnishing: e.target.value as FurnishingStatus})} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-xs border border-gray-100">
                        {Object.values(FurnishingStatus).map(t => <option key={t}>{t}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Toggle active={formData.washroom === 'Attached'} onClick={() => setFormData({...formData, washroom: 'Attached'})} icon={Droplets} label="Attached Bath" />
                <div className="flex flex-col gap-1">
                    <label className="block text-[8px] font-black uppercase text-gray-400 ml-2">Total Roommates</label>
                    <input type="number" value={formData.totalRoommates} onChange={e => setFormData({...formData, totalRoommates: Number(e.target.value)})} className="p-3 bg-gray-50 rounded-xl border border-gray-100 font-bold text-xs outline-none" />
                </div>
            </div>
        </div>

        {/* Section 4: Facilities */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 space-y-5">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2"><Sofa size={14} className="text-brand-500" /> Facilities</h3>
            <div className="grid grid-cols-2 gap-3">
                 <Toggle active={formData.detailedAmenities.wifi} onClick={() => setFormData({...formData, detailedAmenities: {...formData.detailedAmenities, wifi: !formData.detailedAmenities.wifi}})} icon={Wifi} label="High Speed WiFi" />
                 <Toggle active={formData.detailedAmenities.ac} onClick={() => setFormData({...formData, detailedAmenities: {...formData.detailedAmenities, ac: !formData.detailedAmenities.ac}})} icon={Wind} label="AC Installed" />
                 <Toggle active={formData.detailedAmenities.fridge} onClick={() => setFormData({...formData, detailedAmenities: {...formData.detailedAmenities, fridge: !formData.detailedAmenities.fridge}})} icon={Refrigerator} label="Refrigerator" />
                 <Toggle active={formData.detailedAmenities.washingMachine} onClick={() => setFormData({...formData, detailedAmenities: {...formData.detailedAmenities, washingMachine: !formData.detailedAmenities.washingMachine}})} icon={Waves} label="Washing Machine" />
                 <Toggle active={formData.bikeParking} onClick={() => setFormData({...formData, bikeParking: !formData.bikeParking})} icon={Bike} label="Bike Parking" />
                 <Toggle active={formData.carParking} onClick={() => setFormData({...formData, carParking: !formData.carParking})} icon={Car} label="Car Parking" />
            </div>
        </div>

        {/* Section 5: Tribe Rules */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 space-y-5">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2"><ChefHat size={14} className="text-brand-500" /> Tribe Habits</h3>
            <div className="grid grid-cols-2 gap-3">
                 <Toggle active={formData.rules.vegOnlyHouse} onClick={() => setFormData({...formData, rules: {...formData.rules, vegOnlyHouse: !formData.rules.vegOnlyHouse}})} icon={ChefHat} label="Veg Only House" />
                 <Toggle active={formData.rules.nonVeg} onClick={() => setFormData({...formData, rules: {...formData.rules, nonVeg: !formData.rules.nonVeg}})} icon={UtensilsCrossed} label="Non-Veg OK" />
                 <Toggle active={formData.rules.smoking} onClick={() => setFormData({...formData, rules: {...formData.rules, smoking: !formData.rules.smoking}})} icon={Cigarette} label="Smoking OK" />
                 <Toggle active={formData.rules.pets} onClick={() => setFormData({...formData, rules: {...formData.rules, pets: !formData.rules.pets}})} icon={Dog} label="Pets OK" />
                 <Toggle active={formData.rules.oppositeGenderGuests} onClick={() => setFormData({...formData, rules: {...formData.rules, oppositeGenderGuests: !formData.rules.oppositeGenderGuests}})} icon={Users2} label="Mixed Guests" />
                 <Toggle active={formData.rules.gateRestrictions} onClick={() => setFormData({...formData, rules: {...formData.rules, gateRestrictions: !formData.rules.gateRestrictions}})} icon={Lock} label="Gate Timing" />
            </div>
        </div>

        {/* Section 6: AI Biographer */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2"><Sparkles size={12} className="text-brand-500" /> About Space</h3>
                <button 
                    type="button" 
                    onClick={handleAIWrite}
                    disabled={loadingAI}
                    className="text-[8px] font-black uppercase text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-all"
                >
                    {loadingAI ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Gemini Write
                </button>
            </div>
            <textarea 
                rows={4} 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Talk about the vibe, society, and who makes an ideal flatmate..." 
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:border-brand-500 outline-none font-medium text-xs focus:ring-1 focus:ring-brand-500 transition-all"
            ></textarea>
        </div>

        {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">
                {error}
            </div>
        )}
      </div>

      {/* Persistent Publish Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-white border-t border-gray-100 z-40 flex flex-col gap-3 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
          <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-brand-600 text-white font-black py-4.5 rounded-[2rem] shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
          >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><ShieldCheck size={18} /> Publish My Listing</>}
          </button>
          <p className="text-[8px] text-center text-gray-400 font-bold uppercase tracking-widest">By publishing, you agree to Tribe's Community Safety Rules</p>
      </div>
    </div>
  );
};
