import React from 'react'
import { useRewards } from '../hooks/useRewards'
import PointsCard from '../components/worker/PointsCard'
import TaskList from '../components/worker/TaskList'
import { Target, Trophy, Star, ChevronRight, Flame } from 'lucide-react'

export default function WorkerMissionsPage() {
  const { points, tasks: dailyTasks, startTask, completeTask, level, totalCompleted } = useRewards()
  
  const completedCount = dailyTasks.filter(t => t.completed).length
  const totalCount = dailyTasks.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  
  // Milestone calculation: e.g., every 5 missions is a milestone
  const nextMilestoneCount = Math.ceil((totalCompleted + 1) / 5) * 5
  const milestoneProgress = ((totalCompleted % 5) / 5) * 100
  const missionsLeft = 5 - (totalCompleted % 5)

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10 animate-fade-in w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-saffron-50 border border-saffron-100 flex items-center justify-center">
            <Target className="text-saffron-600" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Daily Missions</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Complete tasks to earn points & level up</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button 
            onClick={() => {
              localStorage.removeItem('swachh_daily_tasks');
              localStorage.removeItem('swachh_points_data');
              window.location.reload();
            }} 
            className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest mr-2"
          >
            [ Reset System ]
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-saffron-50 border border-saffron-200/60 shadow-sm rounded-lg">
            <Flame className="text-saffron-500 fill-saffron-500 animate-pulse-slow" size={18} />
            <span className="text-sm font-extrabold text-saffron-700">{points.streak || 1} Day Streak</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg">
            <Trophy className="text-saffron-500" size={18} />
            <span className="text-sm font-bold text-gray-900">Level {level.label}</span>
          </div>
        </div>
      </div>

      {/* Points & Progress Overview */}
      <PointsCard points={points} level={level} />

      {/* Main Missions Section */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-saffron-500 rounded-full animate-pulse" />
            <h2 className="text-lg font-bold text-gray-900">Active Missions</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-600">{completedCount}/{totalCount} Completed</span>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-saffron-500 transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        
        <div className="p-0">
          <TaskList tasks={dailyTasks} onStartTask={startTask} onCompleteTask={completeTask} />
        </div>
      </div>

      {/* Bonus Reward Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col md:flex-row md:items-center gap-6">
        <div className="w-16 h-16 rounded-xl bg-saffron-50 border border-saffron-100 flex items-center justify-center flex-shrink-0">
          <Star className="text-saffron-500 fill-orange-500" size={32} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Next Milestone: {totalCompleted < 10 ? 'Silver Sweeper' : 'Elite Janitor'}</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-md">
            Complete <span className="text-gray-900 font-bold">{missionsLeft}</span> more missions to unlock this exclusive badge and earn a <span className="text-gray-900 font-bold">500 point bonus!</span>
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-gray-500 font-medium">Milestone Progress</span>
              <span className="text-gray-900">{Math.round(milestoneProgress)}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-saffron-500 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${milestoneProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
