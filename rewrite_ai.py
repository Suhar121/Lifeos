import os

code = """import React, { useState } from 'react';
import api from '../services/api';
import { Sparkles, Brain, ArrowRight, Activity, ArrowUp, Send } from 'lucide-react';

const AIInsights = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'I noticed your morning protocol adherence dropped by 15% this week, while your reported stress levels increased. Are we experiencing a disruption in sleep quality or routine changes?'
    }
  ]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await api.post('/ai/insights', { prompt });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.content || 'Analysis complete. Please review your biometric trends.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection to clinical model failed. Retry required.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-80px)] md:h-screen flex flex-col md:flex-row gap-6">
      
      {/* Left Context Panel */}
      <div className="w-full md:w-80 bg-theme-bg flex flex-col gap-4 overflow-y-auto pr-2 pb-6 flex-shrink-0 border-r border-[#E8EDF5] pr-6">
         <div>
            <h2 className="font-heading text-lg font-bold flex items-center gap-2 text-[#0D1B3E]"><Brain size={18} className="text-brand-blue" /> Clinical Context</h2>
            <p className="text-xs text-theme-muted mt-1">Live diagnostic monitoring</p>
         </div>

         <div className="bg-white border border-[#E8EDF5] rounded-xl p-5 mt-4 shadow-sm">
            <h3 className="text-xs uppercase font-bold text-theme-muted tracking-wide mb-3 flex items-center gap-2"><Activity size={12}/> Recent Anomalies</h3>
            <div className="space-y-3">
               <div className="flex justify-between items-center text-sm border-b border-[#F7F9FC] pb-2 text-[#0D1B3E]">
                  <span>Heart Rate</span>
                  <span className="font-mono text-red-600 flex items-center gap-1">+5 bpm <ArrowUp size={12}/></span>
               </div>
               <div className="flex justify-between items-center text-sm pt-1 text-[#0D1B3E]">
                  <span>Hydration</span>
                  <span className="font-mono text-amber-500 font-bold">Deficient</span>
               </div>
            </div>
         </div>

         <div className="bg-[#141C2E] text-white border border-[#243052] rounded-xl p-5 shadow-sm mt-2">
            <h3 className="text-xs uppercase font-bold text-brand-teal tracking-wide mb-3">System Focus</h3>
            <p className="text-sm">Evaluating correlation between caffeine intake & elevated resting heart rate over a 7-day period.</p>
         </div>
      </div>

      {/* Right Insights Chat */}
      <div className="flex-1 flex flex-col bg-white border border-[#E8EDF5] rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(26,111,232,0.06)] h-full">
         <div className="p-5 border-b border-[#E8EDF5] bg-[#F7F9FC] flex justify-between items-center">
            <h2 className="font-heading font-bold text-[#0D1B3E] flex items-center gap-2"><Sparkles className="text-brand-teal" size={18} /> Deep Intelligence</h2>
            <span className="text-xs font-mono font-medium bg-brand-blue text-white px-2 py-0.5 rounded">v2.1 Clinical</span>
         </div>

         <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((m, idx) => (
               <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && <div className="w-8 h-8 rounded bg-[#EEF3FB] flex items-center justify-center text-brand-blue mr-3 flex-shrink-0"><Brain size={16}/></div>}
                  <div className={`max-w-[85%] rounded-lg p-5 leading-relaxed ${m.role === 'user' ? 'bg-[#0D1B3E] text-white' : 'border border-[#E8EDF5] bg-[#F7F9FC] text-[#0D1B3E] font-body'}`}>
                     {m.content}
                  </div>
               </div>
            ))}
            {loading && (
               <div className="flex justify-start items-center gap-3">
                 <div className="w-8 h-8 rounded bg-[#EEF3FB] flex items-center justify-center text-brand-blue flex-shrink-0"><Brain size={16}/></div>
                 <span className="text-theme-muted text-sm font-mono animate-pulse">Running analysis...</span>
               </div>
            )}
         </div>

         <div className="p-4 bg-white border-t border-[#E8EDF5]">
            <form onSubmit={handleSubmit} className="flex relative">
               <input 
                  type="text" 
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Ask a medical parameter follow-up..."
                  className="w-full flex-1 border border-[#E8EDF5] rounded-lg py-4 pl-4 pr-16 outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue dark:bg-[#1A2540] transition text-sm"
               />
               <button type="submit" disabled={!prompt.trim() || loading} className="absolute right-2 top-2 bottom-2 bg-brand-blue text-white w-10 flex items-center justify-center rounded-lg hover:bg-[#0D4FB5] transition disabled:opacity-50">
                  <Send size={16} />
               </button>
            </form>
         </div>
      </div>
    </div>
  );
};

export default AIInsights;
"""

with open('frontend/src/pages/AIInsights.jsx', 'w') as f:
    f.write(code)

print("AI Insights rewritten!")
