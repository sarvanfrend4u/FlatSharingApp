
import React, { useEffect, useState } from 'react';
import { Listing, User } from '../types';
import { ArrowLeft, CheckCircle, MapPin, Share2, Shield, MessageCircle, LogIn, Bus, Train, Stethoscope, Cigarette, Wine, Dog, Users, UtensilsCrossed, Calendar, Sofa, Home, ExternalLink, Map as MapIcon, Loader2, Sparkles, Droplets, ShieldCheck, Heart, Lock, Bike, Car } from 'lucide-react';
import { getMatchAnalysis, calculateNearbyAmenities, AmenityGrounding } from '../services/geminiService';

interface ListingDetailProps {
  listing: Listing;
  currentUser: User | null;
  onBack: () => void;
  onHome: () => void;
  onConnect: () => void;
}

export const ListingDetail: React.FC<ListingDetailProps> = ({ listing, currentUser, onBack, onHome, onConnect }) => {
  const [aiAnalysis, setAiAnalysis] = useState<{ score: number; reason: string } | null>(null);
  const [amenities, setAmenities] = useState<AmenityGrounding | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingMap(true);
      if (currentUser) setLoadingAi(true);
      try {
        const analysisPromise = currentUser ? getMatchAnalysis(currentUser, listing) : Promise.resolve(null);
        const amenitiesPromise = calculateNearbyAmenities(listing.location.city, listing.location.area, listing.landmark || listing.location.area);
        const [analysisResult, amenitiesResult] = await Promise.all([analysisPromise, amenitiesPromise]);
        setAiAnalysis(analysisResult);
        setAmenities(amenitiesResult);
      } finally {
        setLoadingAi(false);
        setLoadingMap(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [listing.id, currentUser]);

  const RuleItem = ({ icon: Icon, label, allowed }: { icon: any, label: string, allowed: boolean }) => (
    <div className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-colors ${allowed ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
        <Icon size={20} className={`mb-1 ${allowed ? 'text-green-600' : 'text-red-400'}`} />
        <span className={`text-[10px] font-bold ${allowed ? 'text-green-700' : 'text-red-700'}`}>{allowed ? 'Allowed' : 'No ' + label}</span>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-44 relative animate-in fade-in duration-700">
      <div className="h-80 relative">
        <img src={listing.images[0]} alt="Property" className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 flex gap-2">
            <button onClick={onBack} className="p-3 bg-white/95 rounded-full shadow-xl"><ArrowLeft size={20} /></button>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={() => setIsFavorite(!isFavorite)} className={`p-3 bg-white/95 rounded-full shadow-xl ${isFavorite ? 'text-brand-500' : 'text-gray-400'}`}>
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button onClick={onHome} className="p-3 bg-white/95 rounded-full shadow-xl text-brand-600"><Home size={20} /></button>
        </div>
      </div>

      <div className="px-6 py-8 -mt-10 bg-white rounded-t-[3rem] relative z-10 shadow-xl">
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1 pr-4">
            <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2">{listing.title}</h1>
            <p className="text-gray-500 text-sm flex items-center font-bold"><MapPin size={16} className="mr-1.5 text-brand-500" /> {listing.location.area}, {listing.location.city}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-brand-600">₹{listing.price.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 mb-8 text-white relative overflow-hidden shadow-2xl">
            <h3 className="text-[10px] font-black text-brand-400 uppercase tracking-widest flex items-center mb-4">
                <Sparkles size={12} className="mr-2" /> Gemini Match Intelligence
            </h3>
            {!currentUser ? (
              <div className="text-center py-4">
                <p className="text-xs font-bold mb-4">Login to unlock Match Analysis</p>
                <button onClick={onConnect} className="w-full bg-brand-600 p-3 rounded-xl text-[10px] font-black uppercase">Reveal Score</button>
              </div>
            ) : loadingAi ? (
                <Loader2 className="animate-spin text-brand-500 mx-auto" />
            ) : (
                <div className="flex items-center gap-6">
                    <span className="text-4xl font-black">{aiAnalysis?.score}%</span>
                    <p className="text-sm italic text-slate-300">"{aiAnalysis?.reason}"</p>
                </div>
            )}
        </div>

        {/* Feature Grid with Parking */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl text-brand-500"><Bike size={18} /></div>
                <div>
                    <span className="text-[9px] font-black uppercase text-gray-400">Bike Parking</span>
                    <span className="block font-bold text-sm">{listing.bikeParking ? 'Available' : 'No'}</span>
                </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl text-brand-500"><Car size={18} /></div>
                <div>
                    <span className="text-[9px] font-black uppercase text-gray-400">Car Parking</span>
                    <span className="block font-bold text-sm">{listing.carParking ? 'Available' : 'No'}</span>
                </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl text-brand-500"><Sofa size={18} /></div>
                <div>
                    <span className="text-[9px] font-black uppercase text-gray-400">Furnishing</span>
                    <span className="block font-bold text-sm">{listing.furnishing}</span>
                </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl text-brand-500"><Users size={18} /></div>
                <div>
                    <span className="text-[9px] font-black uppercase text-gray-400">Occupancy</span>
                    <span className="block font-bold text-sm">{listing.type}</span>
                </div>
            </div>
        </div>

        <div className="mb-8">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-4">House Rules</h3>
            <div className="grid grid-cols-4 gap-3">
                <RuleItem icon={Cigarette} label="Smoking" allowed={listing.rules.smoking} />
                <RuleItem icon={Wine} label="Drinking" allowed={listing.rules.drinking} />
                <RuleItem icon={Dog} label="Pets" allowed={listing.rules.pets} />
                <RuleItem icon={UtensilsCrossed} label="Non-Veg" allowed={listing.rules.nonVeg} />
            </div>
        </div>

        <div className="mb-12 bg-brand-50/50 p-5 rounded-3xl border border-brand-100 flex items-center">
            <img src={`https://picsum.photos/seed/${listing.ownerId}/100/100`} className="w-14 h-14 rounded-2xl object-cover" alt="Lister" />
            <div className="ml-4">
                <p className="text-[9px] font-black text-brand-600 uppercase tracking-widest">Verified Owner</p>
                <h4 className="font-black text-gray-900">Direct Connect Available</h4>
            </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-50">
            <div className="max-w-md mx-auto flex gap-4 items-center">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Rent/Mo</span>
                    <span className="text-xl font-black">₹{listing.price.toLocaleString()}</span>
                </div>
                <button onClick={onConnect} className="flex-1 bg-brand-600 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-transform">
                    {currentUser ? 'Express Interest' : 'Login to Connect'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
