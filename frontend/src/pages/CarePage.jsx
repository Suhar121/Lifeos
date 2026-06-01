import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Users, Plus, Download, Lock, Search,
  AlertTriangle, CheckCircle, ChevronLeft, ChevronRight,
  MoreVertical, FileText, FlaskConical, Loader2, X, Send
} from 'lucide-react';
import api from '../services/api';

// ── Initials avatar ──
const Avatar = ({ name = '', size = 'lg' }) => {
  const chars = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
  const colors = ['from-[#0d968b] to-[#065f46]', 'from-blue-500 to-blue-700', 'from-violet-500 to-violet-700', 'from-amber-500 to-orange-600'];
  const idx = name.charCodeAt(0) % colors.length;
  const sz = size === 'lg' ? 'w-24 h-24 text-2xl' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white font-bold border-4 border-slate-50 dark:border-slate-800 shadow-md`}>
      {chars}
    </div>
  );
};

// ── File icon by type ──
const FileIcon = ({ type }) => {
  if (type === 'pdf') return (
    <div className="bg-red-50 dark:bg-red-900/30 p-2 rounded text-red-600 dark:text-red-400">
      <FileText className="w-5 h-5" />
    </div>
  );
  return (
    <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded text-blue-600 dark:text-blue-400">
      <FlaskConical className="w-5 h-5" />
    </div>
  );
};

// ── format bytes ──
const fmt = (bytes) => bytes ? (bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`) : '—';

// ══════════════════════════════════════════════════════════════════
const CarePage = () => {
  const [wards, setWards] = useState([]);          // people sharing data with me
  const [myLinks, setMyLinks] = useState([]);       // people I share data with
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportPage, setReportPage] = useState(0);
  const PAGE_SIZE = 5;

  // Add member modal
  const [showModal, setShowModal] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addRelation, setAddRelation] = useState('Family Member');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  // Search
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/care/wards').catch(() => ({ data: [] })),
      api.get('/care/my-links').catch(() => ({ data: [] })),
      api.get('/reports/').catch(() => ({ data: [] })),
    ]).then(([w, l, r]) => {
      setWards(w.data || []);
      setMyLinks(l.data || []);
      setReports(r.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');
    setAddSuccess('');
    try {
      await api.post('/care/link', { caretaker_email: addEmail, relationship: addRelation });
      setAddSuccess(`Invitation sent to ${addEmail}`);
      setAddEmail('');
      // Refresh links
      const res = await api.get('/care/my-links');
      setMyLinks(res.data || []);
    } catch (err) {
      setAddError(err.response?.data?.detail || 'Failed to send invitation');
    } finally {
      setAddLoading(false);
    }
  };

  const handleRevokeLink = async (id) => {
    try {
      await api.delete(`/care/link/${id}`);
      setMyLinks(prev => prev.filter(l => l.id !== id));
    } catch { /* silent */ }
  };

  const handleDownloadReport = async (report) => {
    try {
      const res = await api.get(`/reports/${report.id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.file_name;
      a.click();
    } catch { /* silent */ }
  };

  // Combine all care network members for display cards
  const allMembers = [
    ...wards.map(w => ({ ...w, role: 'ward', displayName: w.user_name, email: w.user_email })),
    ...myLinks.map(l => ({ ...l, role: 'caretaker', displayName: l.caretaker_name, email: l.caretaker_email })),
  ];

  // Filter reports by search
  const filteredReports = reports.filter(r =>
    !search || r.title.toLowerCase().includes(search.toLowerCase()) || (r.description || '').toLowerCase().includes(search.toLowerCase())
  );
  const pageReports = filteredReports.slice(reportPage * PAGE_SIZE, (reportPage + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filteredReports.length / PAGE_SIZE);

  return (
    <div className="flex-1 overflow-y-auto bg-[#f6f8f8] dark:bg-[#102220] min-h-screen">

      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-blue-700 dark:text-blue-400 w-5 h-5" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Secure Family Care Portal</h2>
        </div>
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden lg:block w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setReportPage(0); }}
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#0d968b] outline-none"
              placeholder="Search records..."
              type="text"
            />
          </div>
          {/* Add Member button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#0d968b] text-white py-2 px-4 rounded-lg font-semibold text-sm hover:bg-[#0d968b]/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-8">

        {/* ── Title ── */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Circle of Care</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Real-time health monitoring and encrypted data sharing for your inner circle.</p>
        </div>

        {/* ── Member Cards Grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#0d968b]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {allMembers.length === 0 && (
              <div className="col-span-full text-center py-10 text-slate-400 text-sm">
                No care connections yet. Add a member to get started.
              </div>
            )}

            {allMembers.map(member => {
              const isAlert = member.status === 'pending';
              return (
                <div
                  key={member.id}
                  className={`bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm relative overflow-hidden group transition-transform hover:scale-[0.99] ${
                    isAlert
                      ? 'border-2 border-red-200 dark:border-red-900/30 border-l-[#1a5e9e] border-l-4'
                      : 'border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Ping for alert */}
                  {isAlert && (
                    <div className="absolute top-3 right-3">
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                      </span>
                    </div>
                  )}

                  {/* BG decor */}
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <Users className="w-16 h-16 text-[#0d968b]" />
                  </div>

                  <div className="flex flex-col items-center">
                    <Avatar name={member.displayName} size="lg" />

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4">
                      {member.displayName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{member.email}</p>

                    {/* Status badge */}
                    <div className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      isAlert
                        ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30'
                        : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'
                    }`}>
                      {isAlert ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {isAlert ? 'Pending Approval' : 'Connected'}
                    </div>

                    <p className="mt-4 text-slate-500 text-sm capitalize">
                      {member.relationship} • {member.role === 'ward' ? 'Sharing with you' : 'You invite'}
                    </p>

                    {/* Mini stats */}
                    <div className="mt-6 w-full grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-center">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Role</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">{member.relationship}</p>
                      </div>
                      <div className={`p-3 rounded-lg text-center ${isAlert ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
                        <p className={`text-sm font-bold capitalize ${isAlert ? 'text-amber-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {member.status}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {member.role === 'caretaker' && (
                      <button
                        onClick={() => handleRevokeLink(member.id)}
                        className="mt-5 w-full py-2 text-slate-500 hover:text-red-500 hover:border-red-200 rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-700 transition-all"
                      >
                        Revoke Access
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Invite placeholder card */}
            <div
              onClick={() => setShowModal(true)}
              className="bg-slate-50/50 dark:bg-slate-800/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#0d968b] hover:bg-[#0d968b]/5 transition-all group"
            >
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600 shadow-sm group-hover:text-[#0d968b] group-hover:bg-[#0d968b]/10 transition-all">
                <Plus className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500 group-hover:text-[#0d968b]">Monitor Member</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm px-4 mt-1">Add a new family member to track their health metrics.</p>
            </div>
          </div>
        )}

        {/* ── Shared Documents ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="text-blue-700 dark:text-blue-400 w-5 h-5" />
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Shared Documents</h2>
            </div>
            <button className="text-[#0d968b] hover:underline text-sm font-bold flex items-center gap-1">
              View All Records <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Document Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Description</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr>
                ) : pageReports.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm">No documents found.</td></tr>
                ) : pageReports.map(report => (
                  <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileIcon type={report.file_type} />
                        <div>
                          <p className="font-bold text-sm text-slate-700 dark:text-slate-300">{report.file_name || report.title}</p>
                          <p className="text-xs text-slate-400">{fmt(report.file_size)} • {report.file_type === 'pdf' ? 'Medical Record' : 'Document'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell max-w-[160px] truncate">
                      {report.description || report.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                      {report.report_date ? new Date(report.report_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownloadReport(report)}
                        className="text-[#0d968b] hover:bg-[#0d968b]/10 p-2 rounded-lg transition-colors"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button className="text-slate-400 hover:text-slate-600 p-2 rounded-lg transition-colors ml-1">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2 uppercase tracking-widest">
                <Lock className="w-4 h-4" /> AES-256 Encrypted Documents
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Page {reportPage + 1} of {totalPages}</span>
                  <div className="flex gap-1">
                    <button
                      disabled={reportPage === 0}
                      onClick={() => setReportPage(p => Math.max(0, p - 1))}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={reportPage >= totalPages - 1}
                      onClick={() => setReportPage(p => Math.min(totalPages - 1, p + 1))}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Member Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#0d968b]/10 rounded-lg text-[#0d968b]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Add Care Member</h3>
                  <p className="text-xs text-slate-400">Invite someone to your Circle of Care</p>
                </div>
              </div>
              <button onClick={() => { setShowModal(false); setAddError(''); setAddSuccess(''); }} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              {addError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {addError}
                </div>
              )}
              {addSuccess && (
                <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm border border-emerald-100 dark:border-emerald-900/30">
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> {addSuccess}
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Member's LifeOS Email</label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={e => setAddEmail(e.target.value)}
                  required
                  placeholder="member@example.com"
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl py-3 px-4 text-sm focus:border-[#0d968b] focus:ring-1 focus:ring-[#0d968b] outline-none transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Relationship</label>
                <select
                  value={addRelation}
                  onChange={e => setAddRelation(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl py-3 px-4 text-sm focus:border-[#0d968b] focus:ring-1 focus:ring-[#0d968b] outline-none transition-all dark:text-white"
                >
                  {['Family Member', 'Spouse', 'Parent', 'Child', 'Sibling', 'Caregiver', 'Physician', 'Other'].map(r => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-[#0d968b]/5 rounded-xl border border-[#0d968b]/10">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  <span className="font-bold text-[#0d968b]">Note:</span> The invited person must already have a LifeOS account. They will receive a notification to approve access.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 py-3 bg-[#0d968b] text-white text-sm font-bold rounded-xl hover:bg-[#0b857b] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {addLoading ? 'Sending...' : 'Send Invitation'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setAddError(''); setAddSuccess(''); }}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarePage;
