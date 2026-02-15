import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sparkles, AlertTriangle, TrendingUp, Lightbulb, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Assuming we handle simple text, but AI response is JSON

const AIInsights = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false); // Start false, trigger on request or auto? Let's auto load.

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const response = await api.post('/ai/analyze');
      setAnalysis(response.data);
    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const colorStyles = {
    blue: { icon: 'text-blue-500', bg: 'bg-blue-500/10 text-blue-400' },
    red: { icon: 'text-red-500', bg: 'bg-red-500/10 text-red-400' },
    yellow: { icon: 'text-yellow-500', bg: 'bg-yellow-500/10 text-yellow-400' },
  };

  const InsightCard = ({ title, content, icon: Icon, color }) => {
    const styles = colorStyles[color] || colorStyles.blue;
    
    return (
      <div className="bg-neutral-800 rounded-xl p-4 sm:p-6 border border-neutral-700 shadow-lg relative overflow-hidden">
        <div className={`absolute top-0 right-0 p-2 sm:p-4 opacity-10 ${styles.icon}`}>
          <Icon size={80} className="sm:size-[100px]" />
        </div>
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <div className={`p-1.5 sm:p-2 rounded-lg ${styles.bg}`}>
            <Icon size={20} className="sm:size-[24px]" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="text-sm sm:text-base text-gray-300 leading-relaxed relative z-10">{content}</p>
      </div>

    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <Sparkles className="text-yellow-400" size={24} />
            AI Insights
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1">Deep analysis of your data patterns</p>
        </div>

        <button
          onClick={fetchAnalysis}
          disabled={loading}
          className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && !analysis ? (
        <div className="flex justify-center py-20">
           <div className="text-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
             <p className="text-gray-400">Analyzing your data patterns...</p>
           </div>
        </div>
      ) : analysis ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InsightCard 
            title="Pattern Observations" 
            content={analysis.pattern_observations} 
            icon={TrendingUp} 
            color="blue"  // Tailwind classes like text-blue-400 need to be safelisted or full class used.
            // Simplified for now, inline styles or fixed classes safer without safelist
          />
          <InsightCard 
            title="Performance Risks" 
            content={analysis.performance_risks} 
            icon={AlertTriangle} 
            color="red" 
          />
          <InsightCard 
             title="Improvement Suggestions" 
             content={analysis.improvement_suggestions} 
             icon={Lightbulb} 
             color="yellow" 
          />
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 sm:p-8 border border-neutral-700 shadow-lg md:col-span-2 text-center">
             <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Motivational Insight</h3>
             <blockquote className="text-indigo-100 text-base sm:text-lg italic">
               "{analysis.motivational_insight}"
             </blockquote>
          </div>

        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          No analysis available. Try logging some data first.
        </div>
      )}
    </div>
  );
};

export default AIInsights;
