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

  return (
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
  );
};

export default Navbar;
