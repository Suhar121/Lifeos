import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Loader2, Trash2, Flame, X, ChevronDown } from 'lucide-react';

const CATEGORIES = [
  { value: 'health', label: 'Health', color: 'bg-green-500', lightBg: 'bg-green-500/10', text: 'text-green-400' },
  { value: 'fitness', label: 'Fitness', color: 'bg-amber-500', lightBg: 'bg-amber-500/10', text: 'text-amber-400' },
  { value: 'learning', label: 'Learning', color: 'bg-blue-500', lightBg: 'bg-blue-500/10', text: 'text-blue-400' },
  { value: 'mindfulness', label: 'Mindfulness', color: 'bg-purple-500', lightBg: 'bg-purple-500/10', text: 'text-purple-400' },
  { value: 'productivity', label: 'Productivity', color: 'bg-indigo-500', lightBg: 'bg-indigo-500/10', text: 'text-indigo-400' },
  { value: 'social', label: 'Social', color: 'bg-pink-500', lightBg: 'bg-pink-500/10', text: 'text-pink-400' },
  { value: 'general', label: 'General', color: 'bg-gray-500', lightBg: 'bg-gray-500/10', text: 'text-gray-400' },
];

const SUGGESTED_HABITS = [
  { name: 'Drink 8 glasses of water', emoji: '💧', category: 'health' },
  { name: 'Read for 30 minutes', emoji: '📖', category: 'learning' },
  { name: 'Meditate for 10 minutes', emoji: '🧘', category: 'mindfulness' },
  { name: 'Exercise for 30 minutes', emoji: '🏋️', category: 'fitness' },
  { name: 'Journal before bed', emoji: '📝', category: 'mindfulness' },
  { name: 'No social media before noon', emoji: '📵', category: 'productivity' },
  { name: 'Walk 10,000 steps', emoji: '🚶', category: 'fitness' },
  { name: 'Take vitamins', emoji: '💊', category: 'health' },
  { name: 'Practice gratitude', emoji: '🙏', category: 'mindfulness' },
  { name: 'Code for 1 hour', emoji: '💻', category: 'learning' },
  { name: 'Stretch in the morning', emoji: '🤸', category: 'fitness' },
  { name: 'Call a friend or family', emoji: '📞', category: 'social' },
];

const EMOJI_OPTIONS = ['✅', '💧', '📖', '🧘', '🏋️', '📝', '📵', '🚶', '💊', '🙏', '💻', '🤸', '📞', '🎯', '🔥', '⭐', '🌱', '💪', '🧠', '🎨', '🏃', '😴', '🥗', '🎵'];

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [completingId, setCompletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form state
  const [newHabit, setNewHabit] = useState('');
  const [newEmoji, setNewEmoji] = useState('✅');
  const [newCategory, setNewCategory] = useState('general');
  const [newTarget, setNewTarget] = useState(7);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await api.get('/habits/');
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async (name, emoji, category) => {
    if (!name.trim()) return;
    try {
      const response = await api.post('/habits/', { 
        name, 
        emoji, 
        category,
        target_days: newTarget 
      });
      setHabits([...habits, response.data]);
      setNewHabit('');
      setNewEmoji('✅');
      setNewCategory('general');
      setNewTarget(7);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const toggleHabit = async (habit) => {
    const today = new Date().toISOString().split('T')[0];
    const wasCompleted = habit.completed_today;
    setCompletingId(habit.id);

    try {
      await api.post('/habits/complete', {
        habit_id: habit.id,
        date: today,
        completed: !wasCompleted
      });
      // Optimistic update
      setHabits(habits.map(h => {
        if (h.id === habit.id) {
          const updatedWeek = [...h.week_completions];
          updatedWeek[updatedWeek.length - 1] = !wasCompleted;
          return { 
            ...h, 
            completed_today: !wasCompleted,
            streak: !wasCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
            week_completions: updatedWeek
          };
        }
        return h;
      }));
    } catch (error) {
      console.error('Error completing habit:', error);
    } finally {
      setTimeout(() => setCompletingId(null), 600);
    }
  };

  const deleteHabit = async (habitId) => {
    try {
      await api.delete(`/habits/${habitId}`);
      setHabits(habits.filter(h => h.id !== habitId));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const getCat = (cat) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[CATEGORIES.length - 1];

  const filteredHabits = activeFilter === 'all' 
    ? habits 
    : habits.filter(h => h.category === activeFilter);

  const totalToday = habits.filter(h => h.completed_today).length;
  const totalHabits = habits.length;
  const completionPercent = totalHabits > 0 ? Math.round((totalToday / totalHabits) * 100) : 0;

  const todayName = new Date().toLocaleDateString(undefined, { weekday: 'long' });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Habits</h1>
          <p className="text-gray-400 mt-1">Build consistency, one day at a time</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all hover:scale-105 text-sm font-medium shadow-lg shadow-indigo-600/20"
        >
          <Plus size={18} /> New Habit
        </button>
      </div>

      {/* Today's Progress Bar */}
      {totalHabits > 0 && (
        <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-700/50 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-white font-semibold">{todayName}'s Progress</h3>
              <p className="text-gray-500 text-xs mt-0.5">{totalToday} of {totalHabits} habits done</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white">{completionPercent}%</span>
              {completionPercent === 100 && <span className="block text-xs text-green-400 mt-0.5">🎉 Perfect day!</span>}
            </div>
          </div>
          <div className="h-3 bg-neutral-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                completionPercent === 100 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Category Filter Chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-white text-neutral-900'
              : 'bg-neutral-800 text-gray-400 hover:text-white'
          }`}
        >
          All ({habits.length})
        </button>
        {CATEGORIES.filter(c => habits.some(h => h.category === c.value)).map(cat => (
          <button
            key={cat.value}
            onClick={() => setActiveFilter(cat.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeFilter === cat.value
                ? `${cat.lightBg} ${cat.text}`
                : 'bg-neutral-800 text-gray-400 hover:text-white'
            }`}
          >
            {cat.label} ({habits.filter(h => h.category === cat.value).length})
          </button>
        ))}
      </div>

      {/* Habits List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHabits.map((habit) => {
            const cat = getCat(habit.category);
            const isCompleting = completingId === habit.id;

            return (
              <div
                key={habit.id}
                className={`bg-neutral-800/50 rounded-xl border transition-all duration-300 ${
                  habit.completed_today 
                    ? 'border-green-800/30 bg-green-900/10' 
                    : 'border-neutral-700/50 hover:border-neutral-600'
                } ${isCompleting ? 'scale-[1.02]' : ''}`}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Complete Button */}
                  <button
                    onClick={() => toggleHabit(habit)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 shrink-0 ${
                      habit.completed_today
                        ? 'bg-green-500/20 ring-2 ring-green-500 scale-110'
                        : 'bg-neutral-700/50 hover:bg-neutral-700 hover:scale-110'
                    }`}
                  >
                    {habit.completed_today ? '✓' : habit.emoji}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold transition-all ${
                        habit.completed_today ? 'text-green-400 line-through opacity-70' : 'text-white'
                      }`}>
                        {habit.name}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cat.lightBg} ${cat.text}`}>
                        {cat.label}
                      </span>
                    </div>

                    {/* Week Dots */}
                    <div className="flex items-center gap-1.5 mt-2">
                      {DAY_LABELS.map((day, i) => (
                        <div key={i} className="flex flex-col items-center gap-0.5">
                          <div
                            className={`w-5 h-5 rounded-md transition-all ${
                              habit.week_completions[i]
                                ? 'bg-green-500 shadow-sm shadow-green-500/30'
                                : i === 6 // today
                                  ? 'bg-neutral-600 ring-1 ring-neutral-500'
                                  : 'bg-neutral-700/50'
                            }`}
                          />
                          <span className="text-[9px] text-gray-600">{day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="flex flex-col items-center shrink-0">
                    {habit.streak > 0 ? (
                      <>
                        <div className="flex items-center gap-1">
                          <Flame size={16} className={`${habit.streak >= 7 ? 'text-orange-400' : 'text-amber-500'}`} />
                          <span className={`text-lg font-bold ${habit.streak >= 7 ? 'text-orange-400' : 'text-amber-500'}`}>
                            {habit.streak}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500">streak</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg text-gray-600">—</span>
                        <span className="text-[10px] text-gray-600">no streak</span>
                      </>
                    )}
                  </div>

                  {/* Delete */}
                  <div className="shrink-0">
                    {deleteConfirmId === habit.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-gray-400 hover:text-white p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(habit.id)}
                        className="text-gray-600 hover:text-red-400 p-2 rounded-lg transition-colors"
                        title="Delete habit"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {habits.length === 0 && (
            <div className="text-center py-16">
              <span className="text-6xl block mb-4">🌱</span>
              <h3 className="text-xl font-semibold text-white mb-2">Start building great habits</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Pick from popular habits below or create your own. Track daily to build streaks!
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                {SUGGESTED_HABITS.slice(0, 6).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => addHabit(s.name, s.emoji, s.category)}
                    className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl p-4 text-left transition-all hover:scale-105 hover:border-indigo-600/50"
                  >
                    <span className="text-2xl block mb-2">{s.emoji}</span>
                    <span className="text-sm text-white font-medium">{s.name}</span>
                    <span className={`text-[10px] block mt-1 ${getCat(s.category).text}`}>{getCat(s.category).label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredHabits.length === 0 && habits.length > 0 && (
            <div className="text-center py-12 text-gray-500">
              No habits in this category.
            </div>
          )}
        </div>
      )}

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-800 rounded-2xl p-8 w-full max-w-lg border border-neutral-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Habit</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Quick Add Suggestions */}
            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Quick Add</p>
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTED_HABITS.filter(s => !habits.some(h => h.name === s.name)).slice(0, 6).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => addHabit(s.name, s.emoji, s.category)}
                    className="flex items-center gap-2 bg-neutral-700/50 hover:bg-indigo-600/20 border border-neutral-600/50 rounded-lg p-3 text-left transition-all text-sm"
                  >
                    <span className="text-xl">{s.emoji}</span>
                    <span className="text-gray-300 text-xs">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-neutral-700 pt-6">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Or Create Your Own</p>

              {/* Emoji Picker */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 block mb-2">Icon</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-14 h-14 bg-neutral-700 rounded-xl flex items-center justify-center text-3xl hover:bg-neutral-600 transition-colors"
                  >
                    {newEmoji}
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute top-16 left-0 bg-neutral-700 rounded-xl p-3 grid grid-cols-8 gap-1.5 z-10 border border-neutral-600 shadow-xl">
                      {EMOJI_OPTIONS.map((em, i) => (
                        <button
                          key={i}
                          onClick={() => { setNewEmoji(em); setShowEmojiPicker(false); }}
                          className="w-9 h-9 flex items-center justify-center text-xl hover:bg-neutral-600 rounded-lg transition-colors"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 block mb-2">Habit Name</label>
                <input
                  type="text"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g., Read for 30 minutes"
                />
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 block mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setNewCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        newCategory === cat.value
                          ? `${cat.lightBg} ${cat.text} ring-1 ring-current`
                          : 'bg-neutral-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Days */}
              <div className="mb-6">
                <label className="text-xs text-gray-400 block mb-2">
                  Target: {newTarget} days/week
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={newTarget}
                  onChange={(e) => setNewTarget(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                  <span>1 day</span>
                  <span>Everyday</span>
                </div>
              </div>

              <button
                onClick={() => addHabit(newHabit, newEmoji, newCategory)}
                disabled={!newHabit.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all"
              >
                Add Habit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Habits;
