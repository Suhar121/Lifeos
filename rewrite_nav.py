import os

code = """import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, CalendarPlus, Activity, ShieldPlus, UserCircle, Menu, LogOut, ChartPie } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const links = [
    { to: '/', icon: <Home size={20} />, label: 'Home' },
    { to: '/check-in', icon: <CalendarPlus size={20} />, label: 'Log' },
    { to: '/health', icon: <Activity size={20} />, label: 'Vitals' },
    { to: '/care', icon: <ShieldPlus size={20} />, label: 'Care' },
    { to: '/profile', icon: <UserCircle size={20} />, label: 'Profile' },
  ];

  return (
    <>
      {/* Mobile Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white border-t border-theme-border shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex justify-around items-center h-16 px-2">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <NavLink key={link.to} to={link.to} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition text-xs font-medium ${isActive ? 'text-brand-teal' : 'text-theme-muted hover:text-theme-text'}`}>
                {React.cloneElement(link.icon, { className: isActive ? 'text-brand-teal' : 'text-theme-muted' })}
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E2E8F0] fixed h-full top-0 left-0 z-40">
        <div className="flex items-center gap-3 px-8 py-8 mb-4">
          <Activity size={26} className="text-brand-teal" />
          <span className="font-semibold text-xl tracking-tight text-[#0F172A]">LifeOS</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <NavLink 
                key={link.to} 
                to={link.to} 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${isActive ? 'bg-teal-50 text-brand-teal border-l-4 border-brand-teal' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'}`}
              >
                {link.icon} {link.label}
              </NavLink>
            );
          })}
          
          <div className="pt-8 mb-2 px-4">
             <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Additional</span>
          </div>
          <NavLink to="/habits" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${isActive ? 'bg-teal-50 text-brand-teal border-l-4 border-brand-teal' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'}`}>
            <ChartPie size={20}/> Protocols
          </NavLink>
        </nav>

        <div className="p-4 border-t border-[#E2E8F0] mt-auto">
          <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-medium text-sm text-[#DC2626] hover:bg-red-50 transition">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
"""

with open('frontend/src/components/Navbar.jsx', 'w') as f:
    f.write(code)

print("Navbar rewritten!")
