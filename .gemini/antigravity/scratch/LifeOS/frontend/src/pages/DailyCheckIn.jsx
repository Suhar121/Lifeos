import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const STEPS = ['mood', 'energy', 'focus', 'productivity', 'sleep', 'workout', 'notes'];

const STEP_TITLES = {
  mood: "How's your vibe today?",
  energy: "Battery check! ⚡",
  focus: "How sharp was your focus? 🎯",
  productivity: "Did you get things done? 🚀",
  sleep: "How was your sleep? 🌙",
  workout: "Did you move your body? 💪",
  notes: "Any final thoughts? ✍️",
};

const STEP_SUBTITLES = {
  mood: "Pick the emoji that matches your mood",
  energy: "Drag the slider to rate your energy",
  focus: "How well could you concentrate today?",
  productivity: "Rate how productive your day was",
  sleep: "Slide to set your sleep hours",
  workout: "Every step counts!",
  notes: "Jot down wins, thoughts, or reflections",
};

const MOOD_CONFIG = [
  { value: 'happy', emoji: '😄', label: 'Happy', color: 'from-green-400 to-emerald-500', bg: 'bg-green-500/10', ring: 'ring-green-500' },
  { value: 'calm', emoji: '😌', label: 'Calm', color: 'from-blue-400 to-cyan-500', bg: 'bg-blue-500/10', ring: 'ring-blue-500' },
  { value: 'neutral', emoji: '😐', label: 'Meh', color: 'from-gray-400 to-slate-500', bg: 'bg-gray-500/10', ring: 'ring-gray-500' },
  { value: 'anxious', emoji: '😰', label: 'Anxious', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-500/10', ring: 'ring-amber-500' },
  { value: 'sad', emoji: '😔', label: 'Sad', color: 'from-indigo-400 to-purple-500', bg: 'bg-indigo-500/10', ring: 'ring-indigo-500' },
];

const ENERGY_EMOJIS = ['🪫', '😴', '🥱', '😶', '🙂', '😊', '💪', '🔥', '⚡', '🚀'];
const FOCUS_EMOJIS = ['🌫️', '😵', '🤔', '😶', '🧐', '🎯', '🧠', '💡', '🔬', '🏆'];
const PROD_EMOJIS = ['🐌', '🦥', '😪', '🤷', '🙂', '👍', '💪', '🔥', '⚡', '🚀'];

const MOTIVATIONAL_QUOTES = [
  "You're building a better version of yourself 🌱",
  "Small steps, big results ✨",
  "Consistency beats perfection every time 🎯",
  "Your future self will thank you 🙏",
  "Progress, not perfection 💫",
  "One day at a time, one log at a time 📊",
  "You showed up — that already counts 🏆",
];

const DailyCheckIn = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [lifeScore, setLifeScore] = useState(null);
  const [quote] = useState(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  const [formData, setFormData] = useState({
    mood: 'neutral',
    energy: 5,
    focus: 5,
    sleep_hours: 7,
    productivity: 5,
    workout: false,
    notes: ''
  });

  const progress = ((step + 1) / STEPS.length) * 100;
  const currentStep = STEPS[step];

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      const res = await api.post('/daily-logs/', formData);
      setLifeScore(res.data.life_score);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting log:', error);
    }
  };

  // Confetti particles
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    if (submitted) {
      const newParticles = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1 + Math.random() * 2,
        color: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'][Math.floor(Math.random() * 5)],
        size: 4 + Math.random() * 8,
      }));
      setParticles(newParticles);
    }
  }, [submitted]);

  // Success screen
  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center relative overflow-hidden">
        {/* Confetti */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {particles.map(p => (
            <div
              key={p.id}
              className="absolute rounded-full animate-bounce"
              style={{
                left: `${p.x}%`,
                top: '-20px',
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>

        <div className="text-7xl mb-6 animate-bounce">🎉</div>
        <h1 className="text-4xl font-bold text-white mb-3">Day Logged!</h1>
        <p className="text-gray-400 text-lg mb-8">Great job showing up for yourself today</p>

        {lifeScore !== null && (
          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/30 rounded-2xl p-8 border border-indigo-800/30 mb-8 inline-block">
            <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">Today's Life Score</p>
            <div className="text-6xl font-bold text-white">{lifeScore}</div>
            <p className="text-indigo-400 text-sm mt-2">
              {lifeScore >= 80 ? '🔥 On fire!' : lifeScore >= 60 ? '💪 Solid day!' : lifeScore >= 40 ? '👍 Decent!' : '🌱 Room to grow!'}
            </p>
          </div>
        )}

        <p className="text-gray-500 italic mb-8">"{quote}"</p>

        <button
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all hover:scale-105"
        >
          Back to Dashboard →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Step {step + 1} of {STEPS.length}</span>
          <span className="text-xs text-indigo-400 font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{STEP_TITLES[currentStep]}</h1>
        <p className="text-gray-400">{STEP_SUBTITLES[currentStep]}</p>
      </div>

      {/* Step Content */}
      <div className="bg-neutral-800/50 backdrop-blur rounded-2xl p-8 border border-neutral-700/50 shadow-2xl min-h-[300px] flex flex-col justify-center">
        
        {/* MOOD STEP */}
        {currentStep === 'mood' && (
          <div className="grid grid-cols-5 gap-4">
            {MOOD_CONFIG.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => { setFormData({ ...formData, mood: m.value }); }}
                className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${
                  formData.mood === m.value
                    ? `${m.bg} ring-2 ${m.ring} scale-110 shadow-lg`
                    : 'bg-neutral-700/30 hover:bg-neutral-700/60 hover:scale-105'
                }`}
              >
                <span className="text-4xl mb-2" style={{ filter: formData.mood === m.value ? 'none' : 'grayscale(0.5)' }}>
                  {m.emoji}
                </span>
                <span className={`text-xs font-medium ${formData.mood === m.value ? 'text-white' : 'text-gray-500'}`}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ENERGY STEP */}
        {currentStep === 'energy' && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-6xl block mb-2">{ENERGY_EMOJIS[formData.energy - 1]}</span>
              <span className="text-4xl font-bold text-white">{formData.energy}</span>
              <span className="text-gray-500 text-lg">/10</span>
            </div>
            <input
              type="range" min="1" max="10" step="1"
              value={formData.energy}
              onChange={(e) => setFormData({ ...formData, energy: Number(e.target.value) })}
              className="w-full h-3 bg-neutral-700 rounded-full appearance-none cursor-pointer accent-amber-500"
              style={{ 
                background: `linear-gradient(to right, #f59e0b ${(formData.energy - 1) * 11.1}%, #262626 ${(formData.energy - 1) * 11.1}%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>Drained</span>
              <span>Supercharged</span>
            </div>
          </div>
        )}

        {/* FOCUS STEP */}
        {currentStep === 'focus' && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-6xl block mb-2">{FOCUS_EMOJIS[formData.focus - 1]}</span>
              <span className="text-4xl font-bold text-white">{formData.focus}</span>
              <span className="text-gray-500 text-lg">/10</span>
            </div>
            <input
              type="range" min="1" max="10" step="1"
              value={formData.focus}
              onChange={(e) => setFormData({ ...formData, focus: Number(e.target.value) })}
              className="w-full h-3 bg-neutral-700 rounded-full appearance-none cursor-pointer accent-blue-500"
              style={{ 
                background: `linear-gradient(to right, #3b82f6 ${(formData.focus - 1) * 11.1}%, #262626 ${(formData.focus - 1) * 11.1}%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>Scattered</span>
              <span>Laser-focused</span>
            </div>
          </div>
        )}

        {/* PRODUCTIVITY STEP */}
        {currentStep === 'productivity' && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-6xl block mb-2">{PROD_EMOJIS[formData.productivity - 1]}</span>
              <span className="text-4xl font-bold text-white">{formData.productivity}</span>
              <span className="text-gray-500 text-lg">/10</span>
            </div>
            <input
              type="range" min="1" max="10" step="1"
              value={formData.productivity}
              onChange={(e) => setFormData({ ...formData, productivity: Number(e.target.value) })}
              className="w-full h-3 bg-neutral-700 rounded-full appearance-none cursor-pointer accent-green-500"
              style={{ 
                background: `linear-gradient(to right, #10b981 ${(formData.productivity - 1) * 11.1}%, #262626 ${(formData.productivity - 1) * 11.1}%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>Couch mode</span>
              <span>Machine mode</span>
            </div>
          </div>
        )}

        {/* SLEEP STEP */}
        {currentStep === 'sleep' && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-6xl block mb-2">
                {formData.sleep_hours < 5 ? '😵' : formData.sleep_hours < 6 ? '😴' : formData.sleep_hours < 7 ? '🥱' : formData.sleep_hours <= 9 ? '😴💤' : '😪'}
              </span>
              <span className="text-4xl font-bold text-white">{formData.sleep_hours}</span>
              <span className="text-gray-500 text-lg"> hours</span>
            </div>
            <input
              type="range" min="2" max="12" step="0.5"
              value={formData.sleep_hours}
              onChange={(e) => setFormData({ ...formData, sleep_hours: Number(e.target.value) })}
              className="w-full h-3 bg-neutral-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
              style={{ 
                background: `linear-gradient(to right, #6366f1 ${((formData.sleep_hours - 2) / 10) * 100}%, #262626 ${((formData.sleep_hours - 2) / 10) * 100}%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>2h</span>
              <span className="text-indigo-400">Sweet spot: 7-9h</span>
              <span>12h</span>
            </div>
          </div>
        )}

        {/* WORKOUT STEP */}
        {currentStep === 'workout' && (
          <div className="flex flex-col items-center space-y-8">
            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, workout: true })}
                className={`flex flex-col items-center p-8 rounded-2xl transition-all duration-300 min-w-[140px] ${
                  formData.workout
                    ? 'bg-green-500/15 ring-2 ring-green-500 scale-110 shadow-lg shadow-green-500/10'
                    : 'bg-neutral-700/30 hover:bg-neutral-700/60 hover:scale-105'
                }`}
              >
                <span className="text-5xl mb-3">{formData.workout ? '🏋️‍♂️' : '💪'}</span>
                <span className={`font-bold text-lg ${formData.workout ? 'text-green-400' : 'text-gray-400'}`}>
                  Yes!
                </span>
                <span className="text-xs text-gray-500 mt-1">Crushed it</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, workout: false })}
                className={`flex flex-col items-center p-8 rounded-2xl transition-all duration-300 min-w-[140px] ${
                  !formData.workout
                    ? 'bg-neutral-600/30 ring-2 ring-neutral-500 scale-110'
                    : 'bg-neutral-700/30 hover:bg-neutral-700/60 hover:scale-105'
                }`}
              >
                <span className="text-5xl mb-3">🛋️</span>
                <span className={`font-bold text-lg ${!formData.workout ? 'text-white' : 'text-gray-400'}`}>
                  Nah
                </span>
                <span className="text-xs text-gray-500 mt-1">Rest day</span>
              </button>
            </div>
            {formData.workout && (
              <p className="text-green-400 text-sm animate-pulse">🔥 Gains incoming!</p>
            )}
          </div>
        )}

        {/* NOTES STEP */}
        {currentStep === 'notes' && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap mb-4">
              {['Had a great day ✨', 'Feeling productive 🚀', 'Need more sleep 😴', 'Stressed about work 😤', 'Grateful today 🙏'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setFormData({ ...formData, notes: formData.notes ? formData.notes + ' ' + tag : tag })}
                  className="text-xs bg-neutral-700/50 hover:bg-indigo-600/20 hover:text-indigo-400 text-gray-400 px-3 py-1.5 rounded-full transition-colors border border-neutral-600/50"
                >
                  {tag}
                </button>
              ))}
            </div>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-neutral-900/50 border border-neutral-700 rounded-xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-36 resize-none text-sm placeholder:text-gray-600"
              placeholder="What made today special? Any wins? Challenges? Brain dumps welcome..."
            />
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 0}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            step === 0
              ? 'text-gray-600 cursor-not-allowed'
              : 'text-gray-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          ← Back
        </button>

        {/* Step Dots */}
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === step ? 'bg-indigo-500 w-6' : i < step ? 'bg-indigo-500/50' : 'bg-neutral-700'
              }`}
            />
          ))}
        </div>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all hover:scale-105 hover:shadow-indigo-500/25"
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all hover:scale-105 hover:shadow-green-500/25"
          >
            Save Log 🎉
          </button>
        )}
      </div>

      {/* Motivational Quote */}
      <div className="text-center mt-10">
        <p className="text-gray-600 text-xs italic">"{quote}"</p>
      </div>
    </div>
  );
};

export default DailyCheckIn;
