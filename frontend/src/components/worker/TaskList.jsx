import React from 'react';
import { Target, Info } from 'lucide-react';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onStartTask, onCompleteTask }) => {
  // Sort: Highest reward first
  const activeTasks = [...tasks].filter(t => !t.completed).sort((a, b) => b.points - a.points);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="flex flex-col">
      <div className="divide-y divide-gray-100">
        {activeTasks.map((task) => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onStart={onStartTask}
            onComplete={onCompleteTask} 
          />
        ))}
      </div>

      {completedTasks.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-6 mb-3">Completed Today</h3>
          <div className="divide-y divide-gray-100 opacity-60 grayscale-[0.5]">
            {completedTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
