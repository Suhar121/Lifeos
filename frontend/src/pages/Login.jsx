import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Activity, ShieldCheck, Lock, Mail, Eye, EyeOff, Shield, HeartPulse } from 'lucide-react';
import { subscribeToPush } from '../services/pushNotifications';

export const AuthLayout = ({ children, title, subtitle }) => (
  <div className="flex min-h-screen flex-col lg:flex-row bg-[#f6f8f8] dark:bg-[#102220] text-slate-900 dark:text-slate-100 font-sans">
    {/* Left Panel */}
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0d968b]/10">
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0d968b]/40 to-transparent"></div>
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAJBB0wqgOGYxhYmcIiqKd_bmoRJh3w28pyaGxx5kiYljjv-GI3SxOgBdOHD58JfmFJb5tpkrOwSdU8d6PIoao5Q1mh-gFNNpyc-oxAKfXsfpmAbScjWS_FLKcwA7-EnPbwAH3m-mOiYWUJ6ADWsRu0kCrJ6zVTsC38vM-jmZ_HvzEmKa2NcHVU_PC-knzjooiYS9qW3fS2lSx5trLhNp4aAmi6rBAUka1DaipXIWOuO1mh4FsLNcTWnsLX8UXlviArYZheJ2zh49aa')" }}></div>
      <div className="relative z-20 flex flex-col justify-end p-20 w-full text-white">
        <div className="mb-6 flex items-center gap-3">
          <Activity className="w-10 h-10" />
          <h1 className="text-3xl font-bold tracking-tight">LifeOS</h1>
        </div>
        <blockquote className="text-2xl font-light leading-relaxed max-w-md">
            "Empowering clinical excellence through secure, intelligent health management systems."
        </blockquote>
        <div className="mt-8 flex gap-6 opacity-80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-semibold">HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-semibold">SSL Encrypted</span>
          </div>
        </div>
      </div>
    </div>

    {/* Right Panel */}
    <div 
      className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-24 bg-white dark:bg-[#102220]" 
      style={{ background: 'linear-gradient(135deg, rgba(13, 150, 139, 0.05) 0%, rgba(255, 255, 255, 0) 100%)' }}
    >
      <div className="mx-auto w-full max-w-md">
        <div className="lg:hidden mb-12 flex items-center gap-2 text-[#0d968b]">
          <Activity className="w-8 h-8 font-bold" />
          <span className="text-xl font-black tracking-tight uppercase">LifeOS</span>
        </div>
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {title}
          </h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">
              {subtitle}
          </p>
        </div>
        
        {children}

        {/* Footer info inside right panel */}
        <div className="mt-12 flex justify-center gap-8 border-t border-slate-100 dark:border-slate-800 pt-8">
          <div className="flex flex-col items-center gap-1">
            <HeartPulse className="text-[#0d968b] w-6 h-6" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">HIPAA SECURE</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Shield className="text-[#0d968b] w-6 h-6" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">AES-256 BIT</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Activity className="text-[#0d968b] w-6 h-6" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">CLINICAL GRADE</span>
          </div>
        </div>
      </div>
      
      <footer className="mt-auto pt-12 text-center text-xs text-slate-400 font-medium">
        <p>© 2024 LifeOS Medical Systems. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <a href="#" className="hover:text-[#0d968b]">System Status</a>
          <a href="#" className="hover:text-[#0d968b]">Privacy Protocol</a>
          <a href="#" className="hover:text-[#0d968b]">Security Audit</a>
        </div>
      </footer>
    </div>
  </div>
);

export const FloatingInput = ({ label, type, name, value, onChange, required, min, autoComplete, icon: Icon, placeholder, iconRight: IconRight, onIconRightClick }) => (
  <div className="mb-5">
    {label && <label htmlFor={name} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{label}</label>}
    <div className="relative group flex-1">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0d968b] transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input 
        type={type} name={name} id={name} value={value} onChange={onChange} required={required} min={min} autoComplete={autoComplete}
        placeholder={placeholder}
        className={`block w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-4 ${Icon ? 'pl-11' : 'pl-4'} ${IconRight ? 'pr-12' : 'pr-4'} text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#0d968b] focus:ring-1 focus:ring-[#0d968b] transition-all text-sm`}
      />
      {IconRight && (
        <button type="button" onClick={onIconRightClick} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <IconRight className="w-5 h-5" />
        </button>
      )}
    </div>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <AuthLayout title="Clinical Portal Access" subtitle="Please authenticate to enter the clinical environment.">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm border border-red-200">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <FloatingInput 
          name="email" 
          label="Professional Email Address" 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          autoComplete="email" 
          icon={Mail}
          placeholder="dr.smith@hospital.org"
        />
        
        <div className="relative mb-5">
           <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Secure Password</label>
            <a href="#" className="text-xs font-bold text-[#0d968b] hover:text-[#0d968b]/80 transition-colors uppercase tracking-wider">Forgot Access?</a>
           </div>
           <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0d968b] transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input 
              type={showPassword ? 'text' : 'password'} 
              name="password" 
              id="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              autoComplete="current-password"
              placeholder="••••••••••••"
              className="block w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-4 pl-11 pr-12 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#0d968b] focus:ring-1 focus:ring-[#0d968b] transition-all text-sm"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
           </div>
        </div>

        <div className="flex items-center">
            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#0d968b] focus:ring-[#0d968b]" />
            <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-slate-600 dark:text-slate-400">
                Trust this clinical workstation for 12 hours
            </label>
        </div>

        <div>
            <button type="submit" disabled={loading} className="flex w-full justify-center items-center gap-2 rounded-xl bg-[#0d968b] px-4 py-4 text-sm font-bold text-white shadow-lg shadow-[#0d968b]/20 hover:bg-[#0d968b]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d968b] transition-all uppercase tracking-widest disabled:opacity-50 cursor-pointer">
                <ShieldCheck className="w-5 h-5" />
                {loading ? 'Authenticating...' : 'Authenticate Session'}
            </button>
        </div>
      </form>

      <div className="mt-10">
          <div className="relative">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-sm font-medium">
                  <span className="bg-white dark:bg-[#102220] px-4 text-slate-500">New Practitioner?</span>
              </div>
          </div>
          <div className="mt-6">
              <Link to="/register" className="flex w-full justify-center items-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-widest">
                  Request System Access
              </Link>
          </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
