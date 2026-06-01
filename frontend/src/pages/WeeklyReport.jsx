import React, { useState, useEffect } from 'react';
import { BarChart2, Brain, ShieldCheck, BarChart, RefreshCw, Printer, TrendingUp, TrendingDown, Activity, Minus } from 'lucide-react';
import api from '../services/api';

const WeeklyReport = () => {
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports/weekly-report');
      setReport(data);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/reports/weekly-report');
      setReport(data);
    } catch {
      alert('Failed to generate report. Please ensure you have health logs for this week.');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#f8f6f6] dark:bg-[#102220]">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-[#0d968b]" />
          <p className="text-sm font-semibold">Loading clinical data…</p>
        </div>
      </div>
    );
  }

  // ── Report content renderer ──
  const rd = report?.report_data || {};

  const weekStart = report?.week_start
    ? new Date(report.week_start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8f6f6] dark:bg-[#102220]">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-16">
        <div className="w-full max-w-4xl flex flex-col gap-10">

          {/* ── Page Title Row ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-8">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Weekly Report</h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                {report ? `Analysis for the week of ${weekStart}` : 'Detailed analysis of your health metrics and performance trends.'}
              </p>
            </div>
            {report && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  onClick={generateReport}
                  disabled={generating}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                  {generating ? 'Regenerating…' : 'Regenerate'}
                </button>
              </div>
            )}
          </div>

          {/* ════ EMPTY STATE ════ */}
          {!report && (
            <>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-20 shadow-sm flex flex-col items-center text-center">
                {/* Icon */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-[#0d968b]/10 dark:bg-[#0d968b]/20 blur-3xl rounded-full" />
                  <div className="relative flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700">
                    <BarChart2 className="w-12 h-12 md:w-16 md:h-16 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <RefreshCw className="w-5 h-5 text-[#0d968b]" />
                  </div>
                </div>

                {/* Text */}
                <div className="max-w-md space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">No Weekly Report Available</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                    Start tracking your health data to unlock deep insights. Generate your first AI-powered analysis to see your performance trends and clinical observations.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <button
                    onClick={generateReport}
                    disabled={generating}
                    className="flex min-w-[200px] items-center justify-center gap-2 rounded-xl h-12 px-8 bg-[#0d968b] hover:bg-[#0b857b] text-white text-base font-bold shadow-xl shadow-[#0d968b]/20 transition-all disabled:opacity-60"
                  >
                    {generating
                      ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating…</>
                      : 'Generate Report'}
                  </button>
                  <button
                    className="flex min-w-[200px] items-center justify-center rounded-xl h-12 px-8 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-base font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                  >
                    Learn More
                  </button>
                </div>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-sm">
                  <BarChart className="w-8 h-8 text-[#0d968b]" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Trend Tracking</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Monitor sleep, heart rate, and activity levels over time.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-sm">
                  <Brain className="w-8 h-8 text-indigo-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">AI Analysis</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Deep neural networks scan your data for medical-grade patterns.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-sm">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Clinical Accuracy</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Validated benchmarks for professional health reporting.</p>
                </div>
              </div>
            </>
          )}

          {/* ════ REPORT CONTENT ════ */}
          {report && (
            <div className="space-y-6">

              {/* Summary card */}
              {rd.summary && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-5 h-5 text-[#0d968b]" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Executive Summary</h2>
                  </div>
                  <div className="bg-[#0d968b]/5 border-l-4 border-[#0d968b] p-5 rounded-r-xl">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{rd.summary}</p>
                  </div>
                </div>
              )}

              {/* Biometric stats */}
              {(rd.avg_weight || rd.avg_heart_rate || rd.avg_sleep) && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#0d968b]" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Biometric Stability</span>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {rd.avg_weight && (
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Avg Body Wt.</p>
                        <p className="font-mono text-2xl text-slate-900 dark:text-white">{rd.avg_weight} <span className="text-sm text-slate-400">kg</span></p>
                      </div>
                    )}
                    {rd.avg_heart_rate && (
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Resting Heart</p>
                        <p className="font-mono text-2xl text-slate-900 dark:text-white">{rd.avg_heart_rate} <span className="text-sm text-slate-400">bpm</span></p>
                      </div>
                    )}
                    {rd.avg_sleep && (
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Sleep Mean</p>
                        <p className="font-mono text-2xl text-slate-900 dark:text-white">{rd.avg_sleep}h</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mood & scores grid */}
              {(rd.avg_mood !== undefined || rd.avg_energy !== undefined || rd.avg_focus !== undefined || rd.avg_productivity !== undefined) && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mental & Energy Metrics</span>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Mood', val: rd.avg_mood },
                      { label: 'Energy', val: rd.avg_energy },
                      { label: 'Focus', val: rd.avg_focus },
                      { label: 'Productivity', val: rd.avg_productivity },
                    ].filter(x => x.val !== undefined).map(({ label, val }) => (
                      <div key={label}>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">{label}</p>
                        <p className="font-mono text-2xl text-slate-900 dark:text-white">{val}<span className="text-sm text-slate-400">/10</span></p>
                        <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-[#0d968b] rounded-full" style={{ width: `${(val / 10) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights & recommendations */}
              {rd.insights && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trend Analysis</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{rd.insights}</p>
                </div>
              )}

              {rd.recommendations && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Clinical Recommendations</h2>
                  </div>
                  {Array.isArray(rd.recommendations) ? (
                    <ul className="space-y-3">
                      {rd.recommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{r}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{rd.recommendations}</p>
                  )}
                </div>
              )}

              {/* Raw data fallback: any other keys */}
              {Object.keys(rd).filter(k => !['summary','insights','recommendations','avg_weight','avg_heart_rate','avg_sleep','avg_mood','avg_energy','avg_focus','avg_productivity'].includes(k)).length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart2 className="w-5 h-5 text-[#0d968b]" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Additional Data</h2>
                  </div>
                  <pre className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(Object.fromEntries(
                      Object.entries(rd).filter(([k]) => !['summary','insights','recommendations','avg_weight','avg_heart_rate','avg_sleep','avg_mood','avg_energy','avg_focus','avg_productivity'].includes(k))
                    ), null, 2)}
                  </pre>
                </div>
              )}

              {/* End of report */}
              <div className="pt-4 pb-2">
                <p className="text-xs font-mono text-slate-400 text-center uppercase tracking-widest">End of Report Document</p>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="mt-auto px-6 md:px-20 py-8 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#0d968b] rounded-md flex items-center justify-center">
              <Activity className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">LifeOS Systems v2.4</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-slate-500 hover:text-[#0d968b] underline decoration-slate-300 underline-offset-4 transition-colors">Privacy Protocol</a>
            <a href="#" className="text-xs text-slate-500 hover:text-[#0d968b] underline decoration-slate-300 underline-offset-4 transition-colors">Clinician Portal</a>
            <a href="#" className="text-xs text-slate-500 hover:text-[#0d968b] underline decoration-slate-300 underline-offset-4 transition-colors">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WeeklyReport;
