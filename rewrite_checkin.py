import os

code = """import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Check, Activity } from 'lucide-react';

const MOODS = [
  { value: 'great', emoji: '😄', label: 'Great' },
  { value: 'good', emoji: '😌', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'bad', emoji: '😰', label: 'Rough' },
  { value: 'terrible', emoji: '😔', label: 'Low' },
];

const DailyCheckIn = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [lifeScore, setLifeScore] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    mood: 'okay',
    energy: 5,
    focus: 5,
    productivity: 5,
    sleep_hours: 7,
    workout: false,
    junk_food: false,
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/daily-logs/', form);
      setLifeScore(res.data.life_score);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting log:', error);
    } finally {
      setSaving(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="bg-white dark:bg-[#141C2E] border border-[#E8EDF5] dark:border-[#243052] rounded-xl p-10 shadow-card max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} />
          </div>
          <h1 className="font-heading text-2xl font-bold text-theme-text mb-2">Check-In Complete</h1>
          <p className="text-theme-muted mb-8">Your data has been securely logged.</p>
          
          <div className="relative w-32 h-32 mx-auto mb-6">
             <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#E8EDF5] dark:text-[#243052]" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1A6FE8" strokeWidth="2" strokeDasharray={`${lifeScore}, 100`} />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-3xl font-bold text-brand-blue">{lifeScore}</span>
             </div>
          </div>
          <p className="text-sm text-theme-muted font-medium mb-8">
            Your score is {lifeScore} based on sleep quality, energy, mood, and habits.
          </p>

          <button onClick={() => navigate('/')} className="w-full py-3 bg-brand-blue text-white rounded-lg font-medium hover:bg-[#0D4FB5] transition">
            View Full Dashboard →
          </button>
        </div>
      </div>
    );
  }

  // Helper for custom slider
  const renderSlider = (label, key, min, max, step, displayFormat) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-bold text-theme-text">{label}</label>
        <div className="bg-[#EEF3FB] dark:bg-[#1A2540] text-brand-blue font-mono text-sm px-3 py-1 rounded-md border border-[#E8EDF5] dark:border-[#243052]">
          {displayFormat(form[key])}
        </div>
      </div>
      <input 
        type="range" min={min} max={max} step={step}
        value={form[key]} 
        onChange={(e) => setForm({...form, [key]: Number(e.target.value)})}
        className="w-full h-2 bg-[#E5E9F2] dark:bg-[#243052] rounded-lg appearance-none cursor-pointer accent-brand-blue"
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      <div className="mb-8 border-b border-[#E8EDF5] dark:border-[#243052] pb-6">
        <h1 className="font-heading text-2xl font-bold text-theme-text">How are you feeling today?</h1>
        <p className="text-theme-muted text-sm mt-1">{todayStr} • Takes ~2 minutes. Your data stays private.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Wellbeing */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#141C2E] border border-[#E8EDF5] dark:border-[#243052] p-6 rounded-xl shadow-card">
            <h2 className="text-sm font-bold text-theme-text mb-4 uppercase tracking-wider text-gray-500">Mood & Vitals</h2>
            
            <div className="mb-8">
              <label className="text-sm font-bold text-theme-text mb-3 block">Overall Mood</label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map(m => (
                  <button
                    key={m.value} type="button"
                    onClick={() => setForm({...form, mood: m.value})}
                    className={`flex-1 min-w-[70px] py-3 px-2 rounded-lg text-sm transition font-medium border
                      ${form.mood === m.value 
                        ? 'bg-brand-blue text-white border-brand-blue shadow-md' 
                        : 'bg-white dark:bg-[#1A2540] text-theme-text border-[#E8EDF5] dark:border-[#243052] hover:bg-gray-50'}`}
                  >
                    <span className="text-lg block mb-1">{m.emoji}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {renderSlider('Energy Level', 'energy', 1, 10, 1, val => `${val} / 10`)}
            {renderSlider('Focus Capability', 'focus', 1, 10, 1, val => `${val} / 10`)}
            {renderSlider('Sleep Duration', 'sleep_hours', 0, 14, 0.5, val => `${val} hrs`)}
          </div>
        </div>

        {/* Right Column: Lifestyle */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#141C2E] border border-[#E8EDF5] dark:border-[#243052] p-6 rounded-xl shadow-card">
            <h2 className="text-sm font-bold text-theme-text mb-4 uppercase tracking-wider text-gray-500">Lifestyle Variables</h2>

            <div className="mb-6">
               <label className="text-sm font-bold text-theme-text mb-3 block">Physical Activity</label>
               <div className="grid grid-cols-2 gap-3">
                 <button type="button" onClick={() => setForm({...form, workout: true})}
                   className={`p-4 rounded-lg border font-medium text-sm transition ${form.workout ? 'border-brand-blue bg-[#EEF3FB] dark:bg-blue-900/20 text-brand-blue' : 'border-[#E8EDF5] dark:border-[#243052] text-theme-muted'}`}>
                   Active (+30m)
                 </button>
                 <button type="button" onClick={() => setForm({...form, workout: false})}
                   className={`p-4 rounded-lg border font-medium text-sm transition ${!form.workout ? 'border-gray-500 bg-gray-50 dark:bg-gray-800 text-theme-text' : 'border-[#E8EDF5] dark:border-[#243052] text-theme-muted'}`}>
                   Rest Day
                 </button>
               </div>
            </div>

            <div className="mb-8">
               <label className="text-sm font-bold text-theme-text mb-3 block">Nutrition Quality</label>
               <div className="grid grid-cols-2 gap-3">
                 <button type="button" onClick={() => setForm({...form, junk_food: false})}
                   className={`p-4 rounded-lg border font-medium text-sm transition ${!form.junk_food ? 'border-[#16A34A] bg-green-50 dark:bg-green-900/20 text-[#16A34A]' : 'border-[#E8EDF5] dark:border-[#243052] text-theme-muted'}`}>
                   Clean Eating
                 </button>
                 <button type="button" onClick={() => setForm({...form, junk_food: true})}
                   className={`p-4 rounded-lg border font-medium text-sm transition ${form.junk_food ? 'border-[#D97706] bg-amber-50 dark:bg-amber-900/20 text-[#D97706]' : 'border-[#E8EDF5] dark:border-[#243052] text-theme-muted'}`}>
                   Indulged
                 </button>
               </div>
            </div>

            <div>
              <label className="text-sm font-bold text-theme-text mb-3 block">Clinical Notes</label>
              <textarea 
                value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                placeholder="Anything notable today?"
                className="w-full bg-white dark:bg-[#1A2540] border border-[#E8EDF5] dark:border-[#243052] rounded-lg p-3 text-sm min-h-[120px] focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full py-4 bg-brand-blue text-white rounded-lg font-bold hover:bg-[#0D4FB5] transition shadow-sm flex items-center justify-center gap-2">
            <Activity size={18} />
            {saving ? 'Recording Data...' : 'Log My Day'}
          </button>
          <p className="text-xs text-center text-theme-muted">🔒 Only visible to you</p>
        </div>
      </form>
    </div>
  );
};

export default DailyCheckIn;
"""

with open('frontend/src/pages/DailyCheckIn.jsx', 'w') as f:
    f.write(code)

print("Check-In rewritten!")
