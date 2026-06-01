import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import {
  ChevronLeft, ChevronRight, Plus, Pill, X, Trash2, Bell, BellOff,
  Check, Clock, Pencil, Camera, Activity, CalendarDays
} from 'lucide-react';

// ── Color map for events ──
const EVENT_COLORS = [
  { value: 'indigo', bg: 'bg-indigo-500', light: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-400', chip: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' },
  { value: 'red',    bg: 'bg-red-500',    light: 'bg-red-100 dark:bg-red-900/30',    text: 'text-red-700 dark:text-red-300',    dot: 'bg-red-400',    chip: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' },
  { value: 'emerald',bg: 'bg-emerald-500',light: 'bg-emerald-100 dark:bg-emerald-900/30',text: 'text-emerald-700 dark:text-emerald-300',dot:'bg-emerald-400',chip:'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' },
  { value: 'amber',  bg: 'bg-amber-500',  light: 'bg-amber-100 dark:bg-amber-900/30',  text: 'text-amber-700 dark:text-amber-300',  dot: 'bg-amber-400',  chip: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' },
  { value: 'pink',   bg: 'bg-pink-500',   light: 'bg-pink-100 dark:bg-pink-900/30',   text: 'text-pink-700 dark:text-pink-300',   dot: 'bg-pink-400',   chip: 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300' },
  { value: 'purple', bg: 'bg-purple-500', light: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-400', chip: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' },
  { value: 'cyan',   bg: 'bg-cyan-500',   light: 'bg-cyan-100 dark:bg-cyan-900/30',   text: 'text-cyan-700 dark:text-cyan-300',   dot: 'bg-cyan-400',   chip: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300' },
];

const FREQUENCIES = ['Daily', 'Twice Daily', 'Three Times Daily', 'Weekly', 'As Needed'];

const getColorObj = (c) => EVENT_COLORS.find(ec => ec.value === c) || EVENT_COLORS[0];

const CalendarPage = () => {
  const [currentDate, setCurrentDate]     = useState(new Date());
  const [events, setEvents]               = useState([]);
  const [medicines, setMedicines]         = useState([]);
  const [selectedDate, setSelectedDate]   = useState(new Date().getDate());
  const [viewMode, setViewMode]           = useState('monthly'); // 'monthly' | 'daily'
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMedModal, setShowMedModal]   = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [editingEvent, setEditingEvent]   = useState(null);
  const [editingMed, setEditingMed]       = useState(null);
  const [medPhoto, setMedPhoto]           = useState(null);
  const [medPhotoPreview, setMedPhotoPreview] = useState(null);
  const [removeMedPhoto, setRemoveMedPhoto] = useState(false);

  const [eventForm, setEventForm] = useState({
    title: '', description: '', event_type: 'personal',
    event_date: new Date().toISOString().split('T')[0],
    event_time: '', color: 'indigo'
  });
  const [medForm, setMedForm] = useState({
    name: '', dosage: '', frequency: 'Daily', reminder_time: '08:00'
  });

  const notifTimersRef = useRef([]);
  const notificationSoundRef = useRef(null);

  useEffect(() => {
    notificationSoundRef.current = new Audio('/notification.mp3');
    notificationSoundRef.current.volume = 0.7;
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const saved = localStorage.getItem('notificationsEnabled');
      if (saved === 'true') setNotificationsEnabled(true);
    }
  }, []);

  useEffect(() => { fetchEvents(); fetchMedicines(); }, [currentDate]);

  useEffect(() => {
    if (!notificationsEnabled || medicines.length === 0) return;
    notifTimersRef.current.forEach(t => clearTimeout(t));
    notifTimersRef.current = [];
    const now = new Date();
    medicines.forEach(med => {
      if (!med.reminder_time || med.taken_today) return;
      const [h, m] = med.reminder_time.split(':').map(Number);
      const t = new Date(); t.setHours(h, m, 0, 0);
      let diff = t - now;
      if (diff < 0) diff += 86400000;
      if (diff > 0 && diff < 86400000) {
        const timer = setTimeout(() => {
          notificationSoundRef.current?.play().catch(() => {});
          new Notification('💊 Medicine Reminder', {
            body: `Take ${med.name}${med.dosage ? ` (${med.dosage})` : ''}`,
            tag: `med-${med.id}`
          });
        }, diff);
        notifTimersRef.current.push(timer);
      }
    });
    return () => notifTimersRef.current.forEach(t => clearTimeout(t));
  }, [notificationsEnabled, medicines]);

  const fetchEvents = async () => {
    try {
      const year = currentDate.getFullYear(), month = currentDate.getMonth();
      const start = new Date(year, month, 1).toISOString().split('T')[0];
      const end   = new Date(year, month + 1, 0).toISOString().split('T')[0];
      const res = await api.get(`/calendar/events?start_date=${start}&end_date=${end}`);
      setEvents(res.data);
    } catch {}
  };

  const fetchMedicines = async () => {
    try { const res = await api.get('/calendar/medicines'); setMedicines(res.data); } catch {}
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) { await api.put(`/calendar/events/${editingEvent.id}`, eventForm); setEditingEvent(null); }
      else              { await api.post('/calendar/events', eventForm); }
      setShowEventModal(false);
      setEventForm({ title: '', description: '', event_type: 'personal', event_date: new Date().toISOString().split('T')[0], event_time: '', color: 'indigo' });
      fetchEvents();
    } catch {}
  };

  const startEditEvent = (ev) => {
    setEditingEvent(ev);
    setEventForm({ title: ev.title, description: ev.description || '', event_type: ev.event_type, event_date: ev.event_date, event_time: ev.event_time || '', color: ev.color || 'indigo' });
    setShowEventModal(true);
  };

  const deleteEvent = async (id) => { try { await api.delete(`/calendar/events/${id}`); fetchEvents(); } catch {} };

  const handleCreateMedicine = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', medForm.name);
      if (medForm.dosage)        fd.append('dosage', medForm.dosage);
      if (medForm.frequency)     fd.append('frequency', medForm.frequency);
      if (medForm.reminder_time) fd.append('reminder_time', medForm.reminder_time);
      if (medPhoto)              fd.append('photo', medPhoto);
      if (editingMed) {
        if (removeMedPhoto) fd.append('remove_photo', 'true');
        await api.put(`/calendar/medicines/${editingMed.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setEditingMed(null);
      } else {
        await api.post('/calendar/medicines', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowMedModal(false);
      setMedForm({ name: '', dosage: '', frequency: 'Daily', reminder_time: '08:00' });
      setMedPhoto(null); setMedPhotoPreview(null); setRemoveMedPhoto(false);
      fetchMedicines();
    } catch {}
  };

  const startEditMedicine = (med) => {
    setEditingMed(med);
    setMedForm({ name: med.name, dosage: med.dosage || '', frequency: med.frequency || 'Daily', reminder_time: med.reminder_time || '08:00' });
    setMedPhoto(null); setRemoveMedPhoto(false);
    setMedPhotoPreview(med.photo_url ? `${api.defaults.baseURL}/calendar/medicines/photo/${med.photo_url}` : null);
    setShowMedModal(true);
  };

  const deleteMedicine = async (id) => { try { await api.delete(`/calendar/medicines/${id}`); fetchMedicines(); } catch {} };

  const toggleMedicineTaken = async (med) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await api.post('/calendar/medicines/log', { medicine_id: med.id, taken: !med.taken_today, date: today });
      setMedicines(prev => prev.map(m => m.id === med.id ? { ...m, taken_today: !m.taken_today } : m));
    } catch {}
  };

  const enableNotifications = async () => {
    if (!('Notification' in window)) { alert('Notifications not supported'); return; }
    let perm = Notification.permission;
    if (perm === 'default') perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setNotificationsEnabled(true);
      localStorage.setItem('notificationsEnabled', 'true');
      try { const { subscribeToPush } = await import('../services/pushNotifications'); await subscribeToPush(); } catch {}
    } else if (perm === 'denied') {
      alert('Notifications blocked. Enable in browser settings.');
    }
  };

  const disableNotifications = () => {
    setNotificationsEnabled(false);
    localStorage.setItem('notificationsEnabled', 'false');
    notifTimersRef.current.forEach(t => clearTimeout(t));
    notifTimersRef.current = [];
  };

  // ── Calendar helpers ──
  const year = currentDate.getFullYear(), month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getEventsForDay = (day) => {
    const d = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return events.filter(e => e.event_date === d);
  };

  const isToday = (day) => {
    const now = new Date();
    return day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));

  const todayStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(selectedDate).padStart(2,'0')}`;
  const selectedDayEvents = events.filter(e => e.event_date === todayStr);

  // ── Build timeline entries (events + med reminders) ──
  const timelineEntries = [
    ...selectedDayEvents.map(ev => ({
      time: ev.event_time || '00:00',
      type: 'event',
      data: ev,
      sortKey: ev.event_time || '00:00',
    })),
    ...medicines.filter(m => m.reminder_time).map(med => ({
      time: med.reminder_time,
      type: 'medicine',
      data: med,
      sortKey: med.reminder_time,
    })),
  ].sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  const medsTaken = medicines.filter(m => m.taken_today).length;
  const medsTotal = medicines.length;

  const closeEventModal = () => {
    setShowEventModal(false); setEditingEvent(null);
    setEventForm({ title: '', description: '', event_type: 'personal', event_date: new Date().toISOString().split('T')[0], event_time: '', color: 'indigo' });
  };
  const closeMedModal = () => {
    setShowMedModal(false); setEditingMed(null);
    setMedForm({ name: '', dosage: '', frequency: 'Daily', reminder_time: '08:00' });
    setMedPhoto(null); setMedPhotoPreview(null); setRemoveMedPhoto(false);
  };

  const fmtTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${ampm}`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f6f8f8] dark:bg-[#102220] transition-colors duration-300">

      <main className="flex-1 flex flex-col p-6 gap-6 max-w-7xl mx-auto w-full">

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Calendar & Care Schedule</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage medical appointments and medication routines.</p>
          </div>
          <div className="flex gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-[#0d968b]/10">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'monthly' ? 'bg-[#0d968b] text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              Monthly View
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'daily' ? 'bg-[#0d968b] text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              Daily Schedule
            </button>
          </div>
        </div>

        {/* ── Split Pane ── */}
        <div className="flex flex-col lg:flex-row gap-6 min-h-[750px]">

          {/* ════ LEFT — Calendar ════ */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-[#0d968b]/10 p-6 flex flex-col shadow-sm">
            {/* Calendar header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{monthName}</h3>
                <div className="flex gap-1">
                  <button onClick={prevMonth} className="p-1 text-slate-400 hover:text-[#0d968b] transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={nextMonth} className="p-1 text-slate-400 hover:text-[#0d968b] transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => { setShowEventModal(true); setEventForm(f => ({ ...f, event_date: todayStr })); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0d968b]/10 text-[#0d968b] rounded-lg font-bold text-sm hover:bg-[#0d968b]/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Event</span>
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 flex-1">
              {/* Day headers */}
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="bg-slate-50 dark:bg-slate-900 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {d}
                </div>
              ))}

              {/* Empty prefix cells */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e-${i}`} className="bg-white dark:bg-slate-900 min-h-[90px] p-2 text-slate-300 dark:text-slate-700 text-sm">
                  {/* prev month spillover if needed */}
                </div>
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const today = isToday(day);
                const selected = selectedDate === day;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`bg-white dark:bg-slate-900 min-h-[90px] p-2 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/70 ${
                      today   ? 'bg-[#0d968b]/5 dark:bg-[#0d968b]/10 border-2 border-[#0d968b]' : ''
                    } ${selected && !today ? 'ring-2 ring-[#0d968b]/40' : ''}`}
                  >
                    <span className={`text-sm font-semibold block mb-1 ${
                      today   ? 'text-[#0d968b] font-bold' :
                      selected? 'text-[#0d968b]' :
                                'text-slate-500 dark:text-slate-400'
                    }`}>{day}</span>
                    <div className="flex flex-col gap-0.5">
                      {dayEvents.slice(0, 2).map((ev, idx) => {
                        const col = getColorObj(ev.color);
                        return (
                          <div key={idx} className={`${col.chip} text-[10px] rounded px-1 py-0.5 font-bold truncate leading-tight`}>
                            {ev.event_time ? fmtTime(ev.event_time) + ' ' : ''}{ev.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <span className="text-[9px] text-slate-400 font-bold">+{dayEvents.length - 2} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ════ RIGHT — Meds + Timeline ════ */}
          <div className="w-full lg:w-[400px] flex flex-col gap-6">

            {/* ── Medication Block ── */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#0d968b]/10 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Pill className="text-[#0d968b] w-5 h-5" />
                  Medication
                </h3>
                <div className="flex items-center gap-3">
                  {medsTotal > 0 && (
                    <span className="text-xs text-slate-400 font-semibold">{medsTaken}/{medsTotal} taken</span>
                  )}
                  {/* Reminder toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationsEnabled}
                      onChange={notificationsEnabled ? disableNotifications : enableNotifications}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0d968b] relative"></div>
                    <span className="ml-2 text-xs font-bold text-slate-500 dark:text-slate-400">Reminders</span>
                  </label>
                </div>
              </div>

              {/* Progress bar */}
              {medsTotal > 0 && (
                <div className="mb-4">
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0d968b] rounded-full transition-all duration-500"
                      style={{ width: `${(medsTaken / medsTotal) * 100}%` }} />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {medicines.length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-4">No medicines added yet.</p>
                )}
                {medicines.map(med => {
                  const colors = ['bg-[#0d968b]', 'bg-orange-400', 'bg-blue-400', 'bg-purple-400'];
                  const bgColor = colors[medicines.indexOf(med) % colors.length];
                  return (
                    <div
                      key={med.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border transition-all group ${
                        med.taken_today
                          ? 'border-[#0d968b]/20 bg-[#0d968b]/5 dark:bg-[#0d968b]/10 opacity-75'
                          : 'border-[#0d968b]/10 bg-white dark:bg-slate-800 hover:border-[#0d968b]/30'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-lg ${bgColor} text-white flex items-center justify-center shrink-0`}>
                        {med.photo_url ? (
                          <img src={`${api.defaults.baseURL}/calendar/medicines/photo/${med.photo_url}`}
                            alt={med.name} className="w-full h-full rounded-lg object-cover" />
                        ) : (
                          <Pill className="w-5 h-5" />
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${med.taken_today ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {med.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {med.dosage && <span>{med.dosage}</span>}
                          {med.dosage && med.reminder_time && <span>•</span>}
                          {med.reminder_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {fmtTime(med.reminder_time)}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                          <button onClick={() => startEditMedicine(med)} className="text-slate-400 hover:text-[#0d968b] p-1 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteMedicine(med.id)} className="text-slate-400 hover:text-red-500 p-1 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => toggleMedicineTaken(med)}
                          className={`${med.taken_today ? 'text-[#0d968b]' : 'text-slate-300 dark:text-slate-600 hover:text-[#0d968b]'} transition-colors`}
                        >
                          {med.taken_today
                            ? <Check className="w-5 h-5" />
                            : <div className="w-5 h-5 rounded-full border-2 border-current" />
                          }
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Add med button */}
                <button
                  onClick={() => setShowMedModal(true)}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:border-[#0d968b] hover:text-[#0d968b] transition-all text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" /> Add Medicine
                </button>
              </div>
            </div>

            {/* ── Today's Timeline ── */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-[#0d968b]/10 p-5 shadow-sm flex flex-col overflow-hidden">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 shrink-0">
                <CalendarDays className="text-[#0d968b] w-5 h-5" />
                {isToday(selectedDate) ? "Today's" : `${currentDate.toLocaleString('default', { month: 'short' })} ${selectedDate},`} Timeline
              </h3>

              <div className="flex-1 overflow-y-auto pr-1 space-y-5" style={{ scrollbarWidth: 'none' }}>
                {timelineEntries.length === 0 && (
                  <div className="text-center py-10">
                    <Activity className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No events scheduled for this day.</p>
                    <button
                      onClick={() => { setShowEventModal(true); setEventForm(f => ({ ...f, event_date: todayStr })); }}
                      className="text-[#0d968b] text-xs mt-2 hover:underline font-semibold"
                    >
                      + Add Event
                    </button>
                  </div>
                )}

                {timelineEntries.map((entry, idx) => {
                  if (entry.type === 'event') {
                    const ev = entry.data;
                    const col = getColorObj(ev.color);
                    const isAppointment = ev.event_type === 'appointment';
                    const dotColor = isAppointment ? 'bg-blue-500 ring-blue-500/20' : ev.event_type === 'reminder' ? 'bg-[#0d968b] ring-[#0d968b]/20' : 'bg-slate-400';
                    const cardClass = isAppointment
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'
                      : ev.event_type === 'reminder'
                        ? 'bg-[#0d968b]/5 dark:bg-[#0d968b]/10 border-[#0d968b]/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700';
                    const labelColor = isAppointment ? 'text-blue-600 dark:text-blue-400' : 'text-[#0d968b]';

                    return (
                      <div key={`ev-${ev.id}`} className="flex gap-4">
                        <div className="w-14 text-right shrink-0">
                          <p className="text-xs font-bold text-slate-400">
                            {ev.event_time ? fmtTime(ev.event_time) : '—'}
                          </p>
                        </div>
                        <div className="relative flex-1 pb-4 border-l border-slate-100 dark:border-slate-800 pl-6">
                          <div className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full ring-4 ${dotColor}`}></div>
                          <div className={`p-3 ${cardClass} rounded-lg border group`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`text-xs font-bold ${labelColor} mb-1 uppercase tracking-wider`}>
                                  {ev.event_type === 'appointment' ? 'Medical Appointment' : ev.event_type === 'reminder' ? 'Reminder' : 'Event'}
                                </p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{ev.title}</p>
                                {ev.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{ev.description}</p>}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all ml-2">
                                <button onClick={() => startEditEvent(ev)} className="text-slate-400 hover:text-[#0d968b] p-1">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => deleteEvent(ev.id)} className="text-slate-400 hover:text-red-500 p-1">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // Medicine reminder
                    const med = entry.data;
                    return (
                      <div key={`med-${med.id}`} className="flex gap-4">
                        <div className="w-14 text-right shrink-0">
                          <p className="text-xs font-bold text-slate-400">{fmtTime(med.reminder_time)}</p>
                        </div>
                        <div className="relative flex-1 pb-4 border-l border-slate-100 dark:border-slate-800 pl-6">
                          <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-500/20"></div>
                          <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                            <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              {med.name} {med.dosage && <span className="text-slate-400 font-normal text-xs">({med.dosage})</span>}
                              <Bell className="w-3.5 h-3.5 text-amber-500" />
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">Medication Reminder</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ════ Add/Edit Event Modal ════ */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingEvent ? 'Edit Event' : 'New Event'}</h2>
              <button onClick={closeEventModal} className="text-slate-400 hover:text-slate-600 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Title</label>
                <input type="text" placeholder="Event title" value={eventForm.title} required
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm focus:border-[#0d968b] focus:ring-1 focus:ring-[#0d968b] outline-none transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Description</label>
                <textarea placeholder="Optional..." value={eventForm.description}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm focus:border-[#0d968b] focus:ring-1 focus:ring-[#0d968b] outline-none transition-all resize-none" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Date</label>
                  <input type="date" value={eventForm.event_date} required
                    onChange={e => setEventForm({ ...eventForm, event_date: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm focus:border-[#0d968b] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Time</label>
                  <input type="time" value={eventForm.event_time}
                    onChange={e => setEventForm({ ...eventForm, event_time: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm focus:border-[#0d968b] outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Type</label>
                <div className="flex gap-2 flex-wrap">
                  {['personal','appointment','reminder'].map(t => (
                    <button key={t} type="button"
                      onClick={() => setEventForm({ ...eventForm, event_type: t })}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                        eventForm.event_type === t ? 'bg-[#0d968b] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Color</label>
                <div className="flex gap-2">
                  {EVENT_COLORS.map(c => (
                    <button key={c.value} type="button"
                      onClick={() => setEventForm({ ...eventForm, color: c.value })}
                      className={`w-7 h-7 rounded-full ${c.bg} transition-all ${
                        eventForm.color === c.value ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-slate-400 scale-110' : 'opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeEventModal}
                  className="flex-1 text-slate-500 py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-[#0d968b] hover:bg-[#0b857b] text-white py-3 rounded-xl font-bold transition-colors">
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════ Add/Edit Medicine Modal ════ */}
      {showMedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingMed ? 'Edit Medicine' : 'Add Medicine'}</h2>
              <button onClick={closeMedModal} className="text-slate-400 hover:text-slate-600 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateMedicine} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Medicine Name</label>
                <input type="text" placeholder="e.g., Vitamin D3" value={medForm.name} required
                  onChange={e => setMedForm({ ...medForm, name: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm focus:border-[#0d968b] focus:ring-1 focus:ring-[#0d968b] outline-none transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Dosage</label>
                <input type="text" placeholder="e.g., 10mg or 1 tablet" value={medForm.dosage}
                  onChange={e => setMedForm({ ...medForm, dosage: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm focus:border-[#0d968b] focus:ring-1 focus:ring-[#0d968b] outline-none transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Camera className="w-3 h-3" /> Photo (optional)
                </label>
                {(medPhotoPreview && !removeMedPhoto) ? (
                  <div className="relative inline-block">
                    <img src={medPhotoPreview} alt="Medicine" className="w-20 h-20 rounded-xl object-cover border border-slate-200" />
                    <button type="button" onClick={() => { setMedPhoto(null); setMedPhotoPreview(null); setRemoveMedPhoto(true); }}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5 text-white hover:bg-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <input type="file" accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) { setMedPhoto(file); setMedPhotoPreview(URL.createObjectURL(file)); setRemoveMedPhoto(false); }
                    }}
                    className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl px-4 py-2.5 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#0d968b] file:text-white file:text-xs file:cursor-pointer hover:file:bg-[#0b857b]" />
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Frequency</label>
                <div className="flex flex-wrap gap-2">
                  {FREQUENCIES.map(f => (
                    <button key={f} type="button"
                      onClick={() => setMedForm({ ...medForm, frequency: f })}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        medForm.frequency === f ? 'bg-[#0d968b] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700'
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Bell className="w-3 h-3" /> Reminder Time
                </label>
                <input type="time" value={medForm.reminder_time}
                  onChange={e => setMedForm({ ...medForm, reminder_time: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm focus:border-[#0d968b] outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeMedModal}
                  className="flex-1 text-slate-500 py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-[#0d968b] hover:bg-[#0b857b] text-white py-3 rounded-xl font-bold transition-colors">
                  {editingMed ? 'Save Changes' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
