import React, { useState } from 'react';
import { CheckCircle2, Play, Check } from 'lucide-react';
import clsx from 'clsx';

const TaskItem = ({ task, onStart, onComplete }) => {
  const [justCompleted, setJustCompleted] = useState(false);

  const handleStart = () => {
    if (onStart) onStart(task.id);
  };

  const handleComplete = () => {
    setJustCompleted(true);
    setTimeout(() => {
      if (onComplete) onComplete(task.id);
    }, 1500); // 1.5s delay to show the "Pts earned" toast
  };

  const difficultyColors = {
    Easy: 'bg-green-50 text-green-700 border-green-200',
    Medium: 'bg-blue-50 text-blue-700 border-blue-200',
    Hard: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  return (
    <div className={clsx(
      "flex flex-col sm:flex-row sm:items-center justify-between py-4 px-6 transition-all duration-300 hover:bg-gray-50/50 gap-4",
      justCompleted && "bg-green-50/30"
    )}>
      <div className="flex items-start gap-4">
        <div>
          <h3 className={clsx(
            "text-[15px] font-bold tracking-tight mb-1.5",
            task.completed ? "text-gray-400 line-through" : "text-gray-900"
          )}>
            {task.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className={clsx(
              "text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border",
              difficultyColors[task.difficulty] || difficultyColors.Medium
            )}>
              {task.difficulty}
            </span>
            <span className="text-[11px] font-bold text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              ₹{task.rupees || 0} + {task.points} PTS
            </span>
            
            {justCompleted && (
              <span className="text-[11px] font-extrabold text-green-600 bg-green-100 px-2 py-0.5 rounded-md animate-bounce">
                +{task.points} PTS EARNED!
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center sm:w-auto w-full">
        {task.status === 'idle' && !task.completed && !justCompleted && (
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-bold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Play size={14} className="fill-current" /> Start Task
          </button>
        )}
        
        {task.status === 'started' && !task.completed && !justCompleted && (
          <button
            onClick={handleComplete}
            className="w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-green-600/20 hover:-translate-y-0.5"
          >
            <Check size={16} strokeWidth={3} /> Complete Task
          </button>
        )}

        {task.completed && !justCompleted && (
          <span className="text-sm font-bold text-gray-400 flex items-center gap-1.5 px-4 py-2">
            <CheckCircle2 size={16} /> Completed
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
