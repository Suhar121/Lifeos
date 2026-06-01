import os

register_code = """import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AuthLayout, FloatingInput } from './Login';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', date_of_birth: '', gender: '', blood_group: '', height_cm: '', weight_kg: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const payload = { ...form, height_cm: form.height_cm ? parseFloat(form.height_cm) : null, weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null };
      await api.post('/auth/register', payload);
      const res = await api.post('/auth/login', { email: form.email, password: form.password });
      localStorage.setItem('token', res.data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Establish your secure health profile.">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm border border-red-200">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <FloatingInput name="name" label="Full Name" type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required autoComplete="name" />
          <FloatingInput name="email" label="Email Address" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required autoComplete="email" />
          <FloatingInput name="password" label="Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required min="6" autoComplete="new-password" />
        </div>

        <div className="mt-8 mb-6 border border-[#E8EDF5] dark:border-[#243052] rounded-xl overflow-hidden">
          <button type="button" onClick={() => setShowOptional(!showOptional)} className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 border-gray-100 hover:bg-gray-100 cursor-pointer">
            <span className="text-sm font-medium text-theme-text">Health Profile (Optional)</span>
            {showOptional ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>
          {showOptional && (
             <div className="p-4 space-y-4 border-t border-[#E8EDF5] dark:border-[#243052]">
               <div className="flex gap-4">
                 <FloatingInput name="phone" label="Phone" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} autoComplete="tel" />
                 <FloatingInput name="date_of_birth" label="Date of Birth" type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} autoComplete="bday" />
               </div>
               <div className="flex gap-4">
                 <FloatingInput name="height_cm" label="Height (cm)" type="number" value={form.height_cm} onChange={e => setForm({...form, height_cm: e.target.value})} />
                 <FloatingInput name="weight_kg" label="Weight (kg)" type="number" value={form.weight_kg} onChange={e => setForm({...form, weight_kg: e.target.value})} />
               </div>
             </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="w-full bg-brand-blue text-white font-medium py-3.5 rounded-lg mt-2 hover:bg-[#0D4FB5] transition cursor-pointer disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-theme-muted">
        Already have an account? <Link to="/login" className="text-brand-blue font-medium hover:underline">Sign In</Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
"""

with open('frontend/src/pages/Register.jsx', 'w') as f:
    f.write(register_code)

print("Register page updated.")
