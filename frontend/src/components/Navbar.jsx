import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, CalendarPlus, Activity, ShieldPlus, UserCircle, Menu, LogOut, PieChart, ClipboardList } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

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
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50
        bg-white dark:bg-[#141418]
        border-t border-theme-border dark:border-[#27272a]
        shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
        <div className="flex justify-around items-center h-16 px-2">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <NavLink key={link.to} to={link.to}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition text-xs font-medium
                  ${isActive
                    ? 'text-[#0d968b] dark:text-blue-400'
                    : 'text-theme-muted hover:text-theme-text'}`}>
                {React.cloneElement(link.icon, {
                  className: isActive ? 'text-[#0d968b] dark:text-blue-400' : 'text-theme-muted'
                })}
                <span>{link.label}</span>
              </NavLink>
            );
          })}
          {/* Theme toggle as last tab */}
          <ThemeToggle compact />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64
        bg-white dark:bg-[#141418]
        border-r border-[#E2E8F0] dark:border-[#27272a]
        fixed h-full top-0 left-0 z-40">
        <div className="flex items-center gap-3 px-8 py-8 mb-4">
          <Activity size={26} className="text-[#0d968b] dark:text-blue-500" />
          <span className="font-semibold text-xl tracking-tight text-[#0F172A] dark:text-white">LifeOS</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                  ${isActive
                    ? 'bg-teal-50 dark:bg-blue-500/10 text-[#0d968b] dark:text-blue-400 border-l-4 border-[#0d968b] dark:border-blue-500'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-white/5'}`}
              >
                {link.icon} {link.label}
              </NavLink>
            );
          })}

          <div className="pt-8 mb-2 px-4">
            <span className="text-xs font-semibold text-[#94A3B8] dark:text-slate-600 uppercase tracking-wider">Additional</span>
          </div>
          <NavLink to="/habits"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
              ${isActive
                ? 'bg-teal-50 dark:bg-blue-500/10 text-[#0d968b] dark:text-blue-400 border-l-4 border-[#0d968b] dark:border-blue-500'
                : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-white/5'}`}
          >
            <PieChart size={20} /> Protocols
          </NavLink>
          <NavLink to="/report"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
              ${isActive
                ? 'bg-teal-50 dark:bg-blue-500/10 text-[#0d968b] dark:text-blue-400 border-l-4 border-[#0d968b] dark:border-blue-500'
                : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-white/5'}`}
          >
            <ClipboardList size={20} /> Weekly Report
          </NavLink>
        </nav>

        <div className="px-4 pb-4 border-t border-[#E2E8F0] dark:border-[#27272a] mt-auto pt-3 space-y-1">
          {/* Theme toggle pill */}
          <ThemeToggle />
          {/* Sign out */}
          <button
            onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-medium text-sm
              text-[#DC2626] dark:text-red-500
              hover:bg-red-50 dark:hover:bg-red-500/10 transition">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
