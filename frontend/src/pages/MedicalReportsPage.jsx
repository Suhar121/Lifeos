import React, { useState, useEffect, useRef } from 'react';
import { Plus, FileText, Image, File, Eye, Send, Trash2, CalendarDays, UploadCloud, ShieldCheck, X, Upload } from 'lucide-react';
import api from '../services/api';

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const fmtSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileIcon = ({ fileType }) => {
  if (fileType === 'pdf')
    return (
      <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 shrink-0">
        <FileText className="w-6 h-6" />
      </div>
    );
  if (fileType === 'image')
    return (
      <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 shrink-0">
        <Image className="w-6 h-6" />
      </div>
    );
  return (
    <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 shrink-0">
      <File className="w-6 h-6" />
    </div>
  );
};

const MedicalReportsPage = () => {
  const [reports, setReports]       = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [dragOver, setDragOver]     = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '', report_date: '', description: ''
  });

  const fetchReports = async () => {
    try { const res = await api.get('/reports/'); setReports(res.data); } catch {}
  };

  useEffect(() => { fetchReports(); }, []);

  const handleFileSelect = (file) => {
    if (file) setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) { alert('Please attach a file.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      if (form.description) fd.append('description', form.description);
      if (form.report_date) fd.append('report_date', form.report_date);
      fd.append('file', selectedFile);
      await api.post('/reports/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm({ title: '', report_date: '', description: '' });
      setSelectedFile(null);
      setShowForm(false);
      fetchReports();
    } catch (err) {
      alert(err?.response?.data?.detail || 'Upload failed. Please try again.');
    }
    setSaving(false);
  };

  const deleteReport = async (id) => {
    if (!confirm('Delete this report?')) return;
    try { await api.delete(`/reports/${id}`); fetchReports(); } catch {}
  };

  const viewReport = (id) => {
    window.open(`${api.defaults.baseURL}/reports/file/${id}`, '_blank');
  };

  const sendReport = async (id) => {
    try {
      await api.post(`/reports/${id}/send`);
      alert('Report shared with your care team!');
    } catch (err) {
      alert(err?.response?.data?.detail || 'Could not share report.');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f6f8f8] dark:bg-[#102220]">

      {/* ── Page Body ── */}
      <main className="flex-1 px-6 lg:px-12 py-8">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* ── Page Header ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Medical Reports</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and access your clinical documentation securely.</p>
            </div>
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center justify-center gap-2 bg-[#0d968b] hover:bg-[#0b857b] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#0d968b]/20 w-full md:w-auto"
            >
              {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />}
              {showForm ? 'Cancel Upload' : 'Upload New Report'}
            </button>
          </div>

          {/* ── Upload Form ── */}
          {showForm && (
            <section className="bg-white dark:bg-slate-900 border border-[#0d968b]/10 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                <Upload className="w-5 h-5 text-[#0d968b]" />
                Upload Details
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">Report Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Annual Blood Work"
                    className="w-full rounded-lg border border-[#0d968b]/20 focus:border-[#0d968b] focus:ring-1 focus:ring-[#0d968b] outline-none py-2.5 px-3 bg-[#f6f8f8] dark:bg-slate-800 dark:text-white text-sm"
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">Examination Date</label>
                  <input
                    type="date"
                    value={form.report_date}
                    onChange={e => setForm({ ...form, report_date: e.target.value })}
                    className="w-full rounded-lg border border-[#0d968b]/20 focus:border-[#0d968b] focus:ring-1 focus:ring-[#0d968b] outline-none py-2.5 px-3 bg-[#f6f8f8] dark:bg-slate-800 dark:text-white text-sm"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">Description / Notes</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Add any specific notes about this medical record..."
                    rows={3}
                    className="w-full rounded-lg border border-[#0d968b]/20 focus:border-[#0d968b] focus:ring-1 focus:ring-[#0d968b] outline-none py-2.5 px-3 bg-[#f6f8f8] dark:bg-slate-800 dark:text-white text-sm resize-none"
                  />
                </div>

                {/* File Upload */}
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Attachment</label>
                  {selectedFile ? (
                    <div className="flex items-center gap-3 p-4 border border-[#0d968b]/20 bg-[#0d968b]/5 dark:bg-[#0d968b]/10 rounded-xl">
                      <FileText className="w-5 h-5 text-[#0d968b]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{selectedFile.name}</p>
                        <p className="text-xs text-slate-500">{fmtSize(selectedFile.size)}</p>
                      </div>
                      <button type="button" onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-500 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                        dragOver
                          ? 'border-[#0d968b] bg-[#0d968b]/10'
                          : 'border-[#0d968b]/30 hover:bg-[#0d968b]/5 hover:border-[#0d968b]/60'
                      }`}
                    >
                      <UploadCloud className={`w-10 h-10 mx-auto ${dragOver ? 'text-[#0d968b]' : 'text-[#0d968b]/40'} transition-colors`} />
                      <p className="mt-2 text-sm text-slate-500">Drag and drop your medical PDF or image here</p>
                      <p className="text-xs text-slate-400 mt-1">Max file size: 10MB · PDF, JPG, PNG, WebP</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={e => handleFileSelect(e.target.files[0])}
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setShowForm(false); setSelectedFile(null); setForm({ title: '', report_date: '', description: '' }); }}
                    className="px-6 py-2.5 rounded-lg font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="px-8 py-2.5 rounded-lg font-bold bg-[#0d968b] hover:bg-[#0b857b] text-white transition-all disabled:opacity-60">
                    {saving ? 'Uploading…' : 'Save Report'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* ── Recent Documents ── */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Documents</h2>
              <div className="flex items-center gap-1.5 text-[#0d968b] font-semibold text-sm cursor-pointer hover:underline select-none">
                <CalendarDays className="w-4 h-4" />
                <span>Sort by date</span>
              </div>
            </div>

            {reports.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-[#0d968b]/10 rounded-2xl p-12 text-center">
                <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">No reports uploaded yet.</p>
                <button onClick={() => setShowForm(true)}
                  className="mt-3 text-[#0d968b] text-sm font-semibold hover:underline">
                  + Upload your first report
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {reports.map(report => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-[#0d968b]/5 rounded-xl hover:border-[#0d968b]/30 transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <FileIcon fileType={report.file_type} />
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#0d968b] transition-colors truncate">
                          {report.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {report.report_date ? fmtDate(report.report_date) : fmtDate(report.created_at)}
                          </span>
                          <span className="text-xs font-medium text-slate-400">{fmtSize(report.file_size)}</span>
                          {report.description && (
                            <span className="text-xs text-slate-400 truncate max-w-[200px]">{report.description}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-4">
                      <button
                        onClick={() => viewReport(report.id)}
                        title="View Report"
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#0d968b] hover:bg-[#0d968b]/10 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => sendReport(report.id)}
                        title="Share with Care Team"
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#0d968b] hover:bg-[#0d968b]/10 transition-all"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteReport(report.id)}
                        title="Delete"
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Encryption Notice ── */}
          <div className="p-4 bg-[#0d968b]/5 rounded-xl flex items-start gap-4 border border-[#0d968b]/10">
            <ShieldCheck className="w-5 h-5 text-[#0d968b] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#0d968b]">End-to-End Encrypted</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                All uploaded documents are encrypted and only accessible by you and authorized clinicians. HIPAA compliant storage enabled.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="mt-auto px-6 lg:px-12 py-8 border-t border-[#0d968b]/5 text-center">
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} LifeOS Clinical Portal. Professional Patient Information System.</p>
      </footer>
    </div>
  );
};

export default MedicalReportsPage;
