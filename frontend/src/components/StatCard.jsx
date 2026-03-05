import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, color = "primary" }) => {
  const colorClasses = {
    primary: "from-indigo-500 to-purple-600",
    success: "from-green-400 to-emerald-600",
    warning: "from-amber-400 to-orange-600",
    info: "from-blue-400 to-cyan-600"
  };

  return (
    <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700 card-hover shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
        {Icon && <Icon size={20} className="text-gray-500" />}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className="text-3xl font-bold text-white block">{value}</span>
          {trend && (
            <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'} mt-1 block`}>
              {trend} vs last week
            </span>
          )}
        </div>
        <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${colorClasses[color]} opacity-80`}></div>
      </div>
    </div>
  );
};

export default StatCard;
