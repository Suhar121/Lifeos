import os

code = """import React, { useState } from 'react';
import { ShieldCheck, Users, Link as LinkIcon, Lock, ChevronRight, Activity } from 'lucide-react';

const CarePage = () => {
  const [links] = useState([
    { id: '1', role: 'Primary Physician', name: 'Dr. Sarah Jenkins', active: true, access: 'Full Biometrics' },
    { id: '2', role: 'Family Member', name: 'Michael R.', active: false, access: 'Alerts Only' }
  ]);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 py-8 md:p-8 space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={20} className="text-[#16A34A]"/>
              <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">End-to-End Encrypted</span>
           </div>
           <h1 className="text-2xl font-bold text-[#0F172A]">Care Network</h1>
           <p className="text-sm text-[#64748B] mt-1 max-w-lg">Manage who has access to your clinical dashboard. Permissions can be revoked instantly.</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-blue text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm">
           <LinkIcon size={16} /> Generate Portal Link
        </button>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-card overflow-hidden">
         <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
           <h2 className="text-lg font-semibold text-[#0F172A] flex items-center gap-2"><Users size={20} className="text-brand-blue"/> Authorized Observers</h2>
         </div>
         <div className="divide-y divide-[#E2E8F0]">
            {links.map((link) => (
               <div key={link.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F8FAFC] transition">
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${link.active ? 'bg-blue-50 text-brand-blue' : 'bg-gray-100 text-[#94A3B8]'}`}>
                        <Lock size={18} />
                     </div>
                     <div>
                        <h3 className="text-sm font-semibold text-[#0F172A]">{link.role}</h3>
                        <p className="text-xs text-[#64748B] mt-0.5">{link.name} • {link.access}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 pl-14 md:pl-0">
                     <span className={`text-xs font-semibold px-2 py-1 rounded ${link.active ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                        {link.active ? 'Active' : 'Revoked'}
                     </span>
                     <button className="text-xs font-medium text-[#64748B] hover:text-[#0F172A] flex items-center gap-1">Manage <ChevronRight size={14}/></button>
                  </div>
               </div>
            ))}
         </div>
      </div>

      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
         <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0 border border-[#E2E8F0]">
            <Activity size={24} className="text-brand-teal" />
         </div>
         <div>
            <h3 className="text-sm font-semibold text-[#0F172A]">Emergency Protocol</h3>
            <p className="text-sm text-[#64748B] mt-1">If critical biometric thresholds are crossed, an automated SMS dispatch is sent to primary observers.</p>
         </div>
         <button className="md:ml-auto w-full md:w-auto px-4 py-2 border border-[#E2E8F0] bg-white text-[#0F172A] text-sm font-medium rounded-lg hover:bg-gray-50 flex-shrink-0">Configure Triggers</button>
      </div>
    </div>
  );
};

export default CarePage;
"""

with open('frontend/src/pages/CarePage.jsx', 'w') as f:
    f.write(code)

print("Care rewritten!")
