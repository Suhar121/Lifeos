import os

code = """import React, { useState, useEffect } from 'react';
import { User, Settings, Shield, Bell, LogOut, CheckCircle, Smartphone } from 'lucide-react';
import api from '../services/api';

const ProfilePage = () => {
  const [profile, setProfile] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Mock or fetch profile
    api.get('/users/me').then(res => setProfile(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/me', profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Error saving profile");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-theme-text mb-1 flex items-center gap-3">
          <Settings className="text-brand-blue" size={28}/> Account Settings
        </h1>
        <p className="text-theme-muted text-sm">Manage your profile, preferences, and clinical data settings.</p>
        {saved && <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-bold border border-green-200 flex flex-row items-center gap-2"><CheckCircle size={16}/> Saved successfully.</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Nav / Tabs */}
        <div className="space-y-2">
           <button className="w-full text-left px-5 py-3 rounded-xl font-bold bg-[#0D1B3E] text-white flex items-center gap-3 text-sm">
             <User size={18} /> Basic Info
           </button>
           <button className="w-full text-left px-5 py-3 rounded-xl font-bold bg-white text-theme-muted hover:bg-[#F7F9FC] border border-[#E8EDF5] flex items-center gap-3 text-sm transition">
             <Bell size={18} /> Notifications
           </button>
           <button className="w-full text-left px-5 py-3 rounded-xl font-bold bg-white text-theme-muted hover:bg-[#F7F9FC] border border-[#E8EDF5] flex items-center gap-3 text-sm transition">
             <Shield size={18} /> Privacy & Data
           </button>
           <div className="pt-4 mt-4 border-t border-[#E8EDF5]">
             <button onClick={logout} className="w-full text-left px-5 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 text-sm transition">
               <LogOut size={18} /> Sign Out
             </button>
           </div>
        </div>

        {/* Form area */}
        <div className="md:col-span-2">
           <div className="bg-white border border-[#E8EDF5] shadow-sm rounded-xl p-8">
              <h2 className="font-heading text-xl font-bold mb-6 border-b border-[#E8EDF5] pb-4 text-[#0D1B3E]">Personal details</h2>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-theme-text mb-2">First Name</label>
                    <input type="text" name="firstname" value={profile.firstname || ''} onChange={handleChange} className="w-full border border-[#E8EDF5] rounded-lg p-3 outline-none focus:border-brand-blue text-sm dark:bg-[#1A2540]" placeholder="Enter name"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-theme-text mb-2">Last Name</label>
                    <input type="text" name="lastname" value={profile.lastname || ''} onChange={handleChange} className="w-full border border-[#E8EDF5] rounded-lg p-3 outline-none focus:border-brand-blue text-sm dark:bg-[#1A2540]" placeholder="Enter surname"/>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-theme-text mb-2">Email Address</label>
                  <input type="email" name="email" value={profile.email || ''} onChange={handleChange} className="w-full border border-[#E8EDF5] rounded-lg p-3 outline-none focus:border-brand-blue text-sm dark:bg-[#1A2540]"/>
                </div>

                <div className="p-4 bg-[#F7F9FC] rounded-xl border border-[#E8EDF5] flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                   <div className="flex items-start gap-4">
                     <div className="w-10 h-10 bg-[#EEF3FB] rounded-full flex items-center justify-center text-brand-blue shrink-0">
                       <Smartphone size={20} />
                     </div>
                     <div>
                       <h3 className="font-bold text-sm text-[#0D1B3E]">Clinical Alerts (WhatsApp)</h3>
                       <p className="text-xs text-theme-muted mt-1">Receive priority vital alerts</p>
                     </div>
                   </div>
                   <button type="button" className="px-4 py-2 bg-white border border-[#E8EDF5] rounded-lg text-xs font-bold shadow-sm whitespace-nowrap text-theme-text hover:border-brand-blue">Configure</button>
                </div>

                <div className="pt-6 border-t border-[#E8EDF5] flex justify-end">
                   <button type="submit" className="bg-brand-blue text-white px-8 py-3 rounded-xl font-bold shadow-sm hover:bg-[#0D4FB5] transition">Save Changes</button>
                </div>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
"""

with open('frontend/src/pages/ProfilePage.jsx', 'w') as f:
    f.write(code)

print("Profile rewritten!")
