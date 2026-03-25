import React from 'react'
import { useRewards } from '../hooks/useRewards'
import PointsCard from '../components/worker/PointsCard'
import TaskList from '../components/worker/TaskList'
import { Target, Trophy, Star, ChevronRight } from 'lucide-react'

export default function WorkerMissionsPage() {
  const { points, tasks: dailyTasks, completeTask, level } = useRewards()

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10 animate-fade-in">
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
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
          <Trophy className="text-saffron-500" size={18} />
          <span className="text-sm font-bold text-gray-900">Level {level.label}</span>
        </div>
      </div>

      {/* Points & Progress Overview */}
      <PointsCard points={points} level={level} />

      {/* Main Missions Section */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-saffron-500 rounded-full animate-pulse" />
            <h2 className="text-lg font-bold text-gray-900">Active Missions</h2>
          </div>
          <span className="text-sm font-semibold text-saffron-600 bg-saffron-50 px-3 py-1 rounded-full border border-saffron-100">
            {dailyTasks.filter(t => !t.completed).length} Remaining
          </span>
        </div>
        
        <div className="p-0">
          <TaskList tasks={dailyTasks} onCompleteTask={completeTask} />
        </div>
      </div>

      {/* Bonus Reward Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col md:flex-row md:items-center gap-6">
        <div className="w-16 h-16 rounded-xl bg-saffron-50 border border-saffron-100 flex items-center justify-center flex-shrink-0">
          <Star className="text-saffron-500 fill-orange-500" size={32} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Next Milestone: Silver Sweeper</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-md">
            Complete 5 more missions to unlock this exclusive badge and earn a <span className="text-gray-900 font-bold">500 point bonus!</span>
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-gray-500 font-medium">Progress</span>
              <span className="text-gray-900">60%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-saffron-500 h-full w-[60%] rounded-full transition-all duration-1000" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
