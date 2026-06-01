import os

code = """import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Activity, Plus, FileText, CheckCircle, Droplet, Moon, Brain, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CircularProgress = ({ progress }) => {
  const radius = 30;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle stroke="#E2E8F0" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
        <circle
          stroke="#0D9488"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-[#0F172A]">{progress}</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock user load
    setTimeout(() => {
      setData({
        user: { name: 'Sarah', id: 'PT-8942-X' },
        score: 82,
        vitals: { hr: 68, bp: '118/76', sleep: '7h 12m' },
        tasks: [
          { id: 1, title: 'Morning Hydration (500ml)', done: true },
          { id: 2, title: 'Vitamin D3 (4000 IU)', done: false },
          { id: 3, title: 'Evening Walk (20 min)', done: false }
        ]
      });
      setLoading(false);
    }, 600);
  }, []);

  if (loading) return (
    <div className="p-8 space-y-6 animate-pulse w-full max-w-5xl mx-auto">
      <div className="h-24 bg-[#E2E8F0] rounded-2xl w-full"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="h-48 bg-[#E2E8F0] rounded-2xl"></div>
         <div className="h-48 bg-[#E2E8F0] rounded-2xl"></div>
         <div className="h-48 bg-[#E2E8F0] rounded-2xl"></div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-4 py-8 md:p-8 space-y-8">
      {/* Header Patient Summary */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-card flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] bg-[#F8FAFC] px-2 py-1 rounded">Patient Record</span>
             <span className="text-xs font-mono text-[#94A3B8]">ID: {data.user.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Good morning, {data.user.name}</h1>
          <p className="text-sm text-[#64748B] mt-1">Status: <span className="text-[#16A34A] font-medium">Stable</span>. All tracked vitals are within normal ranges.</p>
        </div>
        <Link to="/check-in" className="flex items-center gap-2 bg-brand-teal text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition transform active:scale-95 shadow-sm">
          <Plus size={18} /> New Entry
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Life Score / Clinical Ring */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-card flex items-center gap-6">
           <CircularProgress progress={data.score} />
           <div>
             <h3 className="text-sm font-semibold text-[#64748B] uppercase tracking-wide">Health Score</h3>
             <p className="text-sm text-[#0F172A] font-medium mt-1">Optimal Range</p>
             <p className="text-xs text-[#64748B] mt-1">Based on 7-day trailing average</p>
           </div>
        </div>

        {/* Vital Quick Stats */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-card grid grid-cols-3 gap-4 divide-x divide-[#E2E8F0]">
           <div className="flex flex-col justify-center px-4">
              <span className="text-xs text-[#64748B] flex items-center gap-1"><Activity size={14} className="text-brand-teal"/> Resting HR</span>
              <span className="text-2xl font-semibold text-[#0F172A] mt-2">{data.vitals.hr} <span className="text-sm text-[#94A3B8] font-normal">bpm</span></span>
           </div>
           <div className="flex flex-col justify-center px-4">
              <span className="text-xs text-[#64748B] flex items-center gap-1"><Droplet size={14} className="text-brand-blue"/> Blood Press.</span>
              <span className="text-2xl font-semibold text-[#0F172A] mt-2">{data.vitals.bp} <span className="text-sm text-[#94A3B8] font-normal">mmHg</span></span>
           </div>
           <div className="flex flex-col justify-center px-4">
              <span className="text-xs text-[#64748B] flex items-center gap-1"><Moon size={14} className="text-[#6366F1]"/> Sleep Av.</span>
              <span className="text-2xl font-semibold text-[#0F172A] mt-2">7<span className="text-sm text-[#94A3B8] font-normal">h</span> 12<span className="text-sm text-[#94A3B8] font-normal">m</span></span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Active Protocols */}
         <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-card">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-semibold text-[#0F172A] flex items-center gap-2"><CheckCircle size={18} className="text-brand-teal"/> Daily Protocols</h3>
               <Link to="/habits" className="text-xs text-brand-teal font-medium hover:underline">Manage</Link>
            </div>
            <div className="space-y-3">
               {data.tasks.map(t => (
                  <div key={t.id} className="flex items-center gap-4 p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                     <div className={`w-5 h-5 rounded flex items-center justify-center border ${t.done ? 'bg-brand-teal border-brand-teal' : 'bg-white border-[#CBD5E1]'}`}>
                        {t.done && <CheckCircle size={12} className="text-white"/>}
                     </div>
                     <span className={`text-sm ${t.done ? 'text-[#94A3B8] line-through' : 'text-[#0F172A] font-medium'}`}>{t.title}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* AI Clinical Insights */}
         <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-card">
            <h3 className="font-semibold text-[#0F172A] flex items-center gap-2 mb-6"><Brain size={18} className="text-brand-blue"/> Intelligence Detail</h3>
            <div className="bg-blue-50 border-l-4 border-brand-blue p-4 rounded-r-lg">
               <p className="text-sm text-[#0F172A] leading-relaxed">
                  Your sleep architecture shows an 18% improvement over the last 3 days. Heart rate variability (HRV) has stabilized. Recommended action: maintain current evening routine.
               </p>
            </div>
            <Link to="/insights" className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A] py-2 border border-[#E2E8F0] rounded-xl transition">
               View Full Report <ChevronRight size={16}/>
            </Link>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
"""

with open('frontend/src/pages/Dashboard.jsx', 'w') as f:
    f.write(code)

print("Dashboard rewritten!")
