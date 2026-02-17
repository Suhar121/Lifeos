import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Users, UserPlus, Mail, Heart, Shield, Check, X, Eye,
  ChevronLeft, Pill, Calendar, Activity, Scale, Droplets,
  Brain, Dumbbell, UtensilsCrossed, Sun, Moon
} from 'lucide-react';

const RELATIONSHIPS = [
  { value: 'parent', label: '👨‍👩‍👧 Parent' },
  { value: 'child', label: '👶 Child' },
  { value: 'spouse', label: '💑 Spouse' },
  { value: 'caretaker', label: '🏥 Caretaker' },
  { value: 'friend', label: '🤝 Friend' },
  { value: 'other', label: '👤 Other' },
];

const MOOD_EMOJI = {
  great: '😄', good: '🙂', okay: '😐', bad: '😟', terrible: '😢'
};

export default function CarePage() {
  const [tab, setTab] = useState('sharing');   // sharing | wards
  const [myLinks, setMyLinks] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('caretaker');
  const [adding, setAdding] = useState(false);

  // Ward detail view
  const [selectedWard, setSelectedWard] = useState(null);
  const [wardSummary, setWardSummary] = useState(null);
  const [wardHistory, setWardHistory] = useState(null);
  const [loadingWard, setLoadingWard] = useState(false);
  const [wardDate, setWardDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const [linksRes, wardsRes] = await Promise.all([
        api.get('/care/my-links'),
        api.get('/care/wards')
      ]);
      setMyLinks(linksRes.data);
      setWards(wardsRes.data);
    } catch (err) {
      setError('Failed to load care links');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/care/link', {
        caretaker_email: email,
        relationship
      });
      setSuccess('Care link request sent!');
      setEmail('');
      setShowAddForm(false);
      fetchLinks();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send care link request');
    } finally {
      setAdding(false);
    }
  };

  const handleRespond = async (linkId, status) => {
    try {
      await api.put(`/care/respond/${linkId}`, { status });
      setSuccess(status === 'active' ? 'Care link accepted!' : 'Care link declined.');
      fetchLinks();
    } catch (err) {
      setError('Failed to respond to request');
    }
  };

  const handleRemoveLink = async (linkId) => {
    if (!confirm('Remove this care link?')) return;
    try {
      await api.delete(`/care/link/${linkId}`);
      setSuccess('Care link removed');
      fetchLinks();
    } catch (err) {
      setError('Failed to remove link');
    }
  };

  const viewWardDetail = async (ward) => {
    setSelectedWard(ward);
    setLoadingWard(true);
    try {
      const [summaryRes, historyRes] = await Promise.all([
        api.get(`/care/ward/${ward.user_id}/summary?log_date=${wardDate}`),
        api.get(`/care/ward/${ward.user_id}/history?days=7`)
      ]);
      setWardSummary(summaryRes.data);
      setWardHistory(historyRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load ward data');
    } finally {
      setLoadingWard(false);
    }
  };

  const changeWardDate = async (newDate) => {
    setWardDate(newDate);
    if (selectedWard) {
      setLoadingWard(true);
      try {
        const res = await api.get(`/care/ward/${selectedWard.user_id}/summary?log_date=${newDate}`);
        setWardSummary(res.data);
      } catch (err) {
        setError('Failed to load data for that date');
      } finally {
        setLoadingWard(false);
      }
    }
  };

  // Clear messages after 4s
  useEffect(() => {
    if (success || error) {
      const t = setTimeout(() => { setSuccess(''); setError(''); }, 4000);
      return () => clearTimeout(t);
    }
  }, [success, error]);

  // --- Ward Detail View ---
  if (selectedWard) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => { setSelectedWard(null); setWardSummary(null); setWardHistory(null); }}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft size={20} /> Back to Care
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{selectedWard.user_name}</h1>
            <p className="text-gray-400 text-sm">{selectedWard.user_email}</p>
          </div>
          <input
            type="date"
            value={wardDate}
            onChange={(e) => changeWardDate(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm"
          />
        </div>

        {loadingWard ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : wardSummary ? (
          <div className="space-y-6">
            {/* Mood & Life Score */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox
                icon={<span className="text-2xl">{MOOD_EMOJI[wardSummary.mood] || '❓'}</span>}
                label="Mood"
                value={wardSummary.mood ? wardSummary.mood.charAt(0).toUpperCase() + wardSummary.mood.slice(1) : 'No log'}
              />
              <StatBox
                icon={<Activity size={20} className="text-indigo-400" />}
                label="Life Score"
                value={wardSummary.life_score ?? '—'}
              />
              <StatBox
                icon={<Sun size={20} className="text-yellow-400" />}
                label="Energy"
                value={wardSummary.energy ? `${wardSummary.energy}/10` : '—'}
              />
              <StatBox
                icon={<Moon size={20} className="text-blue-400" />}
                label="Sleep"
                value={wardSummary.sleep_hours ? `${wardSummary.sleep_hours}h` : '—'}
              />
            </div>

            {/* Health Vitals */}
            <div className="bg-neutral-800/50 rounded-xl border border-neutral-700/50 p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Heart size={18} className="text-red-400" /> Health Vitals
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <VitalCard label="Weight" value={wardSummary.weight} unit="kg" icon={<Scale size={16} />} color="text-green-400" />
                <VitalCard
                  label="Blood Pressure"
                  value={wardSummary.bp_systolic && wardSummary.bp_diastolic ? `${wardSummary.bp_systolic}/${wardSummary.bp_diastolic}` : null}
                  unit="mmHg"
                  icon={<Activity size={16} />}
                  color="text-red-400"
                />
                <VitalCard label="Blood Sugar" value={wardSummary.blood_sugar} unit="mg/dL" icon={<Droplets size={16} />} color="text-purple-400" />
                <VitalCard label="Heart Rate" value={wardSummary.heart_rate} unit="bpm" icon={<Heart size={16} />} color="text-pink-400" />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className={`flex items-center gap-2 p-3 rounded-lg ${wardSummary.workout ? 'bg-green-500/10 text-green-400' : 'bg-neutral-700/30 text-gray-500'}`}>
                  <Dumbbell size={16} />
                  <span className="text-sm font-medium">{wardSummary.workout ? '✅ Worked out' : '❌ No workout'}</span>
                </div>
                <div className={`flex items-center gap-2 p-3 rounded-lg ${wardSummary.junk_food ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                  <UtensilsCrossed size={16} />
                  <span className="text-sm font-medium">{wardSummary.junk_food ? '🍔 Had junk food' : '🥗 No junk food'}</span>
                </div>
              </div>
            </div>

            {/* Medicines */}
            <div className="bg-neutral-800/50 rounded-xl border border-neutral-700/50 p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Pill size={18} className="text-blue-400" /> Medicines
              </h3>
              {wardSummary.medicines.length === 0 ? (
                <p className="text-gray-500 text-sm">No medicines configured</p>
              ) : (
                <div className="space-y-2">
                  {wardSummary.medicines.map((med, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${
                      med.taken
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}>
                      <div>
                        <span className="text-white font-medium">{med.medicine_name}</span>
                        {med.dosage && <span className="text-gray-400 text-sm ml-2">({med.dosage})</span>}
                        {med.reminder_time && <span className="text-gray-500 text-xs ml-2">⏰ {med.reminder_time}</span>}
                      </div>
                      <span className={`text-sm font-bold ${med.taken ? 'text-green-400' : 'text-red-400'}`}>
                        {med.taken ? '✅ Taken' : '❌ Missed'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Events */}
            <div className="bg-neutral-800/50 rounded-xl border border-neutral-700/50 p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-amber-400" /> Events
              </h3>
              {wardSummary.events.length === 0 ? (
                <p className="text-gray-500 text-sm">No events for this day</p>
              ) : (
                <div className="space-y-2">
                  {wardSummary.events.map((ev, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-neutral-700/30 border border-neutral-600/30">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ev.color || '#6366f1' }} />
                        <span className="text-white">{ev.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="capitalize">{ev.type}</span>
                        {ev.time && <span>🕐 {ev.time}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 7-Day History */}
            {wardHistory && (
              <div className="bg-neutral-800/50 rounded-xl border border-neutral-700/50 p-5">
                <h3 className="text-white font-semibold mb-4">📊 Last 7 Days</h3>
                <div className="grid grid-cols-7 gap-2">
                  {wardHistory.days.map((day, i) => {
                    const d = new Date(day.date);
                    const dayLabel = d.toLocaleDateString('en', { weekday: 'short' });
                    const allMedsTaken = day.medicines.length > 0 && day.medicines.every(m => m.taken);
                    const someMedsTaken = day.medicines.some(m => m.taken);
                    return (
                      <div
                        key={i}
                        className={`rounded-lg p-2 text-center text-xs border ${
                          day.has_log
                            ? 'bg-indigo-500/10 border-indigo-500/30'
                            : 'bg-neutral-700/20 border-neutral-600/20'
                        }`}
                      >
                        <div className="text-gray-400 font-bold">{dayLabel}</div>
                        <div className="text-lg mt-1">{day.mood ? (MOOD_EMOJI[day.mood] || '❓') : '—'}</div>
                        <div className="mt-1">
                          {day.has_log && (
                            <span className="text-indigo-300">{day.life_score ?? '—'}</span>
                          )}
                        </div>
                        <div className="mt-1 text-[10px]">
                          {day.medicines.length > 0 ? (
                            allMedsTaken ? (
                              <span className="text-green-400">💊✓</span>
                            ) : someMedsTaken ? (
                              <span className="text-yellow-400">💊~</span>
                            ) : (
                              <span className="text-red-400">💊✗</span>
                            )
                          ) : null}
                          {day.workout && <span className="ml-1 text-green-400">💪</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">No data available for this date</div>
        )}
      </div>
    );
  }

  // --- Main Care Page ---
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
              <Users size={22} className="text-white" />
            </div>
            Care
          </h1>
          <p className="text-gray-400 mt-1">Share health data with family & caretakers</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <UserPlus size={16} />
          Add Caretaker
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-4 text-sm">{success}</div>
      )}

      {/* Add Caretaker Form */}
      {showAddForm && (
        <form onSubmit={handleAddLink} className="bg-neutral-800/50 rounded-xl border border-neutral-700/50 p-5 mb-6">
          <h3 className="text-white font-semibold mb-4">Share your data with someone</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="text-gray-400 text-sm mb-1 block">Their Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-neutral-700/50 border border-neutral-600 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full bg-neutral-700/50 border border-neutral-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {RELATIONSHIPS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={adding}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {adding ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-3">
            The other user must have a LifeOS account. They'll need to accept before they can see your data.
          </p>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-800/50 rounded-xl p-1 mb-6 border border-neutral-700/50">
        <button
          onClick={() => setTab('sharing')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'sharing' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Shield size={14} className="inline mr-1.5" />
          I'm Sharing With ({myLinks.length})
        </button>
        <button
          onClick={() => setTab('wards')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'wards' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Eye size={14} className="inline mr-1.5" />
          I'm Caring For ({wards.filter(w => w.status === 'active').length})
          {wards.filter(w => w.status === 'pending').length > 0 && (
            <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {wards.filter(w => w.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : tab === 'sharing' ? (
        /* My Links - People I'm sharing with */
        <div className="space-y-3">
          {myLinks.length === 0 ? (
            <div className="text-center py-12 bg-neutral-800/30 rounded-xl border border-neutral-700/30">
              <Shield size={40} className="mx-auto text-gray-600 mb-3" />
              <p className="text-gray-500">You haven't shared your data with anyone yet</p>
              <p className="text-gray-600 text-sm mt-1">Tap "Add Caretaker" to share with a family member</p>
            </div>
          ) : (
            myLinks.map(link => (
              <div key={link.id} className="bg-neutral-800/50 rounded-xl border border-neutral-700/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                    <span className="text-lg">{RELATIONSHIPS.find(r => r.value === link.relationship)?.label.split(' ')[0] || '👤'}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{link.caretaker_name}</p>
                    <p className="text-gray-500 text-sm">{link.caretaker_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    link.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    link.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {link.status === 'active' ? '✅ Active' : link.status === 'pending' ? '⏳ Pending' : link.status}
                  </span>
                  <button
                    onClick={() => handleRemoveLink(link.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors p-1"
                    title="Remove"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Wards - People sharing with me */
        <div className="space-y-3">
          {wards.length === 0 ? (
            <div className="text-center py-12 bg-neutral-800/30 rounded-xl border border-neutral-700/30">
              <Eye size={40} className="mx-auto text-gray-600 mb-3" />
              <p className="text-gray-500">No one is sharing their data with you yet</p>
              <p className="text-gray-600 text-sm mt-1">Ask a loved one to add your email as their caretaker</p>
            </div>
          ) : (
            wards.map(ward => (
              <div key={ward.id} className="bg-neutral-800/50 rounded-xl border border-neutral-700/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center">
                      <span className="text-lg">{RELATIONSHIPS.find(r => r.value === ward.relationship)?.label.split(' ')[0] || '👤'}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{ward.user_name}</p>
                      <p className="text-gray-500 text-sm">{ward.user_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {ward.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleRespond(ward.id, 'active')}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Check size={14} /> Accept
                        </button>
                        <button
                          onClick={() => handleRespond(ward.id, 'declined')}
                          className="flex items-center gap-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          <X size={14} /> Decline
                        </button>
                      </>
                    ) : ward.status === 'active' ? (
                      <>
                        <button
                          onClick={() => viewWardDetail(ward)}
                          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Eye size={14} /> View Health
                        </button>
                        <button
                          onClick={() => handleRemoveLink(ward.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors p-1"
                          title="Remove"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm">{ward.status}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Helper components
function StatBox({ icon, label, value }) {
  return (
    <div className="bg-neutral-800/50 rounded-xl border border-neutral-700/50 p-4 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-gray-400 text-xs uppercase tracking-wider">{label}</p>
      <p className="text-white font-bold text-lg mt-1">{value}</p>
    </div>
  );
}

function VitalCard({ label, value, unit, icon, color }) {
  return (
    <div className="bg-neutral-700/30 rounded-lg p-3">
      <div className={`flex items-center gap-1.5 text-sm ${color} mb-1`}>
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <p className="text-white font-bold text-lg">
        {value ?? '—'}
        {value && <span className="text-gray-500 text-xs ml-1">{unit}</span>}
      </p>
    </div>
  );
}
