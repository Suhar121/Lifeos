import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Activity, ChevronRight, ChevronLeft, User, Mail, Lock, Phone, Calendar, Droplets, Ruler, Weight } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const Register = () => {
  const [step, setStep] = useState(1); // 1 = account, 2 = demographics
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    phone: '', date_of_birth: '', gender: '',
    blood_group: '', height_cm: '', weight_kg: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        blood_group: form.blood_group || null,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      };
      await api.post('/auth/register', payload);
      const response = await api.post('/auth/login', { email: form.email, password: form.password });
      localStorage.setItem('token', response.data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
      if (err.response?.status === 400) setStep(1); // go back if email duplicate
    } finally {
      setLoading(false);
    }
  };

  const goToStep2 = () => {
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in name, email and password');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setStep(2);
  };

  const inputClass = "w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 px-4">
      <div className="max-w-md w-full bg-neutral-800 rounded-xl shadow-2xl overflow-hidden border border-neutral-700">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center">
               <Activity size={28} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-white mb-2">Create Account</h2>
          <p className="text-center text-gray-400 mb-2">Start your journey to a better you</p>
          
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-indigo-500' : 'bg-neutral-600'}`} />
            <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-indigo-500' : 'bg-neutral-600'}`} />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-5">
              <div>
                <label className="text-xs text-gray-400 mb-1 flex items-center gap-1"><User size={12} /> Full Name</label>
                <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)}
                  className={inputClass} placeholder="John Doe" required />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Mail size={12} /> Email</label>
                <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)}
                  className={inputClass} placeholder="you@example.com" required />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Lock size={12} /> Password</label>
                <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)}
                  className={inputClass} placeholder="••••••••  (min 6 chars)" required />
              </div>
              <button onClick={goToStep2}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg">
                Next <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-gray-400 text-center -mt-2 mb-2">These help us personalize your health tracking. You can skip and fill later.</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Phone size={12} /> Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)}
                    className={inputClass} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Calendar size={12} /> Date of Birth</label>
                  <input type="date" value={form.date_of_birth} onChange={(e) => handleChange('date_of_birth', e.target.value)}
                    className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center gap-1"><User size={12} /> Gender</label>
                  <select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)}
                    className={inputClass}>
                    <option value="">Select...</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Droplets size={12} /> Blood Group</label>
                  <select value={form.blood_group} onChange={(e) => handleChange('blood_group', e.target.value)}
                    className={inputClass}>
                    <option value="">Select...</option>
                    {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Ruler size={12} /> Height (cm)</label>
                  <input type="number" value={form.height_cm} onChange={(e) => handleChange('height_cm', e.target.value)}
                    className={inputClass} placeholder="170" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Weight size={12} /> Weight (kg)</label>
                  <input type="number" value={form.weight_kg} onChange={(e) => handleChange('weight_kg', e.target.value)}
                    className={inputClass} placeholder="70" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-gray-300 font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-1 text-sm">
                  <ChevronLeft size={16} /> Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-[2] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
