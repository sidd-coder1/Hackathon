import React from 'react';
import { Badge } from '../ui/UIComponents';

const LevelBadge = ({ level }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-saffron-500 shadow-sm">
        <level.icon size={16} />
      </div>
      <Badge variant={level.variant} className="px-3 py-1 rounded-full shadow-sm border-saffron-200">
        {level.label}
      </Badge>
    </div>
  );
};

export default LevelBadge;
