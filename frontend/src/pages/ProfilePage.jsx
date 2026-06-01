import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, Bell, LogOut, CheckCircle, Download,
  Plus, FileText, Calendar, Users, Lock,
  HeartPulse, AlertTriangle, Shield, Upload, Badge
} from 'lucide-react';
import api from '../services/api';

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U';

const StatCard = ({ label, value, color = 'text-white' }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col">
    <span className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">{label}</span>
    <span className={`text-lg font-bold ${color}`}>{value || '—'}</span>
  </div>
);

const SectionHeader = ({ icon: Icon, label, iconClass = 'text-[#0d968b]', extra }) => (
  <div className="flex items-center justify-between mb-6">
    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
      <Icon className={`w-5 h-5 ${iconClass}`} />
      {label}
    </h4>
    {extra}
  </div>
);

const Field = ({ label, value }) => (
  <div>
    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{label}</label>
    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value || '—'}</p>
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <div className="relative inline-flex items-center cursor-pointer" onClick={onChange}>
    <div className={`w-10 h-5 rounded-full transition-colors ${checked ? 'bg-[#0d968b]' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
    <div className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full border border-slate-300 transition-all ${checked ? 'translate-x-5' : ''}`}></div>
  </div>
);

const ProfilePage = () => {
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    api.get('/profile/').then(res => {
      setProfile(res.data);
      setForm(res.data);
    }).catch(() => {});
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/profile/', form);
      setProfile(res.data);
      setForm(res.data);
      setSaved(true);
      setEditMode(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Error saving profile');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/profile/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile(res.data);
    } catch {
      alert('Photo upload failed');
    } finally {
      setPhotoLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const getPhotoUrl = () => {
    if (!profile.profile_photo_url) return null;
    if (profile.profile_photo_url.startsWith('http')) return profile.profile_photo_url;
    return `${api.defaults.baseURL}${profile.profile_photo_url}`;
  };

  const photoUrl = getPhotoUrl();
  const nameInitials = initials(profile.name);
  const joinYear = profile.created_at ? new Date(profile.created_at).getFullYear() : '—';
  const dob = profile.date_of_birth
    ? new Date(profile.date_of_birth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full flex flex-col gap-10">

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-bold border border-emerald-200 dark:border-emerald-800">
          <CheckCircle className="w-4 h-4" /> Profile saved successfully.
        </div>
      )}

      {/* Hero Banner */}
      <section className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }}></div>
        <div className="relative p-8 md:p-12 flex flex-col lg:flex-row items-center gap-10">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl ring-4 ring-[#0d968b]/10 cursor-pointer group"
              onClick={() => fileRef.current?.click()}
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0d968b] to-[#065f46] text-white text-3xl font-bold">
                  {nameInitials}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-lg shadow-lg border-2 border-slate-900">
              <CheckCircle className="w-4 h-4" />
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            {photoLoading && <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center text-white text-xs">Uploading…</div>}
          </div>

          {/* Info */}
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-white tracking-tight">{profile.name || 'User'}</h3>
              <p className="text-[#0d968b] font-medium tracking-widest text-xs uppercase mt-1">
                ID: LO-{(profile.id || '00000').slice(-5).toUpperCase()} — Member since {joinYear}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Blood Type" value={profile.blood_group} />
              <StatCard label="Height" value={profile.height_cm ? `${profile.height_cm} cm` : null} color="text-emerald-400" />
              <StatCard label="Weight" value={profile.weight_kg ? `${profile.weight_kg} kg` : null} />
              <StatCard label="Status" value="Active" color="text-[#0d968b]" />
            </div>
          </div>

          {/* Account card */}
          <div className="lg:w-64 w-full">
            <div className="bg-[#0d968b]/10 border border-[#0d968b]/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-[#0d968b] w-4 h-4" />
                <span className="text-[10px] uppercase font-bold text-[#0d968b] tracking-widest">Account Info</span>
              </div>
              <p className="text-white text-sm font-semibold">Member Profile</p>
              <p className="text-slate-400 text-xs mt-1 truncate">{profile.email || '—'}</p>
              <button
                onClick={logout}
                className="mt-4 w-full py-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-3 h-3" /> End Session
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Column Body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">

        {/* LEFT */}
        <div className="bg-white dark:bg-slate-900 p-8 flex flex-col divide-y divide-slate-100 dark:divide-slate-800">

          {/* Personal Profile */}
          <div className="pb-8">
            <SectionHeader
              icon={Shield}
              label="Personal Profile"
              extra={
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="text-[#0d968b] text-[10px] font-bold uppercase tracking-wider hover:opacity-70"
                >
                  {editMode ? 'Cancel' : 'Modify'}
                </button>
              }
            />
            {editMode ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'name', label: 'Full Name', type: 'text' },
                    { name: 'phone', label: 'Phone', type: 'tel' },
                    { name: 'date_of_birth', label: 'Date of Birth', type: 'date' },
                    { name: 'height_cm', label: 'Height (cm)', type: 'number' },
                    { name: 'weight_kg', label: 'Weight (kg)', type: 'number' },
                    { name: 'emergency_contact_name', label: 'Emergency Contact', type: 'text' },
                    { name: 'emergency_contact_phone', label: 'Emergency Phone', type: 'tel' },
                    { name: 'emergency_contact_relation', label: 'Relation', type: 'text' },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{f.label}</label>
                      <input
                        name={f.name} type={f.type} value={form[f.name] || ''}
                        onChange={handleChange}
                        className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl py-2.5 px-3 text-sm focus:border-[#0d968b] focus:ring-1 focus:ring-[#0d968b] outline-none transition-all"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Gender</label>
                    <select name="gender" value={form.gender || ''} onChange={handleChange}
                      className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl py-2.5 px-3 text-sm focus:border-[#0d968b] focus:ring-1 focus:ring-[#0d968b] outline-none transition-all">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Blood Group</label>
                    <select name="blood_group" value={form.blood_group || ''} onChange={handleChange}
                      className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl py-2.5 px-3 text-sm focus:border-[#0d968b] focus:ring-1 focus:ring-[#0d968b] outline-none transition-all">
                      <option value="">Select</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Medical Conditions</label>
                  <textarea name="medical_conditions" value={form.medical_conditions || ''} onChange={handleChange} rows={2}
                    className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl py-2.5 px-3 text-sm focus:border-[#0d968b] focus:ring-1 focus:ring-[#0d968b] outline-none transition-all resize-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Known Allergies</label>
                  <textarea name="allergies" value={form.allergies || ''} onChange={handleChange} rows={2}
                    className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl py-2.5 px-3 text-sm focus:border-[#0d968b] focus:ring-1 focus:ring-[#0d968b] outline-none transition-all resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 py-2.5 bg-[#0d968b] text-white text-sm font-bold rounded-xl hover:bg-[#0b857b] transition-colors">
                    Save Changes
                  </button>
                  <button type="button" onClick={() => { setEditMode(false); setForm(profile); }}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors">
                    Discard
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <Field label="Legal Name" value={profile.name} />
                <Field label="Email Affinity" value={profile.email} />
                <Field label="Birth Registry" value={dob} />
                <Field label="Gender Identity" value={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : null} />
                <Field label="Phone Number" value={profile.phone} />
                <Field label="Blood Group" value={profile.blood_group} />
              </div>
            )}
          </div>

          {/* Medical Safeguards */}
          <div className="py-8">
            <SectionHeader icon={AlertTriangle} label="Medical Safeguards" iconClass="text-red-500" />
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <Users className="text-slate-400 w-5 h-5 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">Primary Emergency Liaison</p>
                    {profile.emergency_contact_name ? (
                      <p className="text-sm font-medium mt-0.5">
                        {profile.emergency_contact_name}
                        {profile.emergency_contact_relation && <span className="text-slate-400 font-normal ml-1">({profile.emergency_contact_relation})</span>}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 mt-0.5">Not set — click Modify to add</p>
                    )}
                  </div>
                </div>
                {profile.emergency_contact_phone && <span className="text-xs font-bold text-[#0d968b]">{profile.emergency_contact_phone}</span>}
              </div>

              {profile.medical_conditions && (
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <HeartPulse className="text-[#0d968b] w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Medical Conditions</p>
                    <p className="text-sm font-medium text-slate-500 mt-0.5">{profile.medical_conditions}</p>
                  </div>
                </div>
              )}

              {profile.allergies && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                  <AlertTriangle className="text-red-500 w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-red-600">Known Allergies</p>
                    <p className="text-sm font-medium text-red-500 mt-0.5">{profile.allergies}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Health Data Portability */}
          <div className="pt-8">
            <div className="p-5 bg-[#0d968b]/5 rounded-2xl border border-[#0d968b]/10 flex items-center justify-between">
              <div className="max-w-[240px]">
                <h5 className="text-sm font-bold text-slate-900 dark:text-white">Health Data Portability</h5>
                <p className="text-xs text-slate-500 mt-1">Download encrypted records for external consultation.</p>
              </div>
              <button
                onClick={() => {
                  const d = JSON.stringify(profile, null, 2);
                  const b = new Blob([d], { type: 'application/json' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(b);
                  a.download = 'health-profile.json';
                  a.click();
                }}
                className="p-3 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl text-[#0d968b] hover:bg-[#0d968b] hover:text-white transition-all"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white dark:bg-slate-900 p-8 flex flex-col divide-y divide-slate-100 dark:divide-slate-800">

          {/* Security Protocol */}
          <div className="pb-8">
            <SectionHeader icon={Shield} label="Security Protocol" />
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold">Multi-Factor Biometrics</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Secured with Auth App</p>
                </div>
                <Toggle checked={mfaEnabled} onChange={() => setMfaEnabled(!mfaEnabled)} />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div>
                  <p className="text-sm font-semibold">Push Notifications</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Health alerts &amp; reminders</p>
                </div>
                <Toggle checked={notifEnabled} onChange={() => setNotifEnabled(!notifEnabled)} />
              </div>
              <button className="w-full flex items-center justify-between py-3 px-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors mt-2">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" /> Key Access Rotation
                </span>
                <span className="text-[10px] font-bold text-slate-400">Change Password</span>
              </button>
            </div>
          </div>

          {/* Circle of Care */}
          <div className="py-8">
            <SectionHeader
              icon={Users}
              label="Circle of Care"
              extra={<span className="text-[10px] font-bold text-slate-400">AUTHORIZED CONTACTS</span>}
            />
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {profile.emergency_contact_name ? (
                  <div className="size-10 rounded-full bg-[#0d968b]/10 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-[#0d968b]">
                    {initials(profile.emergency_contact_name)}
                  </div>
                ) : (
                  <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-slate-500">
                    —
                  </div>
                )}
              </div>
              <button
                className="size-10 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:border-[#0d968b] hover:text-[#0d968b] transition-all"
                onClick={() => setEditMode(true)}
              >
                <Plus className="w-4 h-4" />
              </button>
              <div className="ml-auto">
                <button
                  onClick={() => setEditMode(true)}
                  className="text-[10px] font-bold text-[#0d968b] uppercase border-b border-[#0d968b]/20 hover:border-[#0d968b]"
                >
                  Grant Access
                </button>
              </div>
            </div>
          </div>

          {/* Bio-Ethics & Directives */}
          <div className="pt-8">
            <SectionHeader icon={FileText} label="Bio-Ethics & Directives" />
            <div className="grid grid-cols-1 gap-4">
              <button className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-left hover:border-[#0d968b]/30 transition-all group">
                <FileText className="text-slate-400 group-hover:text-[#0d968b] w-5 h-5" />
                <div>
                  <p className="text-sm font-semibold">Living Will & Directives</p>
                  <p className="text-[10px] text-slate-500">Medical advance directives document</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-left hover:border-[#0d968b]/30 transition-all group">
                <Bell className="text-slate-400 group-hover:text-[#0d968b] w-5 h-5" />
                <div>
                  <p className="text-sm font-semibold">Notification Preferences</p>
                  <p className="text-[10px] text-slate-500">Manage alerts &amp; reminders</p>
                </div>
              </button>
              <button
                onClick={logout}
                className="w-fit text-red-400/60 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors mt-4"
              >
                Revoke Account Privileges
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="pb-4 text-center">
        <p className="text-slate-400 text-[10px] uppercase tracking-[0.3em]">
          © 2024 LifeOS Premium • High-Tier Clinical Architecture • AES-256 Validated
        </p>
      </footer>
    </div>
  );
};

export default ProfilePage;
