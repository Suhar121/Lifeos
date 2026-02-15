import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, BarChart2, CheckSquare, Sparkles, LogOut, PlusCircle, Calendar, FileBarChart } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm ${
          isActive 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
            : 'text-gray-400 hover:text-white hover:bg-neutral-800'
        }`}
      >
        <Icon size={18} />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  const MobileNavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex flex-col items-center justify-center space-y-1.5 px-4 py-1 transition-all relative ${
          isActive ? 'text-indigo-400 font-semibold scale-110' : 'text-gray-500 hover:text-white'
        }`}
      >
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] uppercase tracking-wider font-bold">{label}</span>
        {isActive && (
          <div className="absolute -top-1 w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
        )}
      </Link>
    );
  };

  return (
    <>
      <nav className="bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 text-white font-bold text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Activity size={20} className="text-white" />
                </div>
                <span className="tracking-tight">LifeOS</span>
                <span className="text-[10px] font-normal text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">v2</span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              <NavItem to="/" icon={BarChart2} label="Dashboard" />
              <NavItem to="/check-in" icon={PlusCircle} label="Daily Log" />
              <NavItem to="/habits" icon={CheckSquare} label="Habits" />
              <NavItem to="/calendar" icon={Calendar} label="Calendar" />
              <NavItem to="/report" icon={FileBarChart} label="Report" />
              <NavItem to="/insights" icon={Sparkles} label="AI" />
            </div>

            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white hover:bg-neutral-800 p-2 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-700/50 rounded-2xl px-2 py-3 shadow-2xl shadow-black/50 flex items-center justify-around">
          <MobileNavItem to="/" icon={BarChart2} label="Dash" />
          <MobileNavItem to="/check-in" icon={PlusCircle} label="Log" />
          <MobileNavItem to="/habits" icon={CheckSquare} label="Habits" />
          <MobileNavItem to="/calendar" icon={Calendar} label="Cal" />
          <MobileNavItem to="/report" icon={FileBarChart} label="Report" />
        </div>
      </div>
    </>
  );
};

export default Navbar;
