
import React, { useState, useMemo } from 'react';
import { MOCK_FORUM_QUESTIONS, MOCK_FORUM_ANSWERS, MOCK_USER } from '../services/mockData';
import { ForumQuestion, ForumCategory, ForumAnswer, User, UserRole } from '../types';
import { moderateForumPost, getThreadSummary } from '../services/geminiService';
import { 
  ArrowLeft, Home, MessageSquare, Send, Users, TrendingUp, 
  ShieldAlert, Sparkles, Plus, Lock, LogIn, ThumbsUp, 
  MapPin, Clock, Search, Filter, Loader2, AlertCircle,
  HelpCircle, BookOpen, Scale, Box, ShieldCheck
} from 'lucide-react';

interface CommunityProps {
  currentUser: User | null;
  onBack?: () => void;
  onHome?: () => void;
}

export const Community: React.FC<CommunityProps> = ({ currentUser, onBack, onHome }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<ForumQuestion | null>(null);
  const [activeCategory, setActiveCategory] = useState<ForumCategory | 'ALL'>('ALL');
  const [showAskModal, setShowAskModal] = useState(false);
  const [isModerating, setIsModerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Question State
  const [newPost, setNewPost] = useState({ title: '', body: '', category: 'GENERAL' as ForumCategory, city: 'Bangalore' });
  const [moderationError, setModerationError] = useState<string | null>(null);

  // Component state for answers (simulated)
  const [allAnswers, setAllAnswers] = useState<Record<string, ForumAnswer[]>>(MOCK_FORUM_ANSWERS);
  const [newAnswerText, setNewAnswerText] = useState('');

  const categories: { id: ForumCategory | 'ALL'; label: string; icon: any; color: string }[] = [
    { id: 'ALL', label: 'All Discussions', icon: Box, color: 'text-gray-500 bg-gray-50' },
    { id: 'RENT', label: 'Rent Trends', icon: TrendingUp, color: 'text-rose-500 bg-rose-50' },
    { id: 'LOCALITY', label: 'Locality Reviews', icon: MapPin, color: 'text-emerald-500 bg-emerald-50' },
    { id: 'LEGAL', label: 'Legal & Contracts', icon: Scale, color: 'text-purple-500 bg-purple-50' },
    { id: 'LOGISTICS', label: 'Maid/Move-in', icon: BookOpen, color: 'text-amber-500 bg-amber-50' },
    { id: 'LIFESTYLE', label: 'Tribe Habits', icon: Users, color: 'text-indigo-500 bg-indigo-50' },
  ];

  const filteredQuestions = useMemo(() => {
    let list = [...MOCK_FORUM_QUESTIONS];
    
    // Default context logic: Prioritize user's role and city if available
    if (currentUser) {
       list.sort((a, b) => {
          // If city matches user hometown, boost it
          if (a.city === currentUser.hometown && b.city !== currentUser.hometown) return -1;
          if (b.city === currentUser.hometown && a.city !== currentUser.hometown) return 1;
          // If category matches role-specific needs (simplified logic)
          const roleNeed = currentUser.role === UserRole.Seeker ? 'RENT' : 'LEGAL';
          if (a.category === roleNeed && b.category !== roleNeed) return -1;
          return 0;
       });
    }

    if (activeCategory !== 'ALL') {
      list = list.filter(q => q.category === activeCategory);
    }
    if (searchQuery) {
      list = list.filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.body.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list;
  }, [activeCategory, searchQuery, currentUser]);

  const handlePostQuestion = async () => {
    if (!newPost.title.trim() || !newPost.body.trim()) return;
    setIsModerating(true);
    setModerationError(null);
    
    const moderation = await moderateForumPost(newPost.title, newPost.body);
    
    if (moderation.approved) {
      // In real app, save to Firestore. Here we just close and notify.
      alert("Post published! The Tribe will answer soon.");
      setShowAskModal(false);
      setNewPost({ title: '', body: '', category: 'GENERAL' as ForumCategory, city: 'Bangalore' });
    } else {
      setModerationError(moderation.reason || "Post rejected. Please keep it related to housing/real estate.");
    }
    setIsModerating(false);
  };

  const handlePostAnswer = () => {
    if (!newAnswerText.trim() || !currentUser || !selectedQuestion) return;
    const newAnswer: ForumAnswer = {
      id: Math.random().toString(36).substr(2, 9),
      questionId: selectedQuestion.id,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role || UserRole.Seeker,
      body: newAnswerText,
      upvotes: 0,
      createdAt: new Date().toISOString()
    };
    setAllAnswers(prev => ({
      ...prev,
      [selectedQuestion.id]: [...(prev[selectedQuestion.id] || []), newAnswer]
    }));
    setNewAnswerText('');
  };

  if (selectedQuestion) {
    const answers = allAnswers[selectedQuestion.id] || [];
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 animate-in slide-in-from-right-4 duration-300">
        <div className="p-4 border-b border-gray-100 flex items-center bg-white sticky top-0 z-20 shadow-sm">
          <button onClick={() => setSelectedQuestion(null)} className="p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20}/></button>
          <div className="flex-1 min-w-0">
             <h2 className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">Question Discussion</h2>
          </div>
        </div>

        <div className="p-6 pb-32">
          {/* Question Body */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 mb-6">
             <div className="flex items-center gap-3 mb-4">
                <img src={selectedQuestion.authorAvatar} className="w-8 h-8 rounded-xl shadow-sm border border-gray-100" />
                <div>
                   <p className="text-xs font-black text-gray-900">{selectedQuestion.authorName} <span className="text-gray-400 font-bold ml-1">• {selectedQuestion.authorRole}</span></p>
                   <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{selectedQuestion.city} • {new Date(selectedQuestion.createdAt).toLocaleDateString()}</p>
                </div>
             </div>
             <h1 className="text-xl font-black text-gray-900 leading-tight mb-3">{selectedQuestion.title}</h1>
             <p className="text-sm text-gray-600 font-medium leading-relaxed">{selectedQuestion.body}</p>
             <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-4">
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-2 rounded-xl border border-brand-100">
                   <ThumbsUp size={14} /> {selectedQuestion.upvotes} Upvotes
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{selectedQuestion.category}</span>
             </div>
          </div>

          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Tribe Answers ({answers.length})</h3>

          {/* Answers List */}
          <div className="space-y-4">
            {answers.map(ans => (
              <div key={ans.id} className={`p-5 rounded-[2rem] border shadow-sm transition-all ${ans.isGeminiSummary ? 'bg-slate-900 text-white border-slate-800' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <img src={ans.authorAvatar} className="w-6 h-6 rounded-lg" />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${ans.isGeminiSummary ? 'text-brand-400' : 'text-gray-900'}`}>{ans.authorName}</span>
                    </div>
                    {ans.isGeminiSummary && <Sparkles size={14} className="text-brand-400 animate-pulse" />}
                </div>
                <p className={`text-sm leading-relaxed ${ans.isGeminiSummary ? 'font-bold italic' : 'text-gray-700 font-medium'}`}>{ans.body}</p>
                <div className="mt-4 flex items-center justify-between">
                    <button className={`flex items-center gap-1 text-[9px] font-black uppercase ${ans.isGeminiSummary ? 'text-brand-400' : 'text-gray-400'}`}>
                        <ThumbsUp size={12} /> {ans.upvotes} Helpful
                    </button>
                    <span className="text-[9px] text-gray-400 font-bold">{new Date(ans.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Answer Input */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/95 backdrop-blur-xl border-t border-gray-100 z-50">
           {currentUser ? (
              <div className="flex items-center gap-2">
                 <input 
                    type="text" 
                    value={newAnswerText}
                    onChange={e => setNewAnswerText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handlePostAnswer()}
                    placeholder="Write your advice..." 
                    className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100 outline-none focus:border-brand-500 font-bold text-sm"
                 />
                 <button onClick={handlePostAnswer} className="p-4 bg-brand-600 text-white rounded-2xl shadow-xl active:scale-90 transition-transform"><Send size={20} /></button>
              </div>
           ) : (
              <button onClick={() => window.location.reload()} className="w-full bg-slate-900 text-white font-black p-4 rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                 <Lock size={14} /> Login to Share Advice
              </button>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-32 animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-6 bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter italic">Tribe Forum</h1>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Verified Indian Housing Q&A</p>
          </div>
          <button onClick={onHome} className="p-2 text-brand-600 bg-brand-50 rounded-full hover:bg-brand-100 transition-colors"><Home size={22}/></button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
              type="text" 
              placeholder="Search legal tips, locality reviews..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-brand-500 outline-none font-bold text-sm transition-all"
           />
        </div>

        {/* Category Picker */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {categories.map(cat => (
                <button 
                   key={cat.id} 
                   onClick={() => setActiveCategory(cat.id)}
                   className={`px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 ${activeCategory === cat.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                >
                    <cat.icon size={14} className={activeCategory === cat.id ? 'text-brand-400' : ''} />
                    {cat.label}
                </button>
            ))}
        </div>
      </div>

      {/* Questions Feed */}
      <div className="p-6 space-y-4">
          {filteredQuestions.length > 0 ? filteredQuestions.map(q => (
              <div key={q.id} onClick={() => setSelectedQuestion(q)} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group active:scale-[0.98]">
                  <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${categories.find(c => c.id === q.category)?.color}`}>
                              #{q.category}
                          </span>
                          {q.isVerifiedLocal && (
                              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full border border-emerald-100">
                                  {/* Fix: ShieldCheck is now imported correctly */}
                                  <ShieldCheck size={10} />
                                  <span className="text-[8px] font-black uppercase">Local Expert</span>
                              </div>
                          )}
                      </div>
                      <span className="text-[9px] text-gray-300 font-bold flex items-center gap-1">
                          <Clock size={10} /> 2h ago
                      </span>
                  </div>
                  <h2 className="text-lg font-black text-gray-900 leading-tight mb-2 group-hover:text-brand-600 transition-colors">{q.title}</h2>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 font-medium leading-relaxed">{q.body}</p>
                  
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <img src={q.authorAvatar} className="w-5 h-5 rounded-full border border-gray-100" />
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{q.city}</span>
                      </div>
                      <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                             <ThumbsUp size={12} /> {q.upvotes}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-black text-brand-600 bg-brand-50 px-3 py-1 rounded-lg">
                             <MessageSquare size={12} /> {q.answerCount} Answers
                          </div>
                      </div>
                  </div>
              </div>
          )) : (
              <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                  <HelpCircle size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">No matching questions</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">Try a different category or start a new thread</p>
              </div>
          )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => currentUser ? setShowAskModal(true) : window.location.reload()}
        className="fixed bottom-24 right-6 bg-slate-900 text-white p-5 rounded-3xl shadow-2xl active:scale-90 transition-transform z-30 flex items-center gap-2"
      >
        <Plus size={24} />
        <span className="text-[10px] font-black uppercase tracking-widest pr-2">Ask Tribe</span>
      </button>

      {/* Ask Modal */}
      {showAskModal && (
          <>
            <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={() => setShowAskModal(false)}></div>
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[3rem] z-[60] p-8 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 italic">Consult the Tribe</h2>
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">AI Moderated Discussion</p>
                    </div>
                    <button onClick={() => setShowAskModal(false)} className="p-2 bg-gray-50 rounded-full"><Plus className="rotate-45" size={20}/></button>
                </div>

                <div className="space-y-6 pb-20">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Select Topic</label>
                        <div className="grid grid-cols-3 gap-2">
                            {categories.filter(c => c.id !== 'ALL').map(cat => (
                                <button key={cat.id} onClick={() => setNewPost({...newPost, category: cat.id as ForumCategory})} className={`py-3 rounded-xl border text-[8px] font-black uppercase tracking-tighter transition-all ${newPost.category === cat.id ? 'bg-brand-50 border-brand-500 text-brand-600' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                                    {cat.label.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Question Title</label>
                        <input 
                           type="text" 
                           placeholder="e.g., How to spot fake listings in Pune?" 
                           value={newPost.title}
                           onChange={e => setNewPost({...newPost, title: e.target.value})}
                           className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-brand-500 outline-none font-bold text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Detailed Context</label>
                        <textarea 
                           rows={4} 
                           placeholder="Share more details so the tribe can give better advice..."
                           value={newPost.body}
                           onChange={e => setNewPost({...newPost, body: e.target.value})}
                           className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-brand-500 outline-none font-bold text-sm"
                        ></textarea>
                    </div>

                    {moderationError && (
                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="text-rose-500 flex-shrink-0" size={18} />
                            <p className="text-xs font-bold text-rose-700">{moderationError}</p>
                        </div>
                    )}

                    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white z-[70] border-t border-gray-50">
                        <button 
                            onClick={handlePostQuestion}
                            disabled={isModerating}
                            className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-2xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform"
                        >
                            {isModerating ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> Publish to Tribe</>}
                        </button>
                    </div>
                </div>
            </div>
          </>
      )}
    </div>
  );
};
