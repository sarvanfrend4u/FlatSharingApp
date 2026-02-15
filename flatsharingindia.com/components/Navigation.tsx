
import React from 'react';
import { ViewState } from '../types';
import { Home, PlusSquare, Users, User } from 'lucide-react';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  unreadCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, unreadCount }) => {
  const navItemClass = (view: ViewState) => 
    `flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === view ? 'text-brand-600' : 'text-gray-500'}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-16 bg-white border-t border-gray-200 flex justify-around items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <button onClick={() => setView('DISCOVERY')} className={navItemClass('DISCOVERY')}>
        <Home size={24} strokeWidth={currentView === 'DISCOVERY' ? 2.5 : 2} />
        <span className="text-xs font-medium">Search</span>
      </button>
      
      <button onClick={() => setView('CREATE_LISTING')} className={navItemClass('CREATE_LISTING')}>
        <PlusSquare size={24} strokeWidth={currentView === 'CREATE_LISTING' ? 2.5 : 2} />
        <span className="text-xs font-medium">List</span>
      </button>
      
      <button onClick={() => setView('COMMUNITY')} className={navItemClass('COMMUNITY')}>
        <div className="relative">
          <Users size={24} strokeWidth={currentView === 'COMMUNITY' ? 2.5 : 2} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-xs font-medium">Community</span>
      </button>
      
      <button onClick={() => setView('PROFILE')} className={navItemClass('PROFILE')}>
        <User size={24} strokeWidth={currentView === 'PROFILE' ? 2.5 : 2} />
        <span className="text-xs font-medium">Profile</span>
      </button>
    </div>
  );
};
