import React from 'react';
import { Target, Info } from 'lucide-react';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onCompleteTask }) => {
  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {tasks.map((task) => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onComplete={onCompleteTask} 
        />
      ))}
      <div className="p-5 bg-blue-50/50 flex items-start gap-3">
        <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed font-medium">
          Missions refresh every 24 hours at midnight. Complete all tasks to unlock bonus multiplier!
        </p>
      </div>
    </div>
  );
};

export default TaskList;
