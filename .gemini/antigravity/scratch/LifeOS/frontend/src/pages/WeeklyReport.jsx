import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FileText, TrendingUp, AlertTriangle, Lightbulb, Target, RefreshCw } from 'lucide-react';

const WeeklyReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/weekly-report');
      setReport(res.data);
    } catch (err) {
      // 404 means no report yet
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/ai/weekly-report');
      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading report...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Weekly Report</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1">AI-powered performance analysis</p>
        </div>
        <button
          onClick={generateReport}
          disabled={generating}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-colors text-xs sm:text-sm font-medium"
        >
          <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>


      {report ? (
        <div className="space-y-6">
          {/* Performance Overview */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/20 rounded-2xl p-4 sm:p-6 border border-indigo-800/30">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <FileText size={18} className="text-indigo-400" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-white">Overview</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{report.report_data.performance_overview}</p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-neutral-800 rounded-xl p-4 sm:p-6 border border-neutral-700">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp size={18} className="text-green-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white">Strengths</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{report.report_data.key_strengths}</p>
            </div>


            {/* Risk Signals */}
            <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={20} className="text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Risk Signals</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{report.report_data.risk_signals}</p>
            </div>

            {/* Optimization */}
            <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <Lightbulb size={20} className="text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Strategy</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{report.report_data.optimization_strategy}</p>
            </div>

            {/* Challenge */}
            <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                  <Target size={20} className="text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Weekly Challenge</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{report.report_data.focused_challenge}</p>
            </div>
          </div>

          <p className="text-gray-500 text-xs text-center">
            Report for week starting {report.week_start}
          </p>
        </div>
      ) : (
        <div className="bg-neutral-800 rounded-2xl p-12 border border-neutral-700 text-center">
          <FileText size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Report Yet</h3>
          <p className="text-gray-400 mb-6">Generate your first weekly performance report to get AI-powered insights.</p>
          <button
            onClick={generateReport}
            disabled={generating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            {generating ? 'Generating...' : 'Generate Weekly Report'}
          </button>
        </div>
      )}
    </div>
  );
};

export default WeeklyReport;
