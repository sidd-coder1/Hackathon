import React from 'react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { Badge } from '../ui/UIComponents';

const TaskItem = ({ task, onComplete }) => {
  return (
    <div className={clsx(
      "flex items-center justify-between p-5 transition-colors duration-200 hover:bg-gray-50",
      task.completed && "bg-gray-50/50 opacity-75"
    )}>
      <div className="flex items-center gap-4">
        <div className={clsx(
          "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors",
          task.completed ? "bg-green-100 text-green-600" : "border-2 border-gray-300 text-transparent"
        )}>
          {task.completed && <CheckCircle2 size={16} strokeWidth={3} />}
        </div>

        <div>
          <h3 className={clsx(
            "text-sm font-semibold",
            task.completed ? "text-gray-400 line-through" : "text-gray-900"
          )}>
            {task.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">+{task.points} PTS</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onComplete(task.id)}
        disabled={task.completed}
        className={clsx(
          "px-4 py-2 rounded-lg text-sm font-bold transition-all focus:ring-2 focus:ring-offset-2",
          task.completed 
            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
            : "bg-orange-50 text-orange-600 hover:bg-orange-100 focus:ring-orange-500"
        )}
      >
        {task.completed ? "Completed" : "Start Task"}
      </button>
    </div>
  );
};

export default TaskItem;
