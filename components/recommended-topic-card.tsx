"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Clock, TrendingUp, ArrowRight } from "lucide-react"

interface RecommendedTopic {
  concept_id: string
  concept_name: string
  sub_topic: string
  target_difficulty: number // 0.0-1.0
  estimated_time_minutes: number
  reason: string
  prerequisite_met: boolean
}

interface RecommendedTopicCardProps {
  recommendation: RecommendedTopic | null
  onStartPractice: (conceptId: string, subTopic: string) => void
}

export function RecommendedTopicCard({ recommendation, onStartPractice }: RecommendedTopicCardProps) {
  if (!recommendation) {
    return (
      <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-slate-400" />
            AI Recommendation
          </CardTitle>
          <CardDescription>
            Complete more topics to get personalized recommendations
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty < 0.4) return { label: "Beginner", color: "from-green-500 to-green-600" }
    if (difficulty < 0.7) return { label: "Intermediate", color: "from-yellow-500 to-yellow-600" }
    return { label: "Advanced", color: "from-red-500 to-red-600" }
  }

  const difficulty = getDifficultyLabel(recommendation.target_difficulty)

  return (
    <Card className="relative overflow-hidden border-2 border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 shadow-xl">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-green-500/10 to-yellow-500/10 animate-gradient"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full filter blur-[100px] opacity-20 animate-pulse"></div>
      
      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg">
                <Sparkles className="h-5 w-5 text-slate-900" />
              </div>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                AI Recommended for You
              </span>
            </div>
            <CardTitle className="text-3xl font-black text-slate-900 dark:text-white mb-2">
              {recommendation.concept_name}
            </CardTitle>
            <CardDescription className="text-lg text-slate-700 dark:text-slate-300 font-medium">
              {recommendation.sub_topic.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </CardDescription>
          </div>
          
          {/* Difficulty Badge */}
          <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${difficulty.color} text-white font-bold text-sm shadow-lg whitespace-nowrap`}>
            {difficulty.label}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Estimated Time</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {recommendation.estimated_time_minutes} min
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Difficulty</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {Math.round(recommendation.target_difficulty * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-blue-600 dark:text-blue-400">Why this topic?</span>
            <br />
            {recommendation.reason}
          </p>
        </div>

        {/* Prerequisites Warning */}
        {!recommendation.prerequisite_met && (
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-700 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
              ⚠️ Complete prerequisite topics first for best results
            </p>
          </div>
        )}

        {/* CTA Button */}
        <Button
          onClick={() => onStartPractice(recommendation.concept_id, recommendation.sub_topic)}
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 via-green-500 to-blue-600 hover:from-blue-500 hover:via-green-400 hover:to-blue-500 text-white shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105 transition-all duration-300"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          Start Practice Now
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}
