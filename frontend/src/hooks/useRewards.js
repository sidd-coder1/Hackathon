import { useState, useEffect } from 'react';
import { Leaf, Star, Trophy } from 'lucide-react';

const POINTS_KEY = 'swachh_points_data';
const TASKS_KEY = 'swachh_daily_tasks';

const TASK_POOL = [
  { title: "Clean Street A & Sidewalks", difficulty: "Easy", points: 10, rupees: 100 },
  { title: "Collect Garbage Zone B", difficulty: "Medium", points: 15, rupees: 150 },
  { title: "Fix Pipeline C", difficulty: "Hard", points: 25, rupees: 200 },
  { title: "Sweep Central Market", difficulty: "Easy", points: 10, rupees: 100 },
  { title: "Drain Cleaning Sector D", difficulty: "Hard", points: 30, rupees: 200 },
  { title: "Sanitize Toilets Block F", difficulty: "Medium", points: 20, rupees: 150 },
  { title: "Clear Debris from Park", difficulty: "Medium", points: 15, rupees: 150 },
  { title: "Inspect Waste Disposal", difficulty: "Easy", points: 10, rupees: 100 }
];

export const useRewards = () => {
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem(POINTS_KEY);
    return saved ? JSON.parse(saved) : { total: 0, today: 0, streak: 1, lastLogin: new Date().toDateString() };
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
        const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
        let newStreak = prev.streak || 1;
        
        if (prev.lastLogin === yesterdayStr) {
          newStreak += 1;
        } else {
          newStreak = 1; // Reset streak if missed a day
        }

        const newPoints = {
          ...prev,
          total: prev.total + 5 + (newStreak > 1 ? 5 : 0), // Daily login + streak bonus
          today: 0,
          streak: newStreak,
          lastLogin: todayStr
        };
        localStorage.setItem(POINTS_KEY, JSON.stringify(newPoints));
        return newPoints;
      });
    }

    // 2. Handle Daily Task Generation
    if (tasks.date !== todayStr) {
      const shuffled = [...TASK_POOL].sort(() => 0.5 - Math.random());
      
      // Sort to ensure we get a mix of hard/medium/easy
      shuffled.sort((a, b) => {
        const rank = { Hard: 3, Medium: 2, Easy: 1 };
        return rank[b.difficulty] - rank[a.difficulty];
      });

      const selectedTasks = shuffled.slice(0, 3).map((taskData, index) => ({
        id: `daily-${index}-${todayStr}`,
        title: taskData.title,
        difficulty: taskData.difficulty,
        points: taskData.points,
        rupees: taskData.rupees,
        status: 'idle', // idle -> started -> completed
        completed: false
      }));

      const newTasks = { date: todayStr, list: selectedTasks };
      setTasks(newTasks);
      localStorage.setItem(TASKS_KEY, JSON.stringify(newTasks));
    }
  }, []);

  const startTask = (taskId) => {
    setTasks(prev => {
      const newList = prev.list.map(t => 
        t.id === taskId ? { ...t, status: 'started' } : t
      );
      const newState = { ...prev, list: newList };
      localStorage.setItem(TASKS_KEY, JSON.stringify(newState));
      return newState;
    });
  };

  const completeTask = (taskId) => {
    let earnedPoints = 0;

    setTasks(prev => {
      const newList = prev.list.map(t => {
        if (t.id === taskId && t.status === 'started' && !t.completed) {
          earnedPoints = t.points;
          return { ...t, status: 'completed', completed: true, pointsEarned: earnedPoints };
        }
        return t;
      });
      const newState = { ...prev, list: newList };
      localStorage.setItem(TASKS_KEY, JSON.stringify(newState));
      return newState;
    });

    if (earnedPoints > 0) {
      setPoints(prev => {
        const newPoints = {
          ...prev,
          total: prev.total + earnedPoints,
          today: prev.today + earnedPoints
        };
        localStorage.setItem(POINTS_KEY, JSON.stringify(newPoints));
        return newPoints;
      });
    }
  };

  const getLevel = (totalPoints) => {
    if (totalPoints <= 50) return { label: 'Beginner', variant: 'default', icon: Leaf };
    if (totalPoints <= 150) return { label: 'Active Worker', variant: 'saffron', icon: Star };
    return { label: 'Star Performer', variant: 'success', icon: Trophy };
  };

  return {
    points,
    tasks: tasks.list,
    startTask,
    completeTask,
    level: getLevel(points.total),
    totalCompleted: points.totalCompleted || Math.floor(points.total / 15) // Fallback heuristic
  };
};
