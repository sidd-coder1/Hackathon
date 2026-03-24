import React from 'react';
import { Badge } from '../ui/UIComponents';

const LevelBadge = ({ level }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xl">{level.icon}</span>
      <Badge variant={level.variant} className="px-3 py-1 rounded-full shadow-sm border-saffron-200">
        {level.label}
      </Badge>
    </div>
  );
};

export default LevelBadge;
