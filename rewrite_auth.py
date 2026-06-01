import os

login_code = """import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Activity, ShieldCheck } from 'lucide-react';
import { subscribeToPush } from '../services/pushNotifications';

const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen flex text-theme-text bg-[#F7F9FC] dark:bg-[#0C1220]">
    {/* Left Panel - Brand */}
    <div className="hidden lg:flex w-2/5 bg-[#0D1B3E] flex-col justify-between p-12 text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-16">
          <Activity size={24} className="text-blue-400" />
          <span className="font-heading font-bold text-2xl tracking-tight">LifeOS</span>
        </div>
        <h2 className="font-heading text-4xl font-light leading-tight mb-6">Precise Care.<br/><span className="font-bold">Better Outcomes.</span></h2>
        <p className="text-blue-200 text-lg max-w-md">Your clinical-grade personal health operating system.</p>
      </div>
      
      <div className="relative z-10 flex items-center gap-6 text-sm text-blue-300">
         <div className="flex items-center gap-2"><ShieldCheck size={18} /> 256-bit encrypted</div>
         <div className="flex items-center gap-2"><ShieldCheck size={18} /> HIPAA-ready design</div>
      </div>

      {/* Abstract ECG / background decor */}
      <svg className="absolute bottom-0 left-0 w-full h-auto text-blue-500/10" viewBox="0 0 1000 300" preserveAspectRatio="none">
         <path d="M0 200 L200 200 L250 100 L300 280 L350 150 L400 200 L1000 200 L1000 300 L0 300 Z" fill="currentColor"/>
      </svg>
    </div>

    {/* Right Panel - Form */}
    <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 bg-white dark:bg-[#141C2E]">
       <div className="max-w-md w-full mx-auto">
         <div className="lg:hidden flex items-center gap-2 mb-8">
           <div className="bg-brand-blue p-2 rounded text-white"><Activity size={20} /></div>
           <span className="font-heading font-bold text-xl">LifeOS</span>
         </div>
         <h1 className="font-heading text-3xl font-bold mb-2">{title}</h1>
         <p className="text-theme-muted mb-8">{subtitle}</p>
         {children}
       </div>
    </div>
  </div>
);

const FloatingInput = ({ label, type, value, onChange, required }) => (
  <div className="relative mb-5 group">
    <input 
      type={type} value={value} onChange={onChange} required={required}
      placeholder=" " /* space trigger placeholder-shown */
      className="block w-full px-4 pt-6 pb-2 text-sm text-theme-text bg-transparent border border-[#E5E9F2] dark:border-[#243052] rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-brand-blue peer"
    />
    <label className="absolute text-sm text-theme-muted duration-200 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-brand-blue">
      {label}
    </label>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      subscribeToPush().catch(() => {});
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <AuthLayout title="Sign In" subtitle="Log in to access your health data.">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm border border-red-200">{error}</div>}
      <form onSubmit={handleSubmit}>
        <FloatingInput label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <FloatingInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        
        <button type="submit" className="w-full bg-brand-blue text-white font-medium py-3.5 rounded-lg mt-4 hover:bg-[#0D4FB5] transition">
          Sign In
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-theme-muted">
        Don't have an account? <Link to="/register" className="text-brand-blue font-medium hover:underline">Create one</Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
"""

register_code = """import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Activity, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

// Reuse AuthLayout & FloatingInput from Login visually (inlining here for standalone)
const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen flex text-theme-text bg-[#F7F9FC] dark:bg-[#0C1220]">
    <div className="hidden lg:flex w-2/5 bg-[#0D1B3E] flex-col justify-between p-12 text-white relative overflow-hidden fixed h-screen top-0 left-0">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-16">
          <Activity size={24} className="text-blue-400" />
          <span className="font-heading font-bold text-2xl tracking-tight">LifeOS</span>
        </div>
        <h2 className="font-heading text-4xl font-light leading-tight mb-6">Precise Care.<br/><span className="font-bold">Better Outcomes.</span></h2>
        <p className="text-blue-200 text-lg max-w-md">Your clinical-grade personal health operating system.</p>
      </div>
      <div className="relative z-10 flex items-center gap-6 text-sm text-blue-300">
         <div className="flex items-center gap-2"><ShieldCheck size={18} /> 256-bit encrypted</div>
         <div className="flex items-center gap-2"><ShieldCheck size={18} /> HIPAA-ready</div>
       </div>
    </div>
    <div className="flex-1 flex flex-col px-6 py-12 sm:px-12 lg:px-24 bg-white dark:bg-[#141C2E] lg:ml-[40%] min-h-screen">
       <div className="max-w-xl w-full mx-auto">
         <h1 className="font-heading text-3xl font-bold mb-2">{title}</h1>
         <p className="text-theme-muted mb-8">{subtitle}</p>
         {children}
       </div>
    </div>
  </div>
);

const FloatingInput = ({ label, type, value, onChange, required, min }) => (
  <div className="relative mb-5 flex-1">
    <input 
      type={type} value={value} onChange={onChange} required={required} min={min}
      placeholder=" " 
      className="block w-full px-4 pt-6 pb-2 text-sm text-theme-text bg-transparent border border-[#E5E9F2] dark:border-[#243052] rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-brand-blue peer"
    />
    <label className="absolute text-sm text-theme-muted duration-200 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-brand-blue">
      {label}
    </label>
  </div>
);

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
          <FloatingInput label="Full Name" type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <FloatingInput label="Email Address" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <FloatingInput label="Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required min="6" />
        </div>

        <div className="mt-8 mb-6 border border-[#E8EDF5] dark:border-[#243052] rounded-xl overflow-hidden">
          <button type="button" onClick={() => setShowOptional(!showOptional)} className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 border-gray-100 hover:bg-gray-100">
             <span className="text-sm font-medium text-theme-text">Health Profile (Optional)</span>
             {showOptional ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>
          {showOptional && (
            <div className="p-4 space-y-4 border-t border-[#E8EDF5] dark:border-[#243052]">
              <div className="flex gap-4">
                <FloatingInput label="Phone" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                <FloatingInput label="Date of Birth" type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <FloatingInput label="Height (cm)" type="number" value={form.height_cm} onChange={e => setForm({...form, height_cm: e.target.value})} />
                <FloatingInput label="Weight (kg)" type="number" value={form.weight_kg} onChange={e => setForm({...form, weight_kg: e.target.value})} />
              </div>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="w-full bg-brand-blue text-white font-medium py-3.5 rounded-lg mt-2 hover:bg-[#0D4FB5] transition">
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

with open('frontend/src/pages/Login.jsx', 'w') as f:
    f.write(login_code)
    
with open('frontend/src/pages/Register.jsx', 'w') as f:
    f.write(register_code)

print("Auth pages rewritten!")
