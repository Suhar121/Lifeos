import os

code = """import React, { useState } from 'react';
import { Activity, Heart, Droplet, Thermometer, Save, FileText } from 'lucide-react';
import api from '../services/api';

const HealthPage = () => {
  const [formData, setFormData] = useState({
    weight: '', bp_systolic: '', bp_diastolic: '', blood_sugar: '', heart_rate: ''
  });

  const InputRow = ({ label, unit, valueKey, reference, normalRange }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-[#E2E8F0] last:border-0 gap-4">
      <div className="sm:w-1/3">
         <label className="text-sm font-semibold text-[#0F172A] block">{label}</label>
         <span className="text-xs text-[#64748B] block mt-1">Ref: {reference}</span>
      </div>
      <div className="sm:w-2/3 flex items-center justify-end gap-3 w-full">
         <div className="relative flex-1 sm:max-w-[200px]">
           <input 
             type="number" 
             value={formData[valueKey] || ''} 
             onChange={e => setFormData({...formData, [valueKey]: e.target.value})} 
             className="w-full px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal text-right font-mono"
             placeholder="---"
           />
           <span className="absolute right-12 top-2.5 text-xs text-[#94A3B8] select-none pointer-events-none">{unit}</span>
         </div>
         <div className={`w-2 h-2 rounded-full ${normalRange(formData[valueKey]) ? 'bg-[#16A34A]' : (formData[valueKey] ? 'bg-[#EA580C]' : 'bg-[#E2E8F0]')}`}></div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4 py-8 md:p-8 space-y-6">
      <div className="flex items-center justify-between mb-8">
         <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Clinical Vitals</h1>
            <p className="text-sm text-[#64748B] mt-1">Manual entry laboratory style tracking.</p>
         </div>
         <button className="flex items-center gap-2 bg-brand-teal text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition shadow-sm transform active:scale-95">
           <Save size={16} /> Record
         </button>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-card overflow-hidden">
         <div className="bg-[#F8FAFC] px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
            <Heart size={18} className="text-[#DC2626]" />
            <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide">Cardiovascular</h2>
         </div>
         <div className="px-6">
            <InputRow label="Systolic Pressure" unit="mmHg" valueKey="bp_systolic" reference="< 120" normalRange={(v) => v && v < 120} />
            <InputRow label="Diastolic Pressure" unit="mmHg" valueKey="bp_diastolic" reference="< 80" normalRange={(v) => v && v < 80} />
            <InputRow label="Resting Heart Rate" unit="bpm" valueKey="heart_rate" reference="60 - 100" normalRange={(v) => v && v >= 60 && v <= 100} />
         </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-card overflow-hidden">
         <div className="bg-[#F8FAFC] px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
            <Droplet size={18} className="text-brand-blue" />
            <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide">Metabolic</h2>
         </div>
         <div className="px-6">
            <InputRow label="Fasting Blood Glucose" unit="mg/dL" valueKey="blood_sugar" reference="70 - 99" normalRange={(v) => v && v >= 70 && v <= 99} />
         </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-card overflow-hidden">
         <div className="bg-[#F8FAFC] px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
            <Activity size={18} className="text-brand-teal" />
            <h2 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide">Body Metrics</h2>
         </div>
         <div className="px-6">
            <InputRow label="Body Weight" unit="kg" valueKey="weight" reference="User Base" normalRange={(v) => v && v > 0} />
         </div>
      </div>

      <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4 flex items-start gap-3 mt-8">
         <FileText className="text-[#DC2626] shrink-0 mt-0.5" size={18} />
         <p className="text-xs text-[#991B1B] leading-relaxed">
           <strong>Disclaimer:</strong> This portal is for tracking purposes only. If your readings strongly exceed the stated reference values, please contact your primary care physician immediately.
         </p>
      </div>
    </div>
  );
};

export default HealthPage;
"""

with open('frontend/src/pages/HealthPage.jsx', 'w') as f:
    f.write(code)

print("Health rewritten!")
