import React from 'react';
import { Award, TrendingUp, Star } from 'lucide-react';
import LevelBadge from './LevelBadge';

const PointsCard = ({ points, level }) => {
  return (
    <div className="glass-card p-6 bg-gradient-to-br from-white to-saffron-50 border-l-4 border-l-saffron-500 overflow-hidden relative">
      <div className="absolute -right-4 -top-4 opacity-10">
        <Award size={120} className="text-saffron-500" />
      </div>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Impact Rewards</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-gray-900 leading-none">{points.total}</h2>
            <span className="text-saffron-600 font-bold text-sm tracking-tight uppercase">PTS</span>
          </div>
        </div>
        <LevelBadge level={level} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-saffron-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-saffron-100 flex items-center justify-center">
            <TrendingUp size={18} className="text-saffron-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Today's Gain</p>
            <p className="text-lg font-bold text-saffron-700">+{points.today}</p>
          </div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-green-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Star size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Daily Bonus</p>
            <p className="text-lg font-bold text-green-700">+5</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsCard;
