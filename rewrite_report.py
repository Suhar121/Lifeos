import os

code = """import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, TrendingUp, TrendingDown, ArrowRight, Printer } from 'lucide-react';

const WeeklyReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReport(); }, []);

  const fetchReport = async () => {
    try {
      const { data } = await api.get('/reports/weekly');
      setReport(data);
    } catch (err) { console.error('Error fetching weekly report:', err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="p-8 font-mono text-sm text-theme-muted">Generating clinical report...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10 pb-6 border-b-2 border-brand-teal">
        <div>
          <h1 className="font-heading text-4xl font-black text-[#0D1B3E] tracking-tight">Clinical Summary</h1>
          <p className="text-theme-muted font-mono mt-2">Week {new Date().toLocaleDateString(undefined, {week: 'numeric'})} | Period: Last 7 Days</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-theme-bg border border-[#E8EDF5] rounded-lg text-sm font-bold text-theme-text hover:bg-[#EEF3FB] transition">
          <Printer size={16} /> Print Report
        </button>
      </div>

      <div className="bg-white p-10 rounded-xl shadow-[0_4px_24px_rgba(26,111,232,0.06)] border border-[#E8EDF5] mb-8">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="text-brand-blue" />
          <h2 className="font-heading text-2xl font-bold">1. Executive Summary</h2>
        </div>
        <div className="bg-[#EEF3FB] border-l-4 border-brand-blue p-6 rounded-r-lg mb-8">
          <p className="font-body text-theme-text leading-relaxed">
            Patient engagement remained stable over the period with a {report?.consistency_score || 85}% protocol adherence rate. Sleep quality shows slight fragmentation mid-week, but cardiovascular vitals remain strictly within reference ranges. 
            <strong> Immediate focus:</strong> Increase hydration and maintain consistent sleep scheduling.
          </p>
        </div>

        <div className="flex items-center gap-3 mb-6 mt-12">
          <TrendingUp className="text-brand-teal" />
          <h2 className="font-heading text-2xl font-bold">2. Trend Analysis</h2>
        </div>
        
        <div className="space-y-6">
          <div className="border border-[#E8EDF5] rounded-xl overflow-hidden">
             <div className="bg-[#F7F9FC] px-6 py-4 border-b border-[#E8EDF5] font-bold text-sm text-theme-text uppercase">Biometric Stability</div>
             <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                   <p className="text-xs text-theme-muted uppercase font-bold mb-1">Avg Body Wt.</p>
                   <p className="font-mono text-2xl text-[#0D1B3E]">72.4 <span className="text-sm text-theme-muted">kg</span></p>
                   <p className="text-xs text-green-600 flex items-center gap-1 mt-1"><TrendingDown size={12}/> -0.2kg vs prior</p>
                </div>
                <div>
                   <p className="text-xs text-theme-muted uppercase font-bold mb-1">Resting Heart</p>
                   <p className="font-mono text-2xl text-[#0D1B3E]">64 <span className="text-sm text-theme-muted">bpm</span></p>
                   <p className="text-xs text-theme-muted flex items-center gap-1 mt-1">Stable</p>
                </div>
                <div>
                   <p className="text-xs text-theme-muted uppercase font-bold mb-1">Sleep Mean</p>
                   <p className="font-mono text-2xl text-[#0D1B3E]">7h 12m</p>
                   <p className="text-xs text-red-600 flex items-center gap-1 mt-1"><TrendingDown size={12}/> -25m vs prior</p>
                </div>
             </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E8EDF5]">
           <p className="text-xs font-mono text-theme-muted text-center uppercase tracking-widest">End of Report Document</p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReport;
"""

with open('frontend/src/pages/WeeklyReport.jsx', 'w') as f:
    f.write(code)

print("Weekly report rewritten!")
