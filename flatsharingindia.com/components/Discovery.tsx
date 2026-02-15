
import React, { useState, useMemo } from 'react';
import { Listing, User, UserRole } from '../types';
import { MapPin, Filter, ArrowRight, Sparkles, Map as MapIcon, List as ListIcon, X, Loader2, Lock, Radio, Users } from 'lucide-react';
import { CITY_LOCATIONS } from '../services/mockData';

interface DiscoveryProps {
  listings: Listing[];
  currentUser: User | null;
  appRole: UserRole | null;
  onSelectListing: (listing: Listing) => void;
  refreshListings: () => void;
  isLoading: boolean;
}

interface FilterState {
  maxPrice: number;
  gender: string;
  occupancy: string[];
  bhk: string[];
  furnishing: string[];
  amenities: string[];
  availableBefore: string;
  locations: string[];
}

export const Discovery: React.FC<DiscoveryProps> = ({ listings, currentUser, appRole, onSelectListing, isLoading }) => {
  const [filterCity, setFilterCity] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    maxPrice: 100000,
    gender: 'Any',
    occupancy: [],
    bhk: [],
    furnishing: [],
    amenities: [],
    availableBefore: '',
    locations: []
  });
  
  const [tempFilters, setTempFilters] = useState<FilterState>(activeFilters);

  const applyFilters = () => {
    setActiveFilters(tempFilters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    const resetState = {
      maxPrice: 100000,
      gender: 'Any',
      occupancy: [],
      bhk: [],
      furnishing: [],
      amenities: [],
      availableBefore: '',
      locations: []
    };
    setTempFilters(resetState);
    setActiveFilters(resetState);
  };

  const activeFilterCount = (() => {
    let count = 0;
    if (activeFilters.maxPrice < 100000) count++;
    if (activeFilters.gender !== 'Any') count++;
    if (activeFilters.locations.length > 0) count++;
    return count;
  })();

  const getMatchScore = (listing: Listing) => {
    if (!currentUser) return null;
    let score = 65;
    if (listing.price <= currentUser.preferences.budgetMax) score += 20;
    if (listing.gender === currentUser.preferences.genderPreference || listing.gender === "Any") score += 15;
    return Math.min(score, 100);
  };

  const filteredListings = useMemo(() => {
    return listings.filter(l => {
        if (filterCity !== 'All' && l.location.city !== filterCity) return false;
        if (l.price > activeFilters.maxPrice) return false;
        if (activeFilters.locations.length > 0 && !activeFilters.locations.includes(l.location.area)) return false;
        return true;
    });
  }, [listings, filterCity, activeFilters]);

  return (
    <div className="pb-32 bg-gray-50 min-h-screen flex flex-col relative max-w-md mx-auto overflow-x-hidden animate-in fade-in duration-300">
      <div className="bg-white p-4 sticky top-0 z-40 shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-black text-gray-900 tracking-tight">
                {appRole === UserRole.Seeker ? "Find Your Home" : "Discover Potential Tribe"}
            </h1>
            <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                <Radio size={10} className="text-green-500 animate-pulse" />
                <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Active Discovery</span>
            </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <button 
            onClick={() => { setTempFilters(activeFilters); setShowFilters(true); }}
            className={`flex-1 p-2.5 rounded-xl border transition-all flex items-center justify-center space-x-2 ${activeFilterCount > 0 ? 'bg-brand-50 border-brand-200 text-brand-600' : 'bg-gray-100 border-transparent text-gray-600'}`}
          >
            <Filter size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>
          
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button onClick={() => setViewMode('LIST')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-white shadow text-brand-600' : 'text-gray-400'}`}><ListIcon size={18} /></button>
            <button onClick={() => setViewMode('MAP')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'MAP' ? 'bg-white shadow text-brand-600' : 'text-gray-400'}`}><MapIcon size={18} /></button>
          </div>
        </div>

        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
          {['All', 'Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Chennai'].map(city => (
            <button 
              key={city}
              onClick={() => { setFilterCity(city); setActiveFilters(prev => ({...prev, locations: []})); }}
              className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-all border font-black uppercase tracking-widest ${
                filterCity === city ? 'bg-brand-600 text-white border-brand-600 shadow-md' : 'bg-white border-gray-200 text-gray-600'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {showFilters && (
        <>
           <div className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm" onClick={() => setShowFilters(false)}></div>
           <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto w-full bg-white rounded-t-[2.5rem] z-[70] p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Target Filters</h2>
                  <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
              </div>

              {filterCity !== 'All' && CITY_LOCATIONS[filterCity] && (
                  <div className="mb-6">
                      <span className="block font-bold text-gray-800 mb-3 text-xs uppercase tracking-widest">Localities</span>
                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 border border-gray-50 rounded-xl">
                          {CITY_LOCATIONS[filterCity].map(loc => {
                              const isSelected = tempFilters.locations.includes(loc);
                              return (
                                  <button key={loc} onClick={() => setTempFilters({...tempFilters, locations: isSelected ? tempFilters.locations.filter(l => l !== loc) : [...tempFilters.locations, loc]})} className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${isSelected ? 'bg-brand-600 border-brand-600 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600'}`}>{loc}</button>
                              );
                          })}
                      </div>
                  </div>
              )}

              <div className="mb-8">
                  <div className="flex justify-between mb-2">
                      <span className="font-bold text-gray-800 text-xs uppercase tracking-widest">Budget Limit</span>
                      <span className="text-brand-600 font-bold">₹{tempFilters.maxPrice.toLocaleString()}</span>
                  </div>
                  <input type="range" min="5000" max="100000" step="1000" value={tempFilters.maxPrice} onChange={(e) => setTempFilters({...tempFilters, maxPrice: Number(e.target.value)})} className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-600" />
              </div>

              <div className="flex space-x-4">
                  <button onClick={resetFilters} className="flex-1 py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl uppercase tracking-widest text-[11px]">Reset</button>
                  <button onClick={applyFilters} className="flex-[2] py-4 bg-brand-600 text-white font-bold rounded-2xl uppercase tracking-widest text-[11px]">Apply</button>
              </div>
           </div>
        </>
      )}

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <Loader2 className="animate-spin text-brand-600 mb-2" size={32} />
             <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Cloud Sync...</p>
          </div>
        ) : appRole === UserRole.Seeker ? (
           filteredListings.length > 0 ? filteredListings.map(listing => {
           const score = getMatchScore(listing);
           return (
            <div key={listing.id} onClick={() => onSelectListing(listing)} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 active:scale-[0.98] transition-all cursor-pointer hover:shadow-md">
              <div className="relative h-52">
                <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                {currentUser ? (
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center shadow-lg border border-brand-50">
                        <span className="text-[10px] font-black text-brand-600 mr-1">{score}% AI Score</span>
                        <Sparkles size={10} className="text-brand-500" />
                    </div>
                ) : (
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center shadow-lg border border-gray-100">
                        <Lock size={10} className="text-gray-400 mr-1" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Login for Score</span>
                    </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-black text-gray-900 line-clamp-1 flex-1 pr-2">{listing.title}</h3>
                  <span className="font-black text-brand-600">₹{(listing.price/1000).toFixed(1)}k</span>
                </div>
                <p className="text-gray-500 text-xs mb-4 flex items-center font-bold uppercase tracking-tight">
                  <MapPin size={12} className="mr-1 text-brand-500" />
                  {listing.location.area}, {listing.location.city} • {listing.type}
                </p>
                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                   <div className="flex items-center">
                      <img src={`https://picsum.photos/seed/${listing.ownerId}/50/50`} className="w-6 h-6 rounded-full shadow-sm" alt="Owner" />
                      <span className="text-[10px] text-gray-400 ml-2 font-black uppercase tracking-widest">Verified Cloud Host</span>
                   </div>
                   <button className="text-brand-600 text-xs font-black flex items-center bg-brand-50 px-3 py-2 rounded-xl">
                     View <ArrowRight size={12} className="ml-1" />
                   </button>
                </div>
              </div>
            </div>
           );
        }) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
             <Filter className="text-gray-200 mx-auto mb-4" size={48} />
             <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">No Matching Homes</p>
          </div>
        )) : (
            /* Lister Mode View: Potential Roommates (Placeholder for Tribe Discovery) */
            <div className="text-center py-20 bg-brand-50/30 rounded-[3rem] border-2 border-dashed border-brand-100 flex flex-col items-center">
                <Users className="text-brand-200 mb-6" size={64} />
                <h3 className="text-lg font-black text-gray-900 mb-2">Tribe Discovery Coming Soon</h3>
                <p className="text-xs text-gray-500 font-medium max-w-[200px] leading-relaxed">We're indexing compatible seekers in {filterCity}. Soon you'll be able to invite them to your flat!</p>
                <button className="mt-8 bg-brand-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Promote Your Post</button>
            </div>
        )}
      </div>
    </div>
  );
};
