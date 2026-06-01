import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  const PALETTES = {
    primary: {
      gradient: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 100%)',
      border:   'rgba(99,102,241,0.25)',
      glow:     'rgba(99,102,241,0.2)',
      iconBg:   'rgba(99,102,241,0.15)',
      iconColor:'#a78bfa',
      bar:      'linear-gradient(90deg, #6366f1, #8b5cf6)',
    },
    success: {
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.15) 100%)',
      border:   'rgba(16,185,129,0.25)',
      glow:     'rgba(16,185,129,0.15)',
      iconBg:   'rgba(16,185,129,0.12)',
      iconColor:'#34d399',
      bar:      'linear-gradient(90deg, #10b981, #34d399)',
    },
    warning: {
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(234,88,12,0.15) 100%)',
      border:   'rgba(245,158,11,0.25)',
      glow:     'rgba(245,158,11,0.15)',
      iconBg:   'rgba(245,158,11,0.12)',
      iconColor:'#fbbf24',
      bar:      'linear-gradient(90deg, #f59e0b, #fb923c)',
    },
    info: {
      gradient: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(6,182,212,0.15) 100%)',
      border:   'rgba(59,130,246,0.25)',
      glow:     'rgba(59,130,246,0.15)',
      iconBg:   'rgba(59,130,246,0.12)',
      iconColor:'#60a5fa',
      bar:      'linear-gradient(90deg, #3b82f6, #22d3ee)',
    },
  };

  const p = PALETTES[color] || PALETTES.primary;

  return (
    <div
      className="card-hover rounded-2xl p-5 cursor-default relative overflow-hidden"
      style={{
        background: p.gradient,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${p.border}`,
        boxShadow: `var(--clay-shadow-sm), 0 0 24px ${p.glow}`,
      }}
    >
      {/* Subtle inner top highlight */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{background: 'linear-gradient(180deg, var(--glass-bg) 0%, transparent 40%)'}} />

      <div className="flex items-start justify-between mb-4">
        <p className="text-theme-muted text-xs font-semibold uppercase tracking-widest">{title}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{background: p.iconBg, border: `1px solid ${p.border}`}}>
            <Icon size={16} style={{color: p.iconColor}} />
          </div>
        )}
      </div>

      <div className="mt-1">
        <span className="text-3xl font-extrabold text-theme-text tracking-tight">{value}</span>
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-xs font-semibold ${trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend}
            </span>
            <span className="text-slate-500 text-xs">vs last week</span>
          </div>
        )}
      </div>

      {/* Bottom accent bar */}
      <div className="mt-4 h-1 rounded-full opacity-70" style={{background: p.bar}} />
    </div>
  );
};

export default StatCard;
