import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Download, Share2, ChevronRight, Activity, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// ── Classify BP reading ──
const classifyBP = (sys, dia) => {
  if (!sys || !dia) return null;
  if (sys < 120 && dia < 80) return { label: 'Normal',            color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' };
  if (sys < 130 && dia < 80) return { label: 'Elevated',          color: 'amber',   bg: 'bg-amber-50',   text: 'text-amber-600',   dot: 'bg-amber-500'   };
  if (sys < 140 && dia < 90) return { label: 'Stage 1',           color: 'orange',  bg: 'bg-orange-50',  text: 'text-orange-600',  dot: 'bg-orange-500'  };
  return                             { label: 'Stage 2',           color: 'red',     bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-500'      };
};

const fmtDate = (d) => {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const fmtTime = (d) => {
  const dt = new Date(d);
  return dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// ── SVG chart from raw data ──
const BPChart = ({ logs }) => {
  const W = 1000, H = 300;
  const PAD_T = 10, PAD_B = 40, PAD_L = 10, PAD_R = 10;
  const chartH = H - PAD_T - PAD_B;
  const chartW = W - PAD_L - PAD_R;

  const bpLogs = useMemo(() => logs.filter(l => l.bp_systolic && l.bp_diastolic).slice().reverse(), [logs]);

  if (bpLogs.length < 2) return (
    <div className="flex-1 flex items-center justify-center text-slate-300 text-sm py-16">
      <Activity className="w-8 h-8 mr-3 opacity-50" /> Not enough data — add at least 2 readings.
    </div>
  );

  const sysVals = bpLogs.map(l => l.bp_systolic);
  const diaVals = bpLogs.map(l => l.bp_diastolic);
  const allVals = [...sysVals, ...diaVals];
  const minV = Math.min(...allVals) - 10;
  const maxV = Math.max(...allVals) + 10;

  const toY = (v) => PAD_T + chartH - ((v - minV) / (maxV - minV)) * chartH;
  const toX = (i) => PAD_L + (i / (bpLogs.length - 1)) * chartW;

  const sysPath = bpLogs.map((l, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)},${toY(l.bp_systolic)}`).join(' ');
  const diaPath = bpLogs.map((l, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)},${toY(l.bp_diastolic)}`).join(' ');

  // Y axis gridlines at round values
  const gridVals = [];
  const step = Math.ceil((maxV - minV) / 5 / 10) * 10;
  for (let v = Math.ceil(minV / 10) * 10; v <= maxV; v += step) gridVals.push(v);

  // X axis labels
  const labelCount = Math.min(5, bpLogs.length);
  const labelIdxs = Array.from({ length: labelCount }, (_, i) =>
    Math.round(i * (bpLogs.length - 1) / (labelCount - 1))
  );

  const midIdx = Math.floor(bpLogs.length / 2);

  return (
    <div className="relative flex-1 w-full min-h-[300px]">
      {/* Y-axis grid labels */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
        {gridVals.slice().reverse().map(v => (
          <div key={v} className="border-t border-slate-100 w-full flex justify-end">
            <span className="text-[10px] text-slate-400 -mt-2 bg-white px-2">{v}</span>
          </div>
        ))}
        <div className="border-t border-slate-100 w-full" />
      </div>

      <svg className="absolute inset-0 w-full h-[calc(100%-32px)] overflow-visible"
        viewBox={`0 0 ${W} ${H - PAD_B}`} preserveAspectRatio="none">
        {/* Systolic line */}
        <path d={sysPath} fill="none" stroke="#2563eb" strokeWidth="3"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* Diastolic line */}
        <path d={diaPath} fill="none" stroke="#0d968b" strokeWidth="3"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* Mid-point markers */}
        <circle cx={toX(midIdx)} cy={toY(bpLogs[midIdx].bp_systolic)} r="5"
          fill="white" stroke="#2563eb" strokeWidth="2" />
        <circle cx={toX(midIdx)} cy={toY(bpLogs[midIdx].bp_diastolic)} r="5"
          fill="white" stroke="#0d968b" strokeWidth="2" />
      </svg>

      {/* X-axis labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
        {labelIdxs.map(i => (
          <span key={i} className="text-[10px] font-bold text-slate-400 uppercase">
            {new Date(bpLogs[i].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        ))}
      </div>
    </div>
  );
};

// ── Add Entry Modal ──
const AddEntryModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    bp_systolic: '', bp_diastolic: '', heart_rate: '',
    weight: '', blood_sugar: '', notes: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      if (form.bp_systolic)  payload.bp_systolic  = Number(form.bp_systolic);
      if (form.bp_diastolic) payload.bp_diastolic = Number(form.bp_diastolic);
      if (form.heart_rate)   payload.heart_rate   = Number(form.heart_rate);
      if (form.weight)       payload.weight       = Number(form.weight);
      if (form.blood_sugar)  payload.blood_sugar  = Number(form.blood_sugar);
      if (form.notes)        payload.notes        = form.notes;
      await api.post('/daily-logs/', payload);
      onSave();
    } catch {}
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Vitals Entry</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold w-8 h-8 flex items-center justify-center">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Systolic', key: 'bp_systolic', unit: 'mmHg', placeholder: '120' },
              { label: 'Diastolic', key: 'bp_diastolic', unit: 'mmHg', placeholder: '80' },
              { label: 'Heart Rate', key: 'heart_rate', unit: 'bpm', placeholder: '72' },
              { label: 'Weight', key: 'weight', unit: 'kg', placeholder: '70' },
              { label: 'Blood Sugar', key: 'blood_sugar', unit: 'mg/dL', placeholder: '90' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {f.label} <span className="normal-case font-normal text-slate-400">({f.unit})</span>
                </label>
                <input type="number" placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl py-2.5 px-3 text-sm focus:border-[#0d968b] focus:ring-1 focus:ring-[#0d968b] outline-none" />
              </div>
            ))}
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Notes</label>
              <textarea placeholder="Optional notes..." value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl py-2.5 px-3 text-sm focus:border-[#0d968b] focus:ring-1 focus:ring-[#0d968b] outline-none resize-none" rows={2} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 text-slate-500 py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-[#0d968b] hover:bg-[#0b857b] text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ══════════════════════════════
const HealthPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs]           = useState([]);
  const [range, setRange]         = useState(30);
  const [showModal, setShowModal] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/daily-logs/?limit=200');
      setLogs(res.data);
    } catch {}
  };

  useEffect(() => { fetchLogs(); }, []);

  // Filter by selected range
  const filteredLogs = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return logs.filter(l => new Date(l.created_at) >= cutoff);
  }, [logs, range]);

  // BP-only logs for stats
  const bpLogs = useMemo(() =>
    filteredLogs.filter(l => l.bp_systolic && l.bp_diastolic),
    [filteredLogs]
  );

  const avgSys = bpLogs.length ? Math.round(bpLogs.reduce((s, l) => s + l.bp_systolic, 0) / bpLogs.length) : '--';
  const avgDia = bpLogs.length ? Math.round(bpLogs.reduce((s, l) => s + l.bp_diastolic, 0) / bpLogs.length) : '--';

  const minSys = bpLogs.length ? Math.min(...bpLogs.map(l => l.bp_systolic)) : '--';
  const minDia = bpLogs.length ? Math.min(...bpLogs.map(l => l.bp_diastolic)) : '--';
  const maxSys = bpLogs.length ? Math.max(...bpLogs.map(l => l.bp_systolic)) : '--';
  const maxDia = bpLogs.length ? Math.max(...bpLogs.map(l => l.bp_diastolic)) : '--';

  const daysInRange = bpLogs.length
    ? bpLogs.filter(l => l.bp_systolic < 130 && l.bp_diastolic < 80).length
    : 0;
  const daysInRangePct = bpLogs.length
    ? Math.round((daysInRange / bpLogs.length) * 100)
    : 0;

  const avgClass = classifyBP(avgSys !== '--' ? avgSys : null, avgDia !== '--' ? avgDia : null);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc] dark:bg-[#102220]">

      {/* ── Sticky Header ── */}
      <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-30">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Blood Pressure Analysis</h2>
          <p className="text-xs text-slate-500 font-medium">Monitoring trends over the last {range} days</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Range tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mr-2">
            {[30, 90, 180].map(r => (
              <button key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  range === r
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}>
                {r === 30 ? '30D' : r === 90 ? '90D' : '6M'}
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate('/medical-reports')}
            className="flex items-center gap-2 bg-[#0d968b]/10 hover:bg-[#0d968b]/20 text-[#0d968b] px-4 py-2.5 rounded-lg font-bold text-sm transition-all border border-[#0d968b]/10"
          >
            <FolderOpen className="w-4 h-4" /> Medical Reports
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#0d968b] hover:bg-[#0b857b] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Entry
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="p-8 w-full">
        <div className="grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">

          {/* ── Chart Card ── */}
          <div className="col-span-12 xl:col-span-9 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 flex flex-col min-h-[420px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pressure Trends</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Systolic (mmHg)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#0d968b] inline-block"></span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Diastolic (mmHg)</span>
                  </div>
                </div>
              </div>
            </div>
            <BPChart logs={filteredLogs} />
          </div>

          {/* ── Medical Context ── */}
          <div className="col-span-12 xl:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">Medical Context</h4>
            <div className="space-y-5">
              {[
                { label: 'Normal',              color: 'text-emerald-600', barColor: 'bg-emerald-500', barW: 'w-full',  range: '< 120/80',         desc: 'Numbers are within the healthy range. Maintain your current diet and exercise routine.' },
                { label: 'Elevated',            color: 'text-amber-500',   barColor: 'bg-amber-500',   barW: 'w-1/2',  range: '120-129 / < 80',   desc: null },
                { label: 'Hypertension (Stage 1)', color: 'text-orange-500', barColor: 'bg-orange-500', barW: 'w-1/4', range: '130-139 / 80-89',  desc: null },
                { label: 'Hypertension (Stage 2)', color: 'text-red-500',   barColor: 'bg-red-500',    barW: 'w-1/12', range: '140+ / 90+',        desc: null },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-bold ${item.color}`}>{item.label}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{item.range}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.barColor} ${item.barW}`}></div>
                  </div>
                  {item.desc && <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{item.desc}</p>}
                </div>
              ))}
            </div>

            {/* Doctor's Note */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 text-[#0d968b] bg-[#0d968b]/5 p-4 rounded-xl border border-[#0d968b]/10">
                <Activity className="w-5 h-5 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">Doctor's Note</p>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 italic leading-snug">"Excellent stability. Continue current magnesium supplement."</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className="col-span-12 md:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col h-full justify-between">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">Average BP</p>
              <div className="flex items-baseline justify-between">
                <h4 className="text-3xl font-black text-slate-900 dark:text-white">{avgSys !== '--' ? `${avgSys}/${avgDia}` : '--'}</h4>
                {avgClass && (
                  <span className={`px-2 py-0.5 rounded-md ${avgClass.bg} ${avgClass.text} text-[10px] font-bold uppercase`}>{avgClass.label}</span>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col h-full justify-between">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">Min / Max</p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{minSys !== '--' ? `${minSys}/${minDia}` : '--'}</h4>
                <span className="text-slate-300 dark:text-slate-600 font-light text-2xl">–</span>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{maxSys !== '--' ? `${maxSys}/${maxDia}` : '--'}</h4>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col h-full justify-between">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">Days in Range</p>
              <div className="flex items-baseline justify-between">
                <h4 className="text-3xl font-black text-slate-900 dark:text-white">{bpLogs.length ? `${daysInRange}/${bpLogs.length}` : '--'}</h4>
                <span className="text-lg font-bold text-slate-400">{bpLogs.length ? `${daysInRangePct}%` : ''}</span>
              </div>
            </div>
          </div>

          {/* ── Recent Readings Table ── */}
          <div className="col-span-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Recent Readings</h4>
              <div className="flex gap-4">
                <button className="flex items-center gap-1.5 text-xs font-bold text-[#0d968b] hover:underline px-4 py-2">
                  <Download className="w-3.5 h-3.5" /> Download Guidelines
                </button>
                <button className="flex items-center gap-1.5 text-sm font-bold text-[#0d968b] hover:underline">
                  <Share2 className="w-3.5 h-3.5" /> Share with Provider
                </button>
              </div>
            </div>

            {bpLogs.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Activity className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No blood pressure readings in this period.</p>
                <button onClick={() => setShowModal(true)} className="text-[#0d968b] text-xs mt-2 hover:underline font-semibold">
                  + Add first reading
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      {['Date & Time', 'Reading (mmHg)', 'Status', 'Heart Rate', ''].map(h => (
                        <th key={h} className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {bpLogs.slice(0, 10).map(log => {
                      const cls = classifyBP(log.bp_systolic, log.bp_diastolic);
                      return (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-8 py-4">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{fmtDate(log.created_at)}</p>
                            <p className="text-xs text-slate-500">{fmtTime(log.created_at)}</p>
                          </td>
                          <td className="px-8 py-4">
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {log.bp_systolic}/{log.bp_diastolic}
                            </span>
                          </td>
                          <td className="px-8 py-4">
                            {cls && (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cls.bg} ${cls.text} text-[10px] font-bold uppercase tracking-wide`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cls.dot} inline-block`}></span>
                                {cls.label}
                              </span>
                            )}
                          </td>
                          <td className="px-8 py-4 text-sm font-medium text-slate-500">
                            {log.heart_rate ? `${log.heart_rate} BPM` : '—'}
                          </td>
                          <td className="px-8 py-4 text-right">
                            <ChevronRight className="w-5 h-5 text-slate-300 hover:text-slate-600 ml-auto cursor-pointer" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Bottom Actions ── */}
          <div className="col-span-12 flex justify-center gap-4 py-4">
            <button className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all">
              Download Historical Analysis
            </button>
            <button className="px-6 py-3 rounded-xl bg-[#0d968b]/5 text-[#0d968b] text-xs font-bold border border-[#0d968b]/10 hover:bg-[#0d968b]/10 transition-all">
              Share with Care Provider
            </button>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="mt-auto py-8 px-8 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-[11px] font-medium max-w-[1600px] mx-auto w-full">
          <p>© {new Date().getFullYear()} LifeOS Medical Systems. All healthcare data is encrypted and HIPAA compliant.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#0d968b] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#0d968b] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#0d968b] transition-colors">Support Center</a>
          </div>
        </div>
      </footer>

      {/* ── Add Entry Modal ── */}
      {showModal && (
        <AddEntryModal
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchLogs(); }}
        />
      )}
    </div>
  );
};

export default HealthPage;
