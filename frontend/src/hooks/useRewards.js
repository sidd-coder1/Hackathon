import { useState, useEffect } from 'react';

const POINTS_KEY = 'swachh_points_data';
const TASKS_KEY = 'swachh_daily_tasks';

const TASK_POOL = [
  "Clean Street A & Sidewalks",
  "Collect Garbage Zone B (Residential)",
  "Fix Pipeline C near Market",
  "Sweep Central Market Area",
  "Drain Cleaning Sector D",
  "Sanitize Public Toilets Block F",
  "Clear Debris from Park Entrance",
  "Inspect Waste Disposal at Site G"
];

export const useRewards = () => {
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem(POINTS_KEY);
    return saved ? JSON.parse(saved) : { total: 0, today: 0, lastLogin: new Date().toDateString() };
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(TASKS_KEY);
    return saved ? JSON.parse(saved) : { date: '', list: [] };
  });

  useEffect(() => {
    const todayStr = new Date().toDateString();

    // 1. Handle Daily Login & Points Reset
    if (points.lastLogin !== todayStr) {
      setPoints(prev => {
        const newPoints = {
          total: prev.total + 5, // Daily login bonus
          today: 0,
          lastLogin: todayStr
        };
        localStorage.setItem(POINTS_KEY, JSON.stringify(newPoints));
        return newPoints;
      });
    }

    // 2. Handle Daily Task Generation
    if (tasks.date !== todayStr) {
      const shuffled = [...TASK_POOL].sort(() => 0.5 - Math.random());
      const selectedTasks = shuffled.slice(0, 3).map((title, index) => ({
        id: `daily-${index}-${todayStr}`,
        title,
        completed: false,
        points: 10
      }));

      const newTasks = { date: todayStr, list: selectedTasks };
      setTasks(newTasks);
      localStorage.setItem(TASKS_KEY, JSON.stringify(newTasks));
    }
  }, []);

  const completeTask = (taskId) => {
    setTasks(prev => {
      const newList = prev.list.map(t => 
        t.id === taskId ? { ...t, completed: true } : t
      );
      const newState = { ...prev, list: newList };
      localStorage.setItem(TASKS_KEY, JSON.stringify(newState));
      return newState;
    });

    setPoints(prev => {
      const newPoints = {
        ...prev,
        total: prev.total + 10,
        today: prev.today + 10
      };
      localStorage.setItem(POINTS_KEY, JSON.stringify(newPoints));
      return newPoints;
    });
  };

  const getLevel = (totalPoints) => {
    if (totalPoints <= 50) return { label: 'Beginner', variant: 'default', icon: '🌱' };
    if (totalPoints <= 150) return { label: 'Active Worker', variant: 'saffron', icon: '⭐' };
    return { label: 'Star Performer', variant: 'success', icon: '🏆' };
  };

  return {
    points,
    tasks: tasks.list,
    completeTask,
    level: getLevel(points.total)
  };
};
