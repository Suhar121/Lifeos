import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, Heart, Thermometer, Database, Check } from 'lucide-react';

const HealthPage = () => {
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

  useEffect(() => {
    fetchTodayLog();
  }, []);

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
      setMessage('Unabled to save. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-20">
      <div className="max-w-md mx-auto p-6 pt-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-red-500/20 p-3 rounded-full">
            <Activity className="text-red-500" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Health Vitals</h1>
            <p className="text-gray-400 text-sm">Track your daily biological metrics</p>
          </div>
        </div>

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
            
            {/* Weight Section */}
            <div className="bg-neutral-800/50 p-5 rounded-2xl border border-neutral-700/50">
              <div className="flex items-center gap-2 mb-4 text-emerald-400">
                <Database size={20} />
                <span className="font-medium">Body Metrics</span>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1.5 ml-1">Weight (kg)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  placeholder="e.g. 70.5"
                  value={formData.weight}
                  onChange={e => setFormData({...formData, weight: e.target.value})}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Heart & BP Section */}
            <div className="bg-neutral-800/50 p-5 rounded-2xl border border-neutral-700/50">
              <div className="flex items-center gap-2 mb-4 text-rose-400">
                <Heart size={20} />
                <span className="font-medium">Heart Health</span>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1.5 ml-1">Systolic (Top)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 120"
                      value={formData.bp_systolic}
                      onChange={e => setFormData({...formData, bp_systolic: e.target.value})}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1.5 ml-1">Diastolic (Bot)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 80"
                      value={formData.bp_diastolic}
                      onChange={e => setFormData({...formData, bp_diastolic: e.target.value})}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5 ml-1">Resting Heart Rate (bpm)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 72"
                      value={formData.heart_rate}
                      onChange={e => setFormData({...formData, heart_rate: e.target.value})}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                    />
                </div>
              </div>
            </div>

            {/* Blood Sugar Section */}
            <div className="bg-neutral-800/50 p-5 rounded-2xl border border-neutral-700/50">
              <div className="flex items-center gap-2 mb-4 text-blue-400">
                <Thermometer size={20} />
                <span className="font-medium">Metabolic</span>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1.5 ml-1">Blood Sugar (mg/dL)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 95"
                  value={formData.blood_sugar}
                  onChange={e => setFormData({...formData, blood_sugar: e.target.value})}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Save Vitals
            </button>

            {message && (
              <div className={`text-center p-3 rounded-xl text-sm ${message.includes('success') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {message}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default HealthPage;