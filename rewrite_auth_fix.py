import os

login_code = """import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Activity, ShieldCheck } from 'lucide-react';
import { subscribeToPush } from '../services/pushNotifications';

export const AuthLayout = ({ children, title, subtitle }) => (
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

export const FloatingInput = ({ label, type, name, value, onChange, required, min, autoComplete }) => (
  <div className="relative mb-5 group flex-1">
    <input 
      type={type} name={name} id={name} value={value} onChange={onChange} required={required} min={min} autoComplete={autoComplete}
      placeholder=" " /* space trigger placeholder-shown */
      className="block w-full px-4 pt-6 pb-2 text-sm text-theme-text bg-transparent border border-[#E5E9F2] dark:border-[#243052] rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-brand-blue peer"
    />
    <label htmlFor={name} className="absolute text-sm text-theme-muted duration-200 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-brand-blue pointer-events-none cursor-text">
      {label}
    </label>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        subscribeToPush().catch(() => {});
        navigate('/');
      } else {
        setError('Login failed, no token received.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign In" subtitle="Log in to access your health data.">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm border border-red-200">{error}</div>}
      <form onSubmit={handleSubmit}>
        <FloatingInput name="email" label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        <FloatingInput name="password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
        
        <button type="submit" disabled={loading} className="w-full bg-brand-blue text-white font-medium py-3.5 rounded-lg mt-4 hover:bg-[#0D4FB5] transition cursor-pointer disabled:opacity-50">
          {loading ? 'Signing In...' : 'Sign In'}
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

with open('frontend/src/pages/Login.jsx', 'w') as f:
    f.write(login_code)

print("Login page updated.")
