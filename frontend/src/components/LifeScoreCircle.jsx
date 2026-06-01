import React, { useEffect, useState } from 'react';

const LifeScoreCircle = ({ score = 0, size = 180 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current >= score) {
        clearInterval(interval);
        setAnimatedScore(score);
      } else {
        setAnimatedScore(current);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [score]);

  const getScoreColor = (s) => {
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#6366f1';
    if (s >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (s) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Needs Work';
  };

  const color = getScoreColor(animatedScore);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Subtle glow ring behind */}
        <div className="absolute inset-0 rounded-full pointer-events-none"
          style={{ boxShadow: `0 0 40px ${color}20`, borderRadius: '50%' }} />

        <svg width={size} height={size} className="transform -rotate-90">
          {/* Track */}
          <circle cx={size/2} cy={size/2} r={radius}
            stroke="var(--glass-bg)" strokeWidth="12" fill="none" />
          {/* Background glow track */}
          <circle cx={size/2} cy={size/2} r={radius}
            stroke={color} strokeWidth="12" fill="none" opacity="0.08"
            strokeDasharray={circumference} strokeDashoffset={0} />
          {/* Progress */}
          <circle cx={size/2} cy={size/2} r={radius}
            stroke={color} strokeWidth="12" fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.3s ease',
              filter: `drop-shadow(0 0 10px ${color}80)`,
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-theme-text tracking-tight" style={{ textShadow: `0 0 20px ${color}60` }}>
            {animatedScore}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest mt-1"
            style={{ color }}>
            {getScoreLabel(animatedScore)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LifeScoreCircle;
