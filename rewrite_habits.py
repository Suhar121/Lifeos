import os

code = """import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, X, Flame, Trash2, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Protocols' },
  { id: 'health', label: 'Health' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'learning', label: 'Learning' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'general', label: 'General' },
];

const SUGGESTED = [
  { name: 'Hydration Strategy', emoji: '💧', category: 'health' },
  { name: 'Deep Work Block', emoji: '🧠', category: 'learning' },
  { name: 'Cardiovascular Training', emoji: '🏃', category: 'fitness' }
];

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showDrawer, setShowDrawer] = useState(false);
  
  // drawer form
  const [form, setForm] = useState({ name: '', emoji: '✅', category: 'general', target: 7 });

  useEffect(() => { fetchHabits(); }, []);

  const fetchHabits = async () => {
    try {
      const { data } = await api.get('/habits/');
      setHabits(data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const toggleHabit = async (habit) => {
    const today = new Date().toISOString().split('T')[0];
    const completed = !habit.completed_today;
    
    // optimistic
    setHabits(habits.map(h => {
      if (h.id === habit.id) {
        const w = [...h.week_completions];
        w[w.length - 1] = completed;
        return { ...h, completed_today: completed, streak: completed ? h.streak + 1 : Math.max(0, h.streak - 1), week_completions: w };
      }
      return h;
    }));
    
    try {
      await api.post('/habits/complete', { habit_id: habit.id, date: today, completed });
    } catch (err) { fetchHabits(); } // revert
  };

  const addHabit = async () => {
    if (!form.name.trim()) return;
    try {
      const { data } = await api.post('/habits/', { name: form.name, emoji: form.emoji, category: form.category, target_days: form.target });
      setHabits([...habits, data]);
      setShowDrawer(false);
      setForm({ name: '', emoji: '✅', category: 'general', target: 7 });
    } catch (err) { console.error(err); }
  };
  
  const deleteHabit = async (id) => {
    if (!confirm('Remove protocol?')) return;
    try {
      await api.delete(`/habits/${id}`);
      setHabits(habits.filter(h => h.id !== id));
    } catch (err) { console.error(err); }
  };

  const filtered = activeTab === 'all' ? habits : habits.filter(h => h.category === activeTab);
  const doneToday = habits.filter(h => h.completed_today).length;
  const progress = habits.length ? (doneToday / habits.length) * 100 : 0;
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 relative w-full h-full overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4 border-b border-[#E8EDF5] dark:border-[#243052] pb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-theme-text mb-1">My Protocols</h1>
          <p className="text-theme-muted text-sm">Today: {todayStr}</p>
        </div>
        <button onClick={() => setShowDrawer(true)} className="bg-brand-blue text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-[#0D4FB5] transition">
          <Plus size={16} /> New Protocol
        </button>
      </div>

      {/* Progress */}
      {habits.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-theme-text">{doneToday} of {habits.length} completed</span>
            <span className="text-xs font-mono text-brand-blue font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-[#E8EDF5] dark:bg-[#243052] w-full rounded-full overflow-hidden">
            <div className="h-full bg-brand-blue transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-[#E8EDF5] dark:border-[#243052] overflow-x-auto no-scrollbar">
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id} onClick={() => setActiveTab(cat.id)}
            className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${activeTab === cat.id ? 'border-brand-blue text-brand-blue' : 'border-transparent text-theme-muted hover:text-theme-text'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-[#141C2E] border border-[#E8EDF5] dark:border-[#243052] rounded-xl shadow-sm overflow-hidden">
         {filtered.length === 0 ? (
           <div className="p-8 text-center text-theme-muted text-sm">No protocols found.</div>
         ) : (
           <div className="divide-y divide-[#E8EDF5] dark:divide-[#243052]">
             {filtered.map(habit => (
               <div key={habit.id} className={`flex items-center p-4 transition-colors hover:bg-[#F7F9FC] dark:hover:bg-[#1A2540] ${habit.completed_today ? 'bg-[#F7F9FC] dark:bg-[#1A2540]' : ''}`}>
                 
                 {/* Checkbox & Name */}
                 <div className="flex items-center gap-4 flex-1">
                   <button onClick={() => toggleHabit(habit)} className={`w-6 h-6 rounded flex items-center justify-center border transition-colors shrink-0 ${habit.completed_today ? 'bg-brand-blue border-brand-blue text-white' : 'border-[#9CA3AF] text-transparent hover:border-brand-blue'}`}>
                     <CheckCircle2 size={16} />
                   </button>
                   <span className="text-xl shrink-0 opacity-80">{habit.emoji}</span>
                   <span className={`text-sm font-semibold truncate ${habit.completed_today ? 'text-theme-muted line-through' : 'text-theme-text'}`}>
                     {habit.name}
                   </span>
                   <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-[#E5E9F2] text-[#4B5563] ml-2">
                     {habit.category}
                   </span>
                 </div>

                 {/* Streak & Dots */}
                 <div className="flex items-center gap-6 shrink-0">
                   <div className="hidden sm:flex items-center gap-1.5 text-sm font-mono font-medium">
                     <Flame size={14} className="text-[#D97706]" /> {habit.streak}d
                   </div>
                   
                   <div className="flex items-center gap-1">
                     {habit.week_completions.map((done, i) => {
                       const isToday = i === 6;
                       return (
                         <div key={i} title={DAY_LABELS[i]} className={`w-[6px] h-[6px] rounded-full transition-all ${
                           done ? 'bg-[#1A6FE8]' 
                            : isToday ? 'border border-[#1A6FE8] bg-transparent' 
                            : 'bg-[#FCA5A5]'
                         }`} />
                       )
                     })}
                   </div>
                   
                   <button onClick={() => deleteHabit(habit.id)} className="text-theme-muted hover:text-red-500 p-1">
                     <Trash2 size={16} />
                   </button>
                 </div>

               </div>
             ))}
           </div>
         )}
      </div>

      {/* Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowDrawer(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#141C2E] h-full shadow-2xl flex flex-col animate-slide-left">
            <div className="p-6 border-b border-[#E8EDF5] dark:border-[#243052] flex justify-between items-center bg-[#F7F9FC]">
              <h2 className="font-heading font-bold text-lg">New Protocol</h2>
              <button onClick={() => setShowDrawer(false)}><X size={20} className="text-theme-muted" /></button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">Protocol Name</label>
                <div className="flex gap-2">
                  <input type="text" value={form.emoji} onChange={e => setForm({...form, emoji: e.target.value})} className="w-16 bg-[#F7F9FC] border border-[#E8EDF5] rounded-lg text-center text-xl" />
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. 5km Run" className="flex-1 bg-white border border-[#E8EDF5] rounded-lg px-4 text-sm" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-white border border-[#E8EDF5] p-3 rounded-lg text-sm">
                  {CATEGORIES.slice(1).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Target Frequency (Days/Week)</label>
                <input type="range" min="1" max="7" value={form.target} onChange={e => setForm({...form, target: e.target.value})} className="w-full accent-brand-blue" />
                <div className="text-right text-xs font-mono font-bold text-brand-blue mt-1">{form.target} Days</div>
              </div>
              
              <div className="pt-6 border-t border-[#E8EDF5]">
                <label className="block text-sm font-bold mb-3 text-theme-muted">Clinical Suggestions</label>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                   {SUGGESTED.map(s => (
                     <button key={s.name} type="button" onClick={() => setForm({...form, name: s.name, emoji: s.emoji, category: s.category})}
                       className="shrink-0 bg-[#F7F9FC] border border-[#E8EDF5] p-3 rounded-lg text-left hover:border-brand-blue transition">
                       <span className="text-xl block mb-2">{s.emoji}</span>
                       <span className="text-xs font-bold">{s.name}</span>
                     </button>
                   ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E8EDF5] dark:border-[#243052] bg-white">
              <button onClick={addHabit} className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold">Add Protocol</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Habits;
"""

with open('frontend/src/pages/Habits.jsx', 'w') as f:
    f.write(code)

print("Habits rewritten!")
