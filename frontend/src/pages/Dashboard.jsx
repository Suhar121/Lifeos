import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import {
  Download, Share2, Search, Bell, Settings, TrendingUp, TrendingDown,
  Heart, BedDouble, Footprints, Droplets, Info, AlertTriangle, Activity,
  ArrowRight, ChevronRight
} from 'lucide-react';

// ── Life Score Ring ──────────────────────────────────────────────────────────
const LifeScoreRing = ({ score }) => {
  const r = 88;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 224, height: 224 }}>
      <svg className="size-full -rotate-90" viewBox="0 0 224 224">
        {/* light: slate track / dark: slate-800 track */}
        <circle cx="112" cy="112" r={r} fill="transparent"
          stroke="currentColor" strokeWidth="6"
          className="text-slate-100 dark:text-slate-800" />
        {/* light: teal / dark: blue with glow */}
        <circle cx="112" cy="112" r={r} fill="transparent"
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out text-[#0d968b] dark:text-blue-500"
          stroke="currentColor"
          style={{ filter: 'var(--ring-glow, none)' }}
        />
      </svg>
      {/* Override glow in dark via CSS var trick */}
      <style>{`.dark svg circle.text-blue-500 { filter: drop-shadow(0 0 8px rgba(59,130,246,0.45)); }`}</style>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-5xl dark:text-6xl font-black text-slate-900 dark:text-white leading-none"
          style={{ textShadow: 'var(--score-glow, none)' }}>
          {score}
        </span>
        <style>{`.dark .score-label { text-shadow: 0 0 15px rgba(59,130,246,0.5); }`}</style>
        <span className="score-label text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">
          Life Performance
        </span>
      </div>
    </div>
  );
};

// ── Weekly Bar Chart ─────────────────────────────────────────────────────────
const WeeklyBars = ({ dailyScores }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const max = Math.max(...dailyScores.map(s => s.score), 1);
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;

  return (
    <div className="flex items-end justify-between h-32 gap-3 w-full">
      {dailyScores.map((s, i) => {
        const pct = max > 0 ? (s.score / max) * 100 : 0;
        const isToday = i === todayIdx;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-3">
            <div
              className={`w-full rounded-md relative overflow-hidden border
                ${isToday
                  ? 'bg-blue-500/10 dark:bg-blue-500/10 border-blue-500/30 dark:border-blue-500/30'
                  : 'bg-slate-100 dark:bg-slate-800/50 border-transparent dark:border-white/5'}`}
              style={{ height: `${Math.max(pct, 4)}%` }}
            >
              <div className={`absolute inset-x-0 bottom-0 h-full rounded-md
                ${isToday
                  ? 'bg-[#0d968b] dark:bg-blue-500'
                  : 'bg-[#0d968b]/40 dark:bg-blue-500/20'}`}
                style={isToday ? { boxShadow: '0 0 15px rgba(59,130,246,0.4)' } : undefined}
              />
            </div>
            <span className={`text-[9px] font-bold uppercase
              ${isToday
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-400 dark:text-slate-600'}`}>
              {days[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ── Stat Card ────────────────────────────────────────────────────────────────
// light: clean white card / dark: executive panel with hover border accent
const StatCard = ({ icon, label, value, unit, delta, deltaBadgeClass, iconBg, hoverBorder }) => (
  <div className={`bg-white dark:bg-[#141418] p-6 rounded-2xl border border-slate-200 dark:border-[#27272a]
    shadow-sm dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]
    flex flex-col justify-between gap-4 transition-all cursor-pointer
    ${hoverBorder || 'dark:hover:border-blue-500/30'}`}>
    <div className="flex justify-between items-start">
      <div className={`size-10 rounded-lg flex items-center justify-center border ${iconBg}`}>
        {icon}
      </div>
      {delta && (
        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${deltaBadgeClass}`}>
          {delta}
        </span>
      )}
    </div>
    <div>
      <p className="text-slate-500 text-[10px] dark:text-slate-500 font-bold uppercase tracking-widest">{label}</p>
      <h5 className="text-2xl dark:text-3xl font-black text-slate-900 dark:text-white mt-1">
        {value}{unit && <span className="text-sm font-bold text-slate-400 dark:text-slate-600 ml-1 tracking-normal">{unit}</span>}
      </h5>
    </div>
  </div>
);

// ── Insight Row ──────────────────────────────────────────────────────────────
const InsightRow = ({ iconEl, iconBg, title, badge, body, date }) => (
  <div className="px-6 md:px-8 lg:px-10 py-6 flex items-center gap-6 md:gap-8
    hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group">
    <div className={`size-12 dark:size-14 rounded-full dark:rounded-xl flex items-center justify-center
      flex-shrink-0 border transition-all ${iconBg}`}>
      {iconEl}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3 flex-wrap">
        <p className="font-bold text-slate-900 dark:text-white dark:text-lg">{title}</p>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border hidden sm:inline ${badge.cls}`}>
            {badge.label}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed max-w-3xl">{body}</p>
    </div>
    <div className="text-right flex-shrink-0 hidden sm:flex flex-col items-end gap-2">
      <p className="text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{date}</p>
      <ChevronRight size={14} className="text-slate-300 dark:text-slate-700" />
    </div>
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [latestLog, setLatestLog] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, scoreRes, logsRes, insightsRes] = await Promise.allSettled([
          api.get('/profile/me'),
          api.get('/life-score/weekly'),
          api.get('/daily-logs/?limit=7'),
          api.get('/ai/insights'),
        ]);
        if (profileRes.status === 'fulfilled') setUser(profileRes.value.data);
        if (scoreRes.status === 'fulfilled') setScoreData(scoreRes.value.data);
        if (logsRes.status === 'fulfilled') {
          const logs = logsRes.value.data;
          if (logs?.length > 0) setLatestLog(logs[0]);
        }
        if (insightsRes.status === 'fulfilled') setInsights(insightsRes.value.data?.insights || []);
      } catch (_) {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || user?.username || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  const avgScore = scoreData?.average_score ?? 0;
  const dailyScores = scoreData?.daily_scores?.length === 7
    ? scoreData.daily_scores
    : Array(7).fill({ score: 0 });

  const firstHalf = dailyScores.slice(0, 3).reduce((s, d) => s + d.score, 0) / 3;
  const secondHalf = dailyScores.slice(4).reduce((s, d) => s + d.score, 0) / 3;
  const trendPct = firstHalf > 0 ? (((secondHalf - firstHalf) / firstHalf) * 100).toFixed(1) : null;
  const trendUp = trendPct !== null && parseFloat(trendPct) >= 0;

  const hr = latestLog?.heart_rate ?? null;
  const sleep = latestLog?.sleep_hours ?? null;
  const lastCheckin = latestLog
    ? (() => {
        const diff = Math.floor((Date.now() - new Date(latestLog.created_at).getTime()) / 3600000);
        return diff < 1 ? 'Just now' : diff < 24 ? `${diff}h ago` : `${Math.floor(diff / 24)}d ago`;
      })()
    : 'No logs yet';

  const displayInsights = insights.length > 0
    ? insights.slice(0, 3)
    : [
        {
          type: sleep != null && sleep < 6.5 ? 'warning' : 'positive',
          title: sleep != null && sleep < 6.5 ? 'Acute Sleep Deficit Alert' : 'Optimized Recovery Detected',
          body: sleep != null && sleep < 6.5
            ? `You logged ${sleep}h of sleep. Aim for 7–9 hours to stabilize neuro-restoration.`
            : 'HRV and recovery patterns show positive trends. Performance ceiling is currently elevated.',
          date: 'Today',
        },
        {
          type: 'info',
          title: 'Consistency Builds Results',
          body: 'Regular daily check-ins improve your Life Score accuracy and AI insight quality.',
          date: 'Ongoing',
        },
      ];

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-20 bg-slate-100 dark:bg-[#141418] rounded-2xl" />
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 h-80 bg-slate-100 dark:bg-[#141418] rounded-2xl" />
          <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-slate-100 dark:bg-[#141418] rounded-2xl" />)}
          </div>
          <div className="col-span-12 h-48 bg-slate-100 dark:bg-[#141418] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-[#0a0a0c] min-h-screen">

      {/* ── Sticky Header ─────────────────────────────── */}
      <header className="h-20 bg-white dark:bg-[#0a0a0c]/80 dark:backdrop-blur-md
        border-b border-slate-200 dark:border-[#27272a]
        flex items-center justify-between px-6 md:px-10 sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
            Good {greeting}, {firstName}
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500
              border border-slate-200 dark:border-[#27272a] px-2 py-0.5 rounded-full
              uppercase tracking-tighter hidden sm:inline">
              Premium Access
            </span>
          </h2>
          <div className="flex items-center gap-4 mt-1">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">
              <Activity size={12} />
              Last sync: {lastCheckin}
            </span>
            <span className="size-1 bg-slate-300 dark:bg-[#27272a] rounded-full hidden sm:block" />
            <Link to="/calendar" className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider hover:text-[#0d968b] dark:hover:text-blue-400 transition-colors hidden sm:flex">
              📅 View Calendar
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block group">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              className="bg-slate-100 dark:bg-[#141418] border border-transparent dark:border-[#27272a]
                rounded-lg pl-9 pr-4 py-2 text-xs w-64
                focus:outline-none focus:ring-1 focus:ring-[#0d968b]/50 dark:focus:ring-blue-500/50 dark:focus:border-blue-500/50
                text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
              placeholder="Query medical records…"
            />
          </div>
          <Link to="/check-in"
            className="size-10 flex items-center justify-center rounded-lg
              bg-slate-100 dark:bg-[#141418] border border-transparent dark:border-[#27272a]
              text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:hover:border-slate-600 transition-all"
            title="Daily Check-In">
            <Bell size={18} />
          </Link>
          <Link to="/profile"
            className="size-10 flex items-center justify-center rounded-lg
              bg-slate-100 dark:bg-[#141418] border border-transparent dark:border-[#27272a]
              text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:hover:border-slate-600 transition-all"
            title="Profile">
            <Settings size={18} />
          </Link>
        </div>
      </header>

      {/* ── Page Body ─────────────────────────────────── */}
      <div className="p-6 md:p-10 max-w-[1600px] mx-auto w-full">

        {/* Title row */}
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Health Summary</h3>
            <p className="text-slate-500 font-medium mt-2 text-sm max-w-lg">
              Advanced biometric telemetry and clinical analysis for your current performance cycle.
            </p>
          </div>
          {/* light: teal button / dark: white/black button */}
          <Link
            to="/report"
            className="flex items-center gap-2
              bg-[#0d968b] hover:bg-[#0b8279] text-white
              dark:bg-white dark:hover:bg-slate-200 dark:text-black
              px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-bold text-xs uppercase tracking-wider
              transition-all shadow-sm dark:shadow-xl dark:shadow-white/5"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">Export Bio-Report</span>
          </Link>
        </div>

        <div className="grid grid-cols-12 gap-6 md:gap-8">

          {/* ── Life Score Card ── */}
          <div className="col-span-12 lg:col-span-8
            bg-white dark:bg-[#141418] rounded-2xl
            border border-slate-200 dark:border-[#27272a]
            shadow-sm dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]
            p-8 md:p-10
            flex flex-col sm:flex-row items-center gap-8 md:gap-12
            dark:[background:linear-gradient(135deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0)_100%)]">

            <LifeScoreRing score={avgScore} />

            <div className="flex-1 space-y-6 w-full">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Performance Trend</h4>
                  {trendPct !== null ? (
                    <div className="flex items-center gap-2 mt-2">
                      {trendUp ? (
                        <span className="text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold text-xs flex items-center gap-1">
                          <TrendingUp size={12} />+{trendPct}%
                        </span>
                      ) : (
                        <span className="text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded font-bold text-xs flex items-center gap-1">
                          <TrendingDown size={12} />{trendPct}%
                        </span>
                      )}
                      <span className="text-slate-500 dark:text-slate-500 text-xs font-medium uppercase tracking-wider">vs Previous 7 Days</span>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm mt-1">Log daily to see trends</p>
                  )}
                </div>
              </div>
              <WeeklyBars dailyScores={dailyScores} />
            </div>
          </div>

          {/* ── 4 Stat Cards ── */}
          <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-4 md:gap-6">
            <StatCard
              icon={<Heart size={18} className="text-red-500" />}
              iconBg="bg-red-500/10 border-red-500/20 text-red-500"
              hoverBorder="dark:hover:border-red-500/30"
              label="Resting Heart"
              value={hr ?? '—'}
              unit={hr ? 'BPM' : null}
              delta={hr ? (hr > 90 ? '-3%' : hr < 55 ? '↓' : '+OK') : null}
              deltaBadgeClass={hr && (hr > 90 || hr < 55)
                ? 'text-red-500 bg-red-500/5 border-red-500/20'
                : 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20'}
            />
            <StatCard
              icon={<BedDouble size={18} className="text-indigo-400" />}
              iconBg="bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
              hoverBorder="dark:hover:border-indigo-500/30"
              label="Deep Sleep"
              value={sleep != null ? `${Math.floor(sleep)}h` : '—'}
              unit={sleep != null ? `${Math.round((sleep % 1) * 60)}m` : null}
              delta={sleep != null ? (sleep >= 7 ? '+5%' : '-Low') : null}
              deltaBadgeClass={sleep != null && sleep >= 7
                ? 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20'
                : 'text-red-500 bg-red-500/5 border-red-500/20'}
            />
            <StatCard
              icon={<Footprints size={18} className="text-blue-500" />}
              iconBg="bg-blue-500/10 border-blue-500/20 text-blue-500"
              hoverBorder="dark:hover:border-blue-500/30"
              label="Energy Level"
              value={latestLog?.energy ?? '—'}
              unit={latestLog?.energy != null ? '/ 10' : null}
              delta={latestLog?.energy != null ? (latestLog.energy >= 7 ? '+Hi' : latestLog.energy >= 4 ? 'Avg' : '-Low') : null}
              deltaBadgeClass={latestLog?.energy >= 7
                ? 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20'
                : 'text-red-500 bg-red-500/5 border-red-500/20'}
            />
            <StatCard
              icon={<Droplets size={18} className="text-cyan-400" />}
              iconBg="bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
              hoverBorder="dark:hover:border-cyan-500/30"
              label="Focus Level"
              value={latestLog?.focus ?? '—'}
              unit={latestLog?.focus != null ? '/ 10' : null}
              delta={latestLog?.focus != null ? 'STABLE' : null}
              deltaBadgeClass="text-slate-500 bg-slate-100 dark:bg-slate-800 border-transparent dark:border-0"
            />
          </div>

          {/* ── Clinical Insights ── */}
          <div className="col-span-12 bg-white dark:bg-[#141418] rounded-2xl
            border border-slate-200 dark:border-[#27272a]
            shadow-sm dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* panel header */}
            <div className="px-6 md:px-10 py-5 md:py-7
              border-b border-slate-100 dark:border-[#27272a]
              bg-transparent dark:bg-white/[0.03]
              flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info size={18} className="text-[#0d968b] dark:text-blue-500 hidden sm:block" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Recent Clinical Insights</h4>
              </div>
              <Link to="/insights"
                className="text-xs font-black text-[#0d968b] dark:text-blue-500 uppercase tracking-widest hover:underline dark:hover:text-white transition-colors">
                View Full Archive
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-[#27272a]">
              {displayInsights.map((ins, i) => {
                const isWarning = ins.type === 'warning';
                const isPositive = ins.type === 'positive';
                const isInfo = ins.type === 'info';
                const dateStr = ins.date || (ins.created_at
                  ? new Date(ins.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Today');

                const iconBg = isWarning
                  ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-500 dark:group-hover:bg-amber-500 dark:group-hover:text-black'
                  : isPositive
                  ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 dark:group-hover:bg-blue-500 dark:group-hover:text-white'
                  : 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 dark:group-hover:bg-blue-500 dark:group-hover:text-white';

                const badge = isWarning
                  ? { label: 'ATTENTION', cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20' }
                  : isPositive
                  ? { label: 'POSITIVE', cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' }
                  : { label: 'INFO', cls: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };

                return (
                  <InsightRow
                    key={i}
                    iconEl={isWarning
                      ? <AlertTriangle size={20} />
                      : <Info size={20} />}
                    iconBg={iconBg}
                    title={ins.title || ins.headline || 'Health Insight'}
                    badge={badge}
                    body={ins.body || ins.summary || ins.content || ''}
                    date={dateStr}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="mt-4 py-8 md:py-10 px-6 md:px-10
        border-t border-slate-200 dark:border-[#27272a]
        bg-transparent dark:bg-[#141418]/30">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <span className="size-2 bg-emerald-500 rounded-full animate-pulse"
              style={{ boxShadow: '0 0 8px #10b981' }} />
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.15em]">
              System Status: All encrypted channels secure &amp; HIPAA compliant
            </p>
          </div>
          <div className="flex gap-6 md:gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <Link to="/report" className="hover:text-[#0d968b] dark:hover:text-blue-400 transition-colors">Weekly Report</Link>
            <Link to="/health" className="hover:text-[#0d968b] dark:hover:text-blue-400 transition-colors">Health Records</Link>
            <Link to="/profile" className="hover:text-[#0d968b] dark:hover:text-blue-400 transition-colors">Profile</Link>
          </div>
          <p className="text-slate-400 dark:text-slate-600 text-[10px] font-medium uppercase tracking-wider">
            © {new Date().getFullYear()} LifeOS Clinical Systems.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
