
import React from 'react';
import { MOCK_CHATS } from '../services/mockData';
import { ChatSession } from '../types';
import { ArrowLeft, Home, MessageSquare } from 'lucide-react';

interface ChatProps {
  onBack?: () => void;
  onHome?: () => void;
}

export const Chat: React.FC<ChatProps> = ({ onBack, onHome }) => {
  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10 flex justify-between items-center shadow-sm">
        <div className="flex items-center">
          {onBack && (
            <button onClick={onBack} className="p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20}/></button>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Connect Requests</p>
          </div>
        </div>
        {onHome && (
          <button onClick={onHome} className="p-2 text-brand-600 hover:bg-gray-100 rounded-full transition-colors"><Home size={20}/></button>
        )}
      </div>

      <div className="divide-y divide-gray-50">
        {MOCK_CHATS.map((chat: ChatSession) => (
          <div key={chat.id} className="p-5 hover:bg-gray-50/50 transition-colors flex items-center cursor-pointer group">
            <div className="relative">
              <img src={chat.partnerAvatar} alt={chat.partnerName} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-gray-100 group-hover:ring-brand-200" />
              {chat.unreadCount > 0 && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
              )}
            </div>
            
            <div className="ml-4 flex-1">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-gray-900">{chat.partnerName}</h3>
                <span className="text-[10px] text-gray-400 font-medium">2m ago</span>
              </div>
              <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'}`}>
                {chat.lastMessage || "Express interest to start chat..."}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {MOCK_CHATS.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 px-10 text-center">
          <div className="bg-gray-50 p-6 rounded-full mb-6">
            <MessageSquare size={40} className="text-gray-200" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">No conversations yet</h2>
          <p className="text-sm font-medium">Search for flats and send a connect request to start chatting with potential flatmates.</p>
        </div>
      )}
    </div>
  );
};
