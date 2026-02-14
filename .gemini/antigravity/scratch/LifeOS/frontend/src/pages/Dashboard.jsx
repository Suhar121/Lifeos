import React, { useEffect, useState } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import TrendChart from '../components/TrendChart';
import LifeScoreCircle from '../components/LifeScoreCircle';
import { Moon, Zap, Target, Briefcase, Flame, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [lifeScore, setLifeScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasLogToday, setHasLogToday] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, scoreRes] = await Promise.all([
          api.get('/daily-logs/last-7-days'),
          api.get('/life-score/weekly').catch(() => null),
        ]);

        processStats(logsRes.data);

        if (scoreRes?.data) {
          setLifeScore(scoreRes.data);
        }

        // Check if today's log exists
        const today = new Date().toISOString().split('T')[0];
        const todayLog = logsRes.data.find(log => log.created_at.startsWith(today));
        setHasLogToday(!!todayLog);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processStats = (logs) => {
    if (!logs.length) {
      setStats({
        sleep: { value: '0h', trend: '0%', data: { labels: [], values: [] } },
        energy: { value: '0/10', trend: '0%', data: { labels: [], values: [] } },
        focus: { value: '0/10', trend: '0%', data: { labels: [], values: [] } },
        productivity: { value: '0/10', trend: '0%', data: { labels: [], values: [] } },
      });
      return;
    }

    const labels = logs.map(log => new Date(log.created_at).toLocaleDateString(undefined, { weekday: 'short' }));
    const avg = (arr) => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);

    const sleepData = logs.map(l => l.sleep_hours);
    const energyData = logs.map(l => l.energy);
    const focusData = logs.map(l => l.focus);
    const prodData = logs.map(l => l.productivity);

    setStats({
      sleep: { value: avg(sleepData) + 'h', trend: '+5%', data: { labels, values: sleepData } },
      energy: { value: avg(energyData) + '/10', trend: '+2%', data: { labels, values: energyData } },
      focus: { value: avg(focusData) + '/10', trend: '-1%', data: { labels, values: focusData } },
      productivity: { value: avg(prodData) + '/10', trend: '+8%', data: { labels, values: prodData } },
    });
  };

  if (loading) return <div className="p-8 text-center text-white">Loading insights...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Missed Log Banner */}
      {!hasLogToday && (
        <div className="mb-6 bg-amber-900/30 border border-amber-700/50 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-amber-400 shrink-0" />
          <div>
            <p className="text-amber-200 text-sm font-medium">You haven't logged today yet!</p>
            <p className="text-amber-400/70 text-xs">Keep your streak alive — log your day now.</p>
          </div>
          <a href="/check-in" className="ml-auto bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
            Log Now
          </a>
        </div>
      )}

      {/* Header with Life Score Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Life Score Card */}
        <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 rounded-2xl p-8 border border-indigo-800/30 flex flex-col items-center justify-center">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">Life Score</h2>
          <LifeScoreCircle score={lifeScore?.average_score || 0} />
          <p className="text-gray-500 text-xs mt-4">Weekly Average</p>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <StatCard title="Avg Sleep" value={stats?.sleep.value} trend={stats?.sleep.trend} icon={Moon} color="primary" />
          <StatCard title="Avg Energy" value={stats?.energy.value} trend={stats?.energy.trend} icon={Zap} color="warning" />
          <StatCard title="Avg Focus" value={stats?.focus.value} trend={stats?.focus.trend} icon={Target} color="info" />
          <StatCard title="Productivity" value={stats?.productivity.value} trend={stats?.productivity.trend} icon={Briefcase} color="success" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Sleep Trends</h3>
          <TrendChart data={stats?.sleep.data} title="Sleep (hours)" color="#6366f1" />
        </div>
        <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Productivity Flow</h3>
          <TrendChart data={stats?.productivity.data} title="Productivity (1-10)" color="#10b981" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
