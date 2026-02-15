import React, { useEffect, useState, useRef, useCallback } from 'react';
import api from '../services/api';
import { ChevronLeft, ChevronRight, Plus, Pill, X, Trash2, Bell, BellOff, Check, Clock } from 'lucide-react';

const EVENT_COLORS = [
  { value: 'indigo', bg: 'bg-indigo-500', light: 'bg-indigo-500/15', text: 'text-indigo-400', dot: 'bg-indigo-400' },
  { value: 'red', bg: 'bg-red-500', light: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
  { value: 'emerald', bg: 'bg-emerald-500', light: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  { value: 'amber', bg: 'bg-amber-500', light: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
  { value: 'pink', bg: 'bg-pink-500', light: 'bg-pink-500/15', text: 'text-pink-400', dot: 'bg-pink-400' },
  { value: 'purple', bg: 'bg-purple-500', light: 'bg-purple-500/15', text: 'text-purple-400', dot: 'bg-purple-400' },
  { value: 'cyan', bg: 'bg-cyan-500', light: 'bg-cyan-500/15', text: 'text-cyan-400', dot: 'bg-cyan-400' },
];

const FREQUENCIES = ['Daily', 'Twice Daily', 'Three Times Daily', 'Weekly', 'As Needed'];

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMedModal, setShowMedModal] = useState(false);
  const [activeTab, setActiveTab] = useState('events'); // events | medicines
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const [eventForm, setEventForm] = useState({
    title: '', description: '', event_type: 'personal',
    event_date: new Date().toISOString().split('T')[0],
    event_time: '', color: 'indigo'
  });
  const [medForm, setMedForm] = useState({
    name: '', dosage: '', frequency: 'Daily', reminder_time: '08:00'
  });

  const notifTimersRef = useRef([]);

  useEffect(() => {
    fetchEvents();
    fetchMedicines();
  }, [currentDate]);

  // Medicine reminder notifications
  useEffect(() => {
    if (!notificationsEnabled || medicines.length === 0) return;

    // Clear previous timers
    notifTimersRef.current.forEach(t => clearTimeout(t));
    notifTimersRef.current = [];

    const now = new Date();
    medicines.forEach(med => {
      if (!med.reminder_time || med.taken_today) return;
      const [hours, minutes] = med.reminder_time.split(':').map(Number);
      const reminderDate = new Date();
      reminderDate.setHours(hours, minutes, 0, 0);

      let diff = reminderDate.getTime() - now.getTime();
      if (diff < 0) diff += 24 * 60 * 60 * 1000; // schedule for tomorrow if past

      // Only schedule if within 24h
      if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
        const timer = setTimeout(() => {
          new Notification('💊 Medicine Reminder', {
            body: `Time to take ${med.name}${med.dosage ? ` (${med.dosage})` : ''}`,
            icon: '💊',
            tag: `med-${med.id}`,
          });
        }, diff);
        notifTimersRef.current.push(timer);
      }
    });

    return () => notifTimersRef.current.forEach(t => clearTimeout(t));
  }, [notificationsEnabled, medicines]);

  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Your browser does not support notifications');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      new Notification('🔔 Notifications Enabled', {
        body: 'You\'ll receive medicine reminders on time!',
      });
    }
  };

  const fetchEvents = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const start = new Date(year, month, 1).toISOString().split('T')[0];
      const end = new Date(year, month + 1, 0).toISOString().split('T')[0];
      const res = await api.get(`/calendar/events?start_date=${start}&end_date=${end}`);
      setEvents(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/calendar/medicines');
      setMedicines(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/calendar/events', eventForm);
      setShowEventModal(false);
      setEventForm({ title: '', description: '', event_type: 'personal', event_date: new Date().toISOString().split('T')[0], event_time: '', color: 'indigo' });
      fetchEvents();
    } catch (err) { console.error(err); }
  };

  const deleteEvent = async (id) => {
    try {
      await api.delete(`/calendar/events/${id}`);
      fetchEvents();
    } catch (err) { console.error(err); }
  };

  const handleCreateMedicine = async (e) => {
    e.preventDefault();
    try {
      await api.post('/calendar/medicines', medForm);
      setShowMedModal(false);
      setMedForm({ name: '', dosage: '', frequency: 'Daily', reminder_time: '08:00' });
      fetchMedicines();
    } catch (err) { console.error(err); }
  };

  const deleteMedicine = async (id) => {
    try {
      await api.delete(`/calendar/medicines/${id}`);
      fetchMedicines();
    } catch (err) { console.error(err); }
  };

  const toggleMedicineTaken = async (med) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await api.post('/calendar/medicines/log', {
        medicine_id: med.id,
        taken: !med.taken_today,
        date: today
      });
      setMedicines(medicines.map(m =>
        m.id === med.id ? { ...m, taken_today: !m.taken_today } : m
      ));
    } catch (err) { console.error(err); }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getEventsForDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.event_date === dateStr);
  };

  const getColorObj = (c) => EVENT_COLORS.find(ec => ec.value === c) || EVENT_COLORS[0];

  const isToday = (day) => {
    const now = new Date();
    return day === now.getDate() && currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear();
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  const goToToday = () => { setCurrentDate(new Date()); setSelectedDate(new Date().getDate()); };

  const selectedDateStr = selectedDate ?
    `${currentDate.toLocaleString('default', { month: 'short' })} ${selectedDate}, ${currentDate.getFullYear()}` :
    'Select a day';

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  const medsTaken = medicines.filter(m => m.taken_today).length;
  const medsTotal = medicines.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Calendar</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1">Events & medicine reminders</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button onClick={goToToday}
            className="flex-1 sm:flex-none px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors">
            Today
          </button>
          <button onClick={() => { setShowEventModal(true); setEventForm(f => ({ ...f, event_date: selectedDate ? `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate).padStart(2,'0')}` : new Date().toISOString().split('T')[0] })); }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all">
            <Plus size={14} /> Event
          </button>
          <button onClick={() => setShowMedModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all">
            <Pill size={14} /> Med
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-neutral-800/50 rounded-2xl p-4 sm:p-6 border border-neutral-700/50">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button onClick={prevMonth} className="p-1.5 sm:p-2 hover:bg-neutral-700 rounded-lg transition-colors">
              <ChevronLeft size={18} className="text-gray-400" />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-white">{monthName}</h2>
            <button onClick={nextMonth} className="p-1.5 sm:p-2 hover:bg-neutral-700 rounded-lg transition-colors">
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>


          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs text-gray-500 font-medium py-2">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const today = isToday(day);
              const selected = selectedDate === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all relative group
                    ${today && !selected ? 'bg-indigo-600/20 text-indigo-400 font-bold ring-1 ring-indigo-500/50' : ''}
                    ${selected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105' : 'text-gray-300 hover:bg-neutral-700/50'}
                  `}
                >
                  <span className={`${today ? 'font-bold' : ''}`}>{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((ev, idx) => (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full ${getColorObj(ev.color).dot}`} />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[8px] text-gray-400">+{dayEvents.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Tab switcher */}
          <div className="flex bg-neutral-800/50 rounded-xl p-1 border border-neutral-700/50">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'events' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              📅 Events
            </button>
            <button
              onClick={() => setActiveTab('medicines')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'medicines' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              💊 Medicines {medsTotal > 0 && `(${medsTaken}/${medsTotal})`}
            </button>
          </div>

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="bg-neutral-800/50 rounded-2xl p-5 border border-neutral-700/50">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
                <span>{selectedDateStr}</span>
                {selectedDate && (
                  <button
                    onClick={() => { setShowEventModal(true); setEventForm(f => ({ ...f, event_date: `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate).padStart(2,'0')}` })); }}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </h3>

              {selectedDayEvents.length > 0 ? (
                <div className="space-y-2">
                  {selectedDayEvents.map((ev) => {
                    const col = getColorObj(ev.color);
                    return (
                      <div key={ev.id} className={`${col.light} rounded-xl p-3 group relative`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                              <p className={`text-sm font-medium ${col.text}`}>{ev.title}</p>
                            </div>
                            {ev.description && (
                              <p className="text-gray-400 text-xs mt-1 ml-4">{ev.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5 ml-4">
                              <span className="text-[10px] text-gray-500 capitalize">{ev.event_type}</span>
                              {ev.event_time && (
                                <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                                  <Clock size={8} /> {ev.event_time}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteEvent(ev.id)}
                            className="text-gray-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <span className="text-3xl block mb-2">📭</span>
                  <p className="text-gray-500 text-xs">No events on this day</p>
                  {selectedDate && (
                    <button
                      onClick={() => { setShowEventModal(true); setEventForm(f => ({ ...f, event_date: `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate).padStart(2,'0')}` })); }}
                      className="text-indigo-400 text-xs mt-2 hover:underline"
                    >
                      + Add one
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Medicines Tab */}
          {activeTab === 'medicines' && (
            <div className="bg-neutral-800/50 rounded-2xl p-5 border border-neutral-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Today's Medicines</h3>
                <button
                  onClick={notificationsEnabled ? () => setNotificationsEnabled(false) : enableNotifications}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-all ${
                    notificationsEnabled
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : 'bg-neutral-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {notificationsEnabled ? <Bell size={12} /> : <BellOff size={12} />}
                  {notificationsEnabled ? 'On' : 'Off'}
                </button>
              </div>

              {/* Progress */}
              {medsTotal > 0 && (
                <div className="mb-4">
                  <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        medsTaken === medsTotal ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${medsTotal > 0 ? (medsTaken / medsTotal) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {medsTaken === medsTotal && medsTotal > 0 ? '✅ All medicines taken!' : `${medsTaken} of ${medsTotal} taken`}
                  </p>
                </div>
              )}

              {medicines.length > 0 ? (
                <div className="space-y-2">
                  {medicines.map((med) => (
                    <div
                      key={med.id}
                      className={`rounded-xl p-3 transition-all group ${
                        med.taken_today
                          ? 'bg-emerald-900/20 border border-emerald-800/30'
                          : 'bg-neutral-700/30 border border-neutral-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleMedicineTaken(med)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                            med.taken_today
                              ? 'bg-emerald-500 text-white'
                              : 'bg-neutral-600 text-gray-400 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          {med.taken_today ? <Check size={14} /> : <Pill size={14} />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium transition-all ${
                            med.taken_today ? 'text-emerald-400 line-through opacity-70' : 'text-white'
                          }`}>
                            {med.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {med.dosage && <span className="text-[10px] text-gray-500">{med.dosage}</span>}
                            {med.frequency && <span className="text-[10px] text-gray-600">· {med.frequency}</span>}
                            {med.reminder_time && (
                              <span className="text-[10px] text-amber-500 flex items-center gap-0.5">
                                <Bell size={8} /> {med.reminder_time}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => deleteMedicine(med.id)}
                          className="text-gray-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <span className="text-3xl block mb-2">💊</span>
                  <p className="text-gray-500 text-xs">No medicines added yet</p>
                  <button
                    onClick={() => setShowMedModal(true)}
                    className="text-emerald-400 text-xs mt-2 hover:underline"
                  >
                    + Add medicine
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-2xl p-6 sm:p-8 w-full max-w-md border border-neutral-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Event</h2>
              <button onClick={() => setShowEventModal(false)} className="text-gray-400 hover:text-white p-2">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Title</label>
                <input type="text" placeholder="Event title" value={eventForm.title} required
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Description</label>
                <textarea placeholder="Optional description" value={eventForm.description}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" rows={2} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Date</label>
                  <input type="date" value={eventForm.event_date} required
                    onChange={e => setEventForm({ ...eventForm, event_date: e.target.value })}
                    className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Time</label>
                  <input type="time" value={eventForm.event_time}
                    onChange={e => setEventForm({ ...eventForm, event_time: e.target.value })}
                    className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Type</label>
                <div className="flex gap-2">
                  {['personal', 'appointment', 'reminder'].map(t => (
                    <button key={t} type="button"
                      onClick={() => setEventForm({ ...eventForm, event_type: t })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                        eventForm.event_type === t
                          ? 'bg-indigo-600 text-white'
                          : 'bg-neutral-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      {t === 'personal' && '👤 '}{t === 'appointment' && '🏥 '}{t === 'reminder' && '🔔 '}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Color</label>
                <div className="flex gap-2">
                  {EVENT_COLORS.map(c => (
                    <button key={c.value} type="button"
                      onClick={() => setEventForm({ ...eventForm, color: c.value })}
                      className={`w-7 h-7 rounded-full ${c.bg} transition-all ${
                        eventForm.color === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-800 scale-110' : 'opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEventModal(false)}
                  className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-3 rounded-xl transition-colors font-medium">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition-colors font-medium">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medicine Modal */}
      {showMedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-2xl p-6 sm:p-8 w-full max-w-md border border-neutral-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Medicine</h2>
              <button onClick={() => setShowMedModal(false)} className="text-gray-400 hover:text-white p-2">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateMedicine} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Medicine Name</label>
                <input type="text" placeholder="e.g., Vitamin D" value={medForm.name} required
                  onChange={e => setMedForm({ ...medForm, name: e.target.value })}
                  className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Dosage</label>
                <input type="text" placeholder="e.g., 500mg or 1 tablet" value={medForm.dosage}
                  onChange={e => setMedForm({ ...medForm, dosage: e.target.value })}
                  className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Frequency</label>
                <div className="flex flex-wrap gap-2">
                  {FREQUENCIES.map(f => (
                    <button key={f} type="button"
                      onClick={() => setMedForm({ ...medForm, frequency: f })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        medForm.frequency === f
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5 flex items-center gap-1">
                  <Bell size={12} /> Reminder Time
                </label>
                <input type="time" value={medForm.reminder_time}
                  onChange={e => setMedForm({ ...medForm, reminder_time: e.target.value })}
                  className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                <p className="text-[10px] text-gray-500 mt-1">
                  You'll get a browser notification at this time. Keep the tab open for reminders to work.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowMedModal(false)}
                  className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-3 rounded-xl transition-colors font-medium">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition-colors font-medium">Add Medicine</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
