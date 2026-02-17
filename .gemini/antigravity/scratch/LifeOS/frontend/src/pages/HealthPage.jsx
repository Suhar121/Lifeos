import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Activity, Heart, Thermometer, Database, Check, FileText, Upload, Trash2, Share2, Eye, X, Plus, Calendar } from 'lucide-react';

const HealthPage = () => {
  const [activeTab, setActiveTab] = useState('vitals');
  const [formData, setFormData] = useState({
    weight: '',
    bp_systolic: '',
    bp_diastolic: '',
    blood_sugar: '',
    heart_rate: ''
  });
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Reports state
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', description: '', report_date: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchTodayLog();
  }, []);

  useEffect(() => {
    if (activeTab === 'reports') fetchReports();
  }, [activeTab]);

  const fetchTodayLog = async () => {
    try {
      const res = await api.get('/daily-logs/');
      if (res.data && res.data.length > 0) {
        // Check if the most recent log is from today
        const lastLog = res.data[0];
        const logDate = new Date(lastLog.created_at).toDateString();
        const today = new Date().toDateString();
        
        if (logDate === today) {
          setTodayLog(lastLog);
          setFormData({
            weight: lastLog.weight || '',
            bp_systolic: lastLog.bp_systolic || '',
            bp_diastolic: lastLog.bp_diastolic || '',
            blood_sugar: lastLog.blood_sugar || '',
            heart_rate: lastLog.heart_rate || ''
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (todayLog) {
        // Update existing log
        await api.put(`/daily-logs/${todayLog.id}`, {
          weight: formData.weight ? parseFloat(formData.weight) : null,
          bp_systolic: formData.bp_systolic ? parseInt(formData.bp_systolic) : null,
          bp_diastolic: formData.bp_diastolic ? parseInt(formData.bp_diastolic) : null,
          blood_sugar: formData.blood_sugar ? parseInt(formData.blood_sugar) : null,
          heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : null
        });
        setMessage('Health stats updated successfully!');
      } else {
        // Create new log? This is tricky because DailyLog requires mood/energy etc.
        // For now, prompt user to do Check-In first if no log exists
        setMessage('Please complete your Daily Check-In first to enable health tracking.');
        return;
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Unable to save. Please try again.');
    }
  };

  // --- Reports functions ---
  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const res = await api.get('/medical-reports/');
      setReports(res.data);
    } catch (err) { console.error(err); }
    finally { setReportsLoading(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !uploadData.title) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('title', uploadData.title);
      if (uploadData.description) fd.append('description', uploadData.description);
      if (uploadData.report_date) fd.append('report_date', uploadData.report_date);
      await api.post('/medical-reports/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowUpload(false);
      setUploadData({ title: '', description: '', report_date: '' });
      setSelectedFile(null);
      fetchReports();
      setMessage('Report uploaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Upload failed');
      setTimeout(() => setMessage(''), 3000);
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this report?')) return;
    try {
      await api.delete(`/medical-reports/${id}`);
      setReports(r => r.filter(rep => rep.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleView = async (id) => {
    try {
      const res = await api.get(`/medical-reports/file/${id}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error(err);
      setMessage('Failed to open report');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleShare = async (report) => {
    try {
      const res = await api.get(`/medical-reports/file/${report.id}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const file = new File([blob], report.file_name, { type: blob.type });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: report.title,
          text: report.description || `Medical Report: ${report.title}`,
          files: [file],
        });
      } else {
        // Fallback: download the file
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = report.file_name;
        a.click();
        URL.revokeObjectURL(url);
        setMessage('File downloaded (sharing not supported on this browser)');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        setMessage('Failed to share report');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '?';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-20">
      <div className="max-w-md mx-auto p-6 pt-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-500/20 p-3 rounded-full">
            <Activity className="text-red-500" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Health Vitals</h1>
            <p className="text-gray-400 text-sm">Track your metrics & reports</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-neutral-800 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('vitals')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'vitals' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Heart size={16} className="inline mr-1.5 -mt-0.5" />Vitals
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'reports' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <FileText size={16} className="inline mr-1.5 -mt-0.5" />Reports
          </button>
        </div>

        {/* Global Message */}
        {message && (
          <div className={`text-center p-3 rounded-xl text-sm mb-4 ${message.includes('success') || message.includes('shared') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}

        {/* ===== VITALS TAB ===== */}
        {activeTab === 'vitals' && (
          <>
            {loading ? (
              <div className="text-center py-10 text-gray-400">Loading...</div>
            ) : !todayLog ? (
              <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700 text-center">
                <p className="text-gray-300 mb-4">No Daily Check-In found for today.</p>
                <p className="text-sm text-gray-500 mb-6">Please complete your daily check-in first to unlock health tracking.</p>
                <a href="/check-in" className="inline-block bg-indigo-600 px-6 py-3 rounded-xl font-medium">Go to Check In</a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-neutral-800/50 p-5 rounded-2xl border border-neutral-700/50">
                  <div className="flex items-center gap-2 mb-4 text-emerald-400">
                    <Database size={20} /><span className="font-medium">Body Metrics</span>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1.5 ml-1">Weight (kg)</label>
                    <input type="number" step="0.1" placeholder="e.g. 70.5" value={formData.weight}
                      onChange={e => setFormData({...formData, weight: e.target.value})}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-gray-600" />
                  </div>
                </div>

                <div className="bg-neutral-800/50 p-5 rounded-2xl border border-neutral-700/50">
                  <div className="flex items-center gap-2 mb-4 text-rose-400">
                    <Heart size={20} /><span className="font-medium">Heart Health</span>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1.5 ml-1">Systolic (Top)</label>
                        <input type="number" placeholder="e.g. 120" value={formData.bp_systolic}
                          onChange={e => setFormData({...formData, bp_systolic: e.target.value})}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1.5 ml-1">Diastolic (Bot)</label>
                        <input type="number" placeholder="e.g. 80" value={formData.bp_diastolic}
                          onChange={e => setFormData({...formData, bp_diastolic: e.target.value})}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 outline-none transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1.5 ml-1">Resting Heart Rate (bpm)</label>
                      <input type="number" placeholder="e.g. 72" value={formData.heart_rate}
                        onChange={e => setFormData({...formData, heart_rate: e.target.value})}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-800/50 p-5 rounded-2xl border border-neutral-700/50">
                  <div className="flex items-center gap-2 mb-4 text-blue-400">
                    <Thermometer size={20} /><span className="font-medium">Metabolic</span>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1.5 ml-1">Blood Sugar (mg/dL)</label>
                    <input type="number" placeholder="e.g. 95" value={formData.blood_sugar}
                      onChange={e => setFormData({...formData, blood_sugar: e.target.value})}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                  </div>
                </div>

                <button type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Check size={20} /> Save Vitals
                </button>
              </form>
            )}
          </>
        )}

        {/* ===== REPORTS TAB ===== */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {/* Upload Button */}
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-3.5 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Upload Report
            </button>

            {/* Upload Form */}
            {showUpload && (
              <form onSubmit={handleUpload} className="bg-neutral-800 rounded-2xl p-5 border border-neutral-700 space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5 ml-1">Report Title *</label>
                  <input type="text" placeholder="e.g. Blood Test Report" value={uploadData.title}
                    onChange={e => setUploadData({...uploadData, title: e.target.value})}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5 ml-1">Description</label>
                  <input type="text" placeholder="Optional notes" value={uploadData.description}
                    onChange={e => setUploadData({...uploadData, description: e.target.value})}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5 ml-1">Report Date</label>
                  <input type="date" value={uploadData.report_date}
                    onChange={e => setUploadData({...uploadData, report_date: e.target.value})}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5 ml-1">File (PDF or Image, max 10MB) *</label>
                  <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={e => setSelectedFile(e.target.files[0])}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-gray-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:text-xs file:cursor-pointer" required />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={uploading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                    <Upload size={18} /> {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <button type="button" onClick={() => { setShowUpload(false); setSelectedFile(null); }}
                    className="px-4 bg-neutral-700 hover:bg-neutral-600 rounded-xl transition-all">
                    <X size={18} />
                  </button>
                </div>
              </form>
            )}

            {/* Reports List */}
            {reportsLoading ? (
              <div className="text-center py-10 text-gray-400">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="bg-neutral-800 rounded-2xl p-8 border border-neutral-700 text-center">
                <FileText size={48} className="mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">No medical reports yet</p>
                <p className="text-sm text-gray-500 mt-1">Upload your lab results, prescriptions, or scans</p>
              </div>
            ) : (
              reports.map(report => (
                <div key={report.id} className="bg-neutral-800 rounded-2xl p-4 border border-neutral-700">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl mt-0.5 ${report.file_type === 'pdf' ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                      <FileText size={22} className={report.file_type === 'pdf' ? 'text-red-400' : 'text-blue-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{report.title}</h3>
                      {report.description && <p className="text-sm text-gray-400 mt-0.5 truncate">{report.description}</p>}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        {report.report_date && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {new Date(report.report_date).toLocaleDateString()}
                          </span>
                        )}
                        <span>{formatSize(report.file_size)}</span>
                        <span className="uppercase">{report.file_type}</span>
                      </div>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-700/50">
                    <button onClick={() => handleView(report.id)}
                      className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-sm py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all">
                      <Eye size={15} /> View
                    </button>
                    <button onClick={() => handleShare(report)}
                      className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-sm py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all">
                      <Share2 size={15} /> Share
                    </button>
                    <button onClick={() => handleDelete(report.id)}
                      className="px-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm py-2 rounded-lg transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthPage;