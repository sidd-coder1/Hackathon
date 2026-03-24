import React from 'react'
import { useRewards } from '../hooks/useRewards'
import PointsCard from '../components/worker/PointsCard'
import TaskList from '../components/worker/TaskList'
import { Target, Trophy, Star, ChevronRight } from 'lucide-react'

export default function WorkerMissionsPage() {
  const { points, tasks: dailyTasks, completeTask, level } = useRewards()

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center shadow-sm">
            <Target className="text-orange-600" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Daily Missions</h1>
            <p className="text-sm text-gray-500 font-medium">Complete tasks to earn points & level up</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm">
          <Trophy className="text-yellow-500" size={18} />
          <span className="text-sm font-bold text-gray-700">Level {level.label}</span>
        </div>
      </div>

      {/* Points & Progress Overview */}
      <PointsCard points={points} level={level} />

      {/* Main Missions Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <h2 className="font-bold text-gray-900">Active Missions</h2>
          </div>
          <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">
            {dailyTasks.filter(t => !t.completed).length} Remaning
          </p>
        </div>
        
        <div className="p-6">
          <TaskList tasks={dailyTasks} onCompleteTask={completeTask} />
        </div>
      </div>

      {/* Bonus Reward Card */}
      <div className="relative overflow-hidden bg-gray-900 rounded-3xl p-8 text-white shadow-xl shadow-gray-200">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0">
            <Star className="text-yellow-400 fill-yellow-400" size={32} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">Next Milestone: Silver Sweeper</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-md">
              Complete 5 more missions to unlock this exclusive badge and earn a <span className="text-white font-bold">500 point bonus!</span>
            </p>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-orange-400 uppercase tracking-wider">Progress</span>
                <span>60%</span>
              </div>
              <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-orange-400 h-full w-[60%] transition-all duration-1000 shadow-[0_0_15px_rgba(249,115,22,0.4)]" 
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Decorative Element */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
