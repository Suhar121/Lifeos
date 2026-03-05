import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Calendar, Droplets, Ruler, Weight,
  MapPin, Heart, Shield, Camera, Save, AlertCircle, Check,
  Edit3, X, Loader2, Trash2, LogOut
} from 'lucide-react';
import api from '../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({});
  const [photoUploading, setPhotoUploading] = useState(false);

  // Password change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile/');
      setProfile(data);
      setForm(data);
    } catch (err) {
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        blood_group: form.blood_group || null,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        country: form.country || null,
        pin_code: form.pin_code || null,
        emergency_contact_name: form.emergency_contact_name || null,
        emergency_contact_phone: form.emergency_contact_phone || null,
        emergency_contact_relation: form.emergency_contact_relation || null,
        medical_conditions: form.medical_conditions || null,
        allergies: form.allergies || null,
      };
      const { data } = await api.put('/profile/', payload);
      setProfile(data);
      setForm(data);
      setEditing(false);
      showToast('Profile updated successfully');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/profile/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(data);
      setForm(data);
      showToast('Photo uploaded');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Photo upload failed', 'error');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      const { data } = await api.delete('/profile/photo');
      setProfile(data);
      setForm(data);
      showToast('Photo removed');
    } catch {
      showToast('Failed to remove photo', 'error');
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (passwords.new.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    try {
      await api.put(`/profile/password?old_password=${encodeURIComponent(passwords.old)}&new_password=${encodeURIComponent(passwords.new)}`);
      showToast('Password changed successfully');
      setShowPasswordModal(false);
      setPasswords({ old: '', new: '', confirm: '' });
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to change password', 'error');
    }
  };

  const getPhotoUrl = () => {
    if (!profile?.profile_photo_url) return null;
    const base = api.defaults.baseURL || '';
    return `${base}${profile.profile_photo_url}`;
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const bmi = () => {
    if (!profile?.height_cm || !profile?.weight_kg) return null;
    const h = profile.height_cm / 100;
    const val = (profile.weight_kg / (h * h)).toFixed(1);
    let label = 'Normal';
    let color = 'text-green-400';
    if (val < 18.5) { label = 'Underweight'; color = 'text-yellow-400'; }
    else if (val >= 25 && val < 30) { label = 'Overweight'; color = 'text-orange-400'; }
    else if (val >= 30) { label = 'Obese'; color = 'text-red-400'; }
    return { val, label, color };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-400" size={36} />
      </div>
    );
  }

  const bmiData = bmi();
  const age = calculateAge(profile?.date_of_birth);

  // ── Field definitions for the form ──
  const sections = [
    {
      title: 'Personal Information',
      icon: User,
      fields: [
        { key: 'name', label: 'Full Name', icon: User, type: 'text' },
        { key: 'phone', label: 'Phone Number', icon: Phone, type: 'tel', placeholder: '+91 98765 43210' },
        { key: 'date_of_birth', label: 'Date of Birth', icon: Calendar, type: 'date' },
        { key: 'gender', label: 'Gender', icon: User, type: 'select', options: GENDERS },
      ],
    },
    {
      title: 'Health Details',
      icon: Heart,
      fields: [
        { key: 'blood_group', label: 'Blood Group', icon: Droplets, type: 'select', options: BLOOD_GROUPS },
        { key: 'height_cm', label: 'Height (cm)', icon: Ruler, type: 'number', placeholder: '170' },
        { key: 'weight_kg', label: 'Weight (kg)', icon: Weight, type: 'number', placeholder: '70' },
        { key: 'medical_conditions', label: 'Medical Conditions', icon: AlertCircle, type: 'textarea', placeholder: 'e.g. Diabetes, Hypertension' },
        { key: 'allergies', label: 'Allergies', icon: AlertCircle, type: 'textarea', placeholder: 'e.g. Penicillin, Peanuts' },
      ],
    },
    {
      title: 'Address',
      icon: MapPin,
      fields: [
        { key: 'address', label: 'Street Address', icon: MapPin, type: 'textarea', placeholder: 'House/Flat No., Street' },
        { key: 'city', label: 'City', icon: MapPin, type: 'text' },
        { key: 'state', label: 'State', icon: MapPin, type: 'text' },
        { key: 'country', label: 'Country', icon: MapPin, type: 'text' },
        { key: 'pin_code', label: 'PIN / ZIP Code', icon: MapPin, type: 'text' },
      ],
    },
    {
      title: 'Emergency Contact',
      icon: Shield,
      fields: [
        { key: 'emergency_contact_name', label: 'Contact Name', icon: User, type: 'text', placeholder: 'Full name' },
        { key: 'emergency_contact_phone', label: 'Contact Phone', icon: Phone, type: 'tel', placeholder: '+91 98765 43210' },
        { key: 'emergency_contact_relation', label: 'Relationship', icon: Heart, type: 'text', placeholder: 'e.g. Spouse, Parent' },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-[slideIn_0.3s_ease] ${
          toast.type === 'error'
            ? 'bg-red-500/20 border border-red-500/30 text-red-300'
            : 'bg-green-500/20 border border-green-500/30 text-green-300'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          {toast.msg}
        </div>
      )}

      {/* ── Header Card: Avatar + Quick Stats ── */}
      <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden ring-4 ring-neutral-700">
              {getPhotoUrl() ? (
                <img src={getPhotoUrl()} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            {editing && (
              <div className="absolute -bottom-1 -right-1 flex gap-1">
                <label className="bg-indigo-600 hover:bg-indigo-500 p-2 rounded-full cursor-pointer transition-colors shadow-lg">
                  {photoUploading ? <Loader2 size={14} className="animate-spin text-white" /> : <Camera size={14} className="text-white" />}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={photoUploading} />
                </label>
                {profile?.profile_photo_url && (
                  <button onClick={handleDeletePhoto} className="bg-red-600 hover:bg-red-500 p-2 rounded-full transition-colors shadow-lg">
                    <Trash2 size={14} className="text-white" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Name + Quick Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-white">{profile?.name || 'User'}</h1>
            <p className="text-gray-400 flex items-center gap-1 justify-center sm:justify-start mt-1">
              <Mail size={14} /> {profile?.email}
            </p>

            <div className="flex flex-wrap gap-3 mt-3 justify-center sm:justify-start">
              {age && (
                <span className="bg-neutral-700/50 px-3 py-1 rounded-full text-xs text-gray-300 flex items-center gap-1">
                  <Calendar size={12} /> {age} years old
                </span>
              )}
              {profile?.gender && (
                <span className="bg-neutral-700/50 px-3 py-1 rounded-full text-xs text-gray-300">
                  {profile.gender}
                </span>
              )}
              {profile?.blood_group && (
                <span className="bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full text-xs text-red-400 flex items-center gap-1">
                  <Droplets size={12} /> {profile.blood_group}
                </span>
              )}
              {bmiData && (
                <span className={`bg-neutral-700/50 px-3 py-1 rounded-full text-xs ${bmiData.color} flex items-center gap-1`}>
                  BMI {bmiData.val} · {bmiData.label}
                </span>
              )}
              {profile?.streak_count > 0 && (
                <span className="bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full text-xs text-orange-400">
                  {profile.streak_count} day streak
                </span>
              )}
            </div>
          </div>

          {/* Edit button */}
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium disabled:opacity-50">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save
                </button>
                <button onClick={() => { setEditing(false); setForm(profile); }} className="flex items-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-gray-300 px-4 py-2 rounded-xl transition-colors text-sm">
                  <X size={16} /> Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-gray-300 px-4 py-2 rounded-xl transition-colors text-sm font-medium">
                <Edit3 size={16} /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Form Sections ── */}
      {sections.map((section) => (
        <div key={section.title} className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-700/50 flex items-center gap-2">
            <section.icon size={18} className="text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">{section.title}</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {section.fields.map((field) => (
              <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  <field.icon size={12} /> {field.label}
                </label>
                {editing ? (
                  field.type === 'select' ? (
                    <select
                      value={form[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value || null)}
                      className="w-full bg-neutral-700/50 border border-neutral-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    >
                      <option value="">Select...</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={form[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={2}
                      className="w-full bg-neutral-700/50 border border-neutral-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={form[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-neutral-700/50 border border-neutral-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  )
                ) : (
                  <p className="text-white text-sm py-2">
                    {form[field.key]
                      ? (field.key === 'date_of_birth'
                        ? new Date(form[field.key]).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                        : form[field.key])
                      : <span className="text-gray-500 italic">Not set</span>
                    }
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ── Account Section ── */}
      <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-700/50 flex items-center gap-2">
          <Shield size={18} className="text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">Account</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium">Change Password</p>
              <p className="text-xs text-gray-400">Update your account password</p>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="bg-neutral-700 hover:bg-neutral-600 text-gray-300 px-4 py-2 rounded-xl text-sm transition-colors"
            >
              Change
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium">Member Since</p>
              <p className="text-xs text-gray-400">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '—'}
              </p>
            </div>
          </div>
          <div className="border-t border-neutral-700/50 pt-4">
            <button
              onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* ── Password Modal ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 border border-neutral-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current password"
                value={passwords.old}
                onChange={(e) => setPasswords(p => ({ ...p, old: e.target.value }))}
                className="w-full bg-neutral-700/50 border border-neutral-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
              <input
                type="password"
                placeholder="New password (min 6 chars)"
                value={passwords.new}
                onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                className="w-full bg-neutral-700/50 border border-neutral-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwords.confirm}
                onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                className="w-full bg-neutral-700/50 border border-neutral-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowPasswordModal(false)} className="bg-neutral-700 hover:bg-neutral-600 text-gray-300 px-4 py-2 rounded-xl text-sm">
                Cancel
              </button>
              <button onClick={handleChangePassword} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium">
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
