import os

navbar_code = """import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, BarChart2, CheckSquare, Sparkles, PlusCircle, Calendar, FileBarChart, HeartPulse, Users, UserCircle, Menu, X, Settings } from 'lucide-react';
import ThemeToggle from "./ThemeToggle";
import api from '../services/api';

const Navbar = () => {
  const location = useLocation();
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [userName, setUserName] = useState('');
  const [lifeScore, setLifeScore] = useState(null);
  const [showMoreSheet, setShowMoreSheet] = useState(false);

  useEffect(() => {
    api.get('/profile/').then(({ data }) => {
      setProfilePhoto(data.profile_photo_url);
      setUserName(data.name || '');
    }).catch(() => {});
    
    api.get('/life-score/weekly').then(({ data }) => {
      setLifeScore(data.average_score);
    }).catch(() => {});
  }, []);

  const getPhotoUrl = () => {
    if (!profilePhoto) return null;
    const base = api.defaults.baseURL || '';
    return `${base}${profilePhoto}`;
  };

  const SidebarItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
          isActive 
            ? 'text-brand-blue bg-blue-50/50 dark:bg-blue-900/20 border-l-[3px] border-brand-blue'
            : 'text-theme-muted hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-[3px] border-transparent'
        }`}
      >
        <Icon size={18} className={isActive ? 'text-brand-blue' : 'text-gray-400'} />
        <span>{label}</span>
      </Link>
    );
  };

  const MobileNavItem = ({ to, icon: Icon, label, onClick }) => {
    const isActive = location.pathname === to;
    
    if (onClick) {
      return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 ${isActive ? 'text-brand-blue' : 'text-gray-500'}`}>
          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-brand-blue' : 'text-gray-400'} />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      );
    }
    
    return (
      <Link to={to} className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 ${isActive ? 'text-brand-blue' : 'text-gray-500'}`}>
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-brand-blue' : 'text-gray-400'} />
        <span className="text-[10px] font-medium">{label}</span>
      </Link>
    );
  };

  const renderPhoto = () => {
    const url = getPhotoUrl();
    if (url) return <img src={url} alt="Profile" className="w-full h-full object-cover rounded-full" />;
    if (userName) return <span className="text-sm font-bold text-white bg-brand-blue w-full h-full flex items-center justify-center rounded-full">{userName.charAt(0).toUpperCase()}</span>;
    return <UserCircle size={32} className="text-gray-400" />;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 bg-white dark:bg-[#141C2E] border-r border-[#E5E9F2] dark:border-[#243052] z-40">
        <div className="p-5 flex items-center space-x-2">
          <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center bg-brand-blue">
             <Activity size={18} className="text-white" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-theme-text">LifeOS</span>
          <span className="text-[9px] bg-blue-100 text-brand-blue px-1.5 py-0.5 rounded uppercase font-bold">Pro</span>
        </div>

        <div className="px-5 mb-4">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E8EDF5] dark:border-[#243052] bg-[#F7F9FC] dark:bg-[#1A2540]">
            <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0">
              {renderPhoto()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-theme-text truncate">{userName || 'User'}</p>
              <p className="text-xs text-theme-muted">Score: <span className="font-mono font-medium text-brand-blue">{lifeScore || '--'}</span></p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          
          <div>
            <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Overview</p>
            <div className="space-y-1">
              <SidebarItem to="/" icon={BarChart2} label="Dashboard" />
              <SidebarItem to="/report" icon={FileBarChart} label="Weekly Report" />
            </div>
          </div>

          <div>
            <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Daily</p>
            <div className="space-y-1">
              <SidebarItem to="/check-in" icon={PlusCircle} label="Check-In" />
              <SidebarItem to="/habits" icon={CheckSquare} label="Habits" />
            </div>
          </div>

          <div>
            <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Health Data</p>
            <div className="space-y-1">
              <SidebarItem to="/health" icon={HeartPulse} label="Vitals" />
              <SidebarItem to="/calendar" icon={Calendar} label="Calendar" />
            </div>
          </div>

          <div>
            <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Care</p>
            <div className="space-y-1">
              <SidebarItem to="/insights" icon={Sparkles} label="AI Insights" />
              <SidebarItem to="/care" icon={Users} label="Care Network" />
            </div>
          </div>

          <div>
            <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2">Account</p>
            <div className="space-y-1">
              <SidebarItem to="/profile" icon={UserCircle} label="Profile" />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#E5E9F2] dark:border-[#243052] flex items-center justify-between">
          <ThemeToggle />
          <p className="text-xs text-gray-400">v2.0 • Precise Care</p>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-[#141C2E] border-t border-[#E8EDF5] dark:border-[#243052] z-50 pb-safe">
        <div className="flex items-center justify-between px-2">
          <MobileNavItem to="/" icon={BarChart2} label="Home" />
          <MobileNavItem to="/check-in" icon={PlusCircle} label="Log" />
          <MobileNavItem to="/health" icon={HeartPulse} label="Vitals" />
          <MobileNavItem to="/habits" icon={CheckSquare} label="Habits" />
          <MobileNavItem to="#" icon={Menu} label="More" onClick={() => setShowMoreSheet(true)} />
        </div>
      </div>

      {/* Mobile More Sheet */}
      {showMoreSheet && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex flex-col justify-end" onClick={() => setShowMoreSheet(false)}>
          <div className="bg-white dark:bg-[#141C2E] rounded-t-2xl p-6 pb-12 w-full animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
            <h3 className="font-heading text-lg font-bold mb-4 text-theme-text">More Pages</h3>
            <div className="grid grid-cols-3 gap-6">
              <MobileNavItem to="/calendar" icon={Calendar} label="Calendar" />
              <MobileNavItem to="/report" icon={FileBarChart} label="Report" />
              <MobileNavItem to="/insights" icon={Sparkles} label="AI Insights" />
              <MobileNavItem to="/care" icon={Users} label="Care" />
              <MobileNavItem to="/profile" icon={UserCircle} label="Profile" />
            </div>
            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
               <ThemeToggle />
               <button onClick={() => setShowMoreSheet(false)} className="text-sm font-medium text-gray-500">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
"""

with open('frontend/src/components/Navbar.jsx', 'w') as f:
    f.write(navbar_code)

print("Navbar converted to Sidebar!")
