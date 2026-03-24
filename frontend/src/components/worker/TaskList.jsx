import React from 'react';
import { Target, Info } from 'lucide-react';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onCompleteTask }) => {
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <Target size={18} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Daily Missions</h2>
            <p className="text-[10px] text-gray-500 font-medium">Earn points for every task</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100 uppercase tracking-tight">
            {completedCount}/{tasks.length} Done
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onComplete={onCompleteTask} 
          />
        ))}
      </div>

      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
        <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
          Missions refresh every 24 hours at midnight. Complete all tasks to unlock bonus multiplier!
        </p>
      </div>
    </div>
  );
};

export default TaskList;
