import React from 'react';
import { Award, TrendingUp, Star } from 'lucide-react';
import LevelBadge from './LevelBadge';

const PointsCard = ({ points, level }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-saffron-50 border border-saffron-100 flex items-center justify-center flex-shrink-0">
          <Award size={24} className="text-saffron-500" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Impact Rewards</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-extrabold text-gray-900 leading-none tracking-tight">{points.total}</h2>
            <span className="text-saffron-600 font-bold text-sm tracking-tight">PTS</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100 flex items-center gap-3">
          <TrendingUp size={16} className="text-saffron-500" />
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Today</p>
            <p className="text-sm font-bold text-gray-900">+{points.today}</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100 flex items-center gap-3">
          <Star size={16} className="text-green-500" />
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Daily Bonus</p>
            <p className="text-sm font-bold text-gray-900">+5 min</p>
          </div>
        </div>
        <LevelBadge level={level} />
      </div>
    </div>
  );
};

export default PointsCard;
