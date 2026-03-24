import React from 'react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { Badge } from '../ui/UIComponents';

const TaskItem = ({ task, onComplete }) => {
  return (
    <div className={clsx(
      "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300",
      task.completed 
        ? "bg-green-50/50 border-green-100 opacity-75" 
        : "bg-white border-gray-100 hover:border-saffron-200 hover:shadow-md"
    )}>
      <div className={clsx(
        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
        task.completed ? "bg-green-100" : "bg-saffron-50"
      )}>
        {task.completed ? (
          <CheckCircle2 size={24} className="text-green-600" />
        ) : (
          <Circle size={24} className="text-saffron-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className={clsx(
          "text-sm font-bold truncate",
          task.completed ? "text-gray-400 line-through font-normal" : "text-gray-800"
        )}>
          {task.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="success" className="text-[10px] px-2 py-0 border-none bg-green-100 text-green-700">
            +{task.points} pts
          </Badge>
          <span className="text-[10px] text-gray-400 font-medium">Daily Mission</span>
        </div>
      </div>

      <button
        onClick={() => onComplete(task.id)}
        disabled={task.completed}
        className={clsx(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all focus:ring-2 focus:ring-offset-2",
          task.completed 
            ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
            : "bg-saffron-500 text-white hover:bg-saffron-600 shadow-lg shadow-saffron-200 focus:ring-saffron-500"
        )}
      >
        {task.completed ? <CheckCircle2 size={18} /> : <ArrowRight size={18} />}
      </button>
    </div>
  );
};

export default TaskItem;
