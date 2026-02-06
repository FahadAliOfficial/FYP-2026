"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, AlertTriangle, Clock, Target, Flag, Activity } from "lucide-react"
import { Progress } from "@/components/ui/progress"

// TODO: Add role-based access control when backend supports admin roles
export default function QualityMetricsPage() {
  // TODO: In production, fetch from API - GET /api/admin/quality-metrics
  
  // Questions with highest failure rates
  const mockHighFailureQuestions = [
    {
      id: 8925,
      language: "Python",
      concept: "Variables",
      subTopic: "variable_scope",
      question: "What is the scope of variable 'x'...",
      failureRate: 78.5,
      totalAttempts: 234,
      reportCount: 5,
      avgTimeSeconds: 145,
    },
    {
      id: 7891,
      language: "JavaScript",
      concept: "Loops",
      subTopic: "while_loop_basics",
      question: "What is the output of this while loop...",
      failureRate: 72.3,
      totalAttempts: 187,
      reportCount: 3,
      avgTimeSeconds: 189,
    },
    {
      id: 9123,
      language: "Java",
      concept: "OOP Basics",
      subTopic: "class_basics",
      question: "Which keyword is used to create a class...",
      failureRate: 68.9,
      totalAttempts: 312,
      reportCount: 1,
      avgTimeSeconds: 98,
    },
    {
      id: 8456,
      language: "C++",
      concept: "Functions",
      subTopic: "function_return_types",
      question: "What will this function return...",
      failureRate: 65.2,
      totalAttempts: 156,
      reportCount: 2,
      avgTimeSeconds: 167,
    },
  ]

  // Questions with most reports
  const mockMostReportedQuestions = [
    {
      id: 8925,
      language: "Python",
      concept: "Variables",
      question: "What is the scope of variable 'x'...",
      reportCount: 5,
      failureRate: 78.5,
      lastReported: "2026-01-28T11:20:00Z",
      mainIssue: "confusing_wording",
    },
    {
      id: 7891,
      language: "JavaScript",
      concept: "Loops",
      question: "What is the output of this while loop...",
      reportCount: 3,
      failureRate: 72.3,
      lastReported: "2026-01-27T09:15:00Z",
      mainIssue: "incorrect_answer",
    },
    {
      id: 8456,
      language: "C++",
      concept: "Functions",
      question: "What will this function return...",
      reportCount: 2,
      failureRate: 65.2,
      lastReported: "2026-01-26T14:30:00Z",
      mainIssue: "typo",
    },
  ]

  // Average time per concept
  const mockConceptTimeStats = [
    { concept: "OOP Advanced", avgTime: 487, difficulty: 0.85, sessionCount: 1234 },
    { concept: "Error Handling", avgTime: 423, difficulty: 0.75, sessionCount: 1567 },
    { concept: "Functions", avgTime: 398, difficulty: 0.65, sessionCount: 2103 },
    { concept: "Collections", avgTime: 376, difficulty: 0.70, sessionCount: 1876 },
    { concept: "Loops", avgTime: 345, difficulty: 0.60, sessionCount: 2654 },
    { concept: "Conditionals", avgTime: 298, difficulty: 0.55, sessionCount: 2987 },
    { concept: "Variables", avgTime: 234, difficulty: 0.45, sessionCount: 3421 },
    { concept: "OOP Basics", avgTime: 412, difficulty: 0.72, sessionCount: 1543 },
  ]

  // Error pattern trends
  const mockErrorPatterns = [
    {
      errorType: "SYNTAX_ERROR",
      count: 1234,
      percentage: 28.5,
      topConcepts: ["Loops", "Functions", "Variables"],
      trend: "up",
    },
    {
      errorType: "LOGIC_ERROR",
      count: 987,
      percentage: 22.8,
      topConcepts: ["Conditionals", "Loops", "Functions"],
      trend: "stable",
    },
    {
      errorType: "OFF_BY_ONE_ERROR",
      count: 756,
      percentage: 17.5,
      topConcepts: ["Loops", "Collections"],
      trend: "down",
    },
    {
      errorType: "TYPE_MISMATCH",
      count: 543,
      percentage: 12.6,
      topConcepts: ["Variables", "Functions"],
      trend: "up",
    },
    {
      errorType: "NULL_REFERENCE",
      count: 432,
      percentage: 10.0,
      topConcepts: ["OOP Basics", "Variables"],
      trend: "stable",
    },
    {
      errorType: "SCOPE_ERROR",
      count: 378,
      percentage: 8.7,
      topConcepts: ["Variables", "Functions"],
      trend: "down",
    },
  ]

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400 rotate-180" />
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
    return <Activity className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent">
          Quality Metrics
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Question performance and error pattern analysis
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 border-red-200 dark:border-red-900 bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg Failure Rate</p>
                <p className="text-3xl font-black text-red-600 dark:text-red-400">
                  {(mockHighFailureQuestions.reduce((acc, q) => acc + q.failureRate, 0) / mockHighFailureQuestions.length).toFixed(1)}%
                </p>
              </div>
              <TrendingDown className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200 dark:border-yellow-900 bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg Answer Time</p>
                <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400">
                  {Math.round(mockConceptTimeStats.reduce((acc, c) => acc + c.avgTime, 0) / mockConceptTimeStats.length)}s
                </p>
              </div>
              <Clock className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 dark:border-orange-900 bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">High-Risk Questions</p>
                <p className="text-3xl font-black text-orange-600 dark:text-orange-400">
                  {mockHighFailureQuestions.filter(q => q.failureRate > 70).length}
                </p>
              </div>
              <AlertTriangle className="h-12 w-12 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 dark:border-purple-900 bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Error Patterns</p>
                <p className="text-3xl font-black text-purple-600 dark:text-purple-400">
                  {mockErrorPatterns.reduce((acc, p) => acc + p.count, 0)}
                </p>
              </div>
              <Target className="h-12 w-12 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions with Highest Failure Rates */}
      <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            Questions with Highest Failure Rates
          </CardTitle>
          <CardDescription>Questions where students struggle the most</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockHighFailureQuestions.map((question, index) => (
              <div
                key={question.id}
                className="p-4 rounded-lg border-2 border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 hover:border-red-300 dark:hover:border-red-800 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="h-8 w-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold">
                      ID: {question.id}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-xs font-bold">
                      {question.language}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 text-xs font-bold">
                      {question.concept}
                    </span>
                    {question.reportCount > 0 && (
                      <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 text-xs font-bold flex items-center gap-1">
                        <Flag className="h-3 w-3" />
                        {question.reportCount} Reports
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-900 dark:text-white mb-3 font-mono bg-slate-100 dark:bg-slate-900 p-2 rounded">
                  {question.question}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-600 dark:text-slate-400">Failure Rate</span>
                      <span className="text-lg font-black text-red-600 dark:text-red-400">
                        {question.failureRate}%
                      </span>
                    </div>
                    <Progress value={question.failureRate} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Total Attempts</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {question.totalAttempts}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Avg Time</span>
                    <span className="text-lg font-black text-yellow-600 dark:text-yellow-400">
                      {question.avgTimeSeconds}s
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Most Reported Questions */}
      <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center gap-2">
            <Flag className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            Most Reported Questions
          </CardTitle>
          <CardDescription>Questions with the most user reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockMostReportedQuestions.map((question) => (
              <div
                key={question.id}
                className="p-4 rounded-lg border-2 border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold">
                      ID: {question.id}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-xs font-bold">
                      {question.language}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 text-xs font-bold">
                      {question.concept}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 text-xs font-bold">
                      {question.reportCount} Reports
                    </span>
                    <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 text-xs font-bold">
                      {question.failureRate}% Failure
                    </span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    Last: {new Date(question.lastReported).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-sm text-slate-900 dark:text-white font-mono bg-slate-100 dark:bg-slate-900 p-2 rounded">
                  {question.question}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Average Time Per Concept */}
      <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center gap-2">
            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            Average Time Per Concept
          </CardTitle>
          <CardDescription>How long students spend on each concept</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockConceptTimeStats.sort((a, b) => b.avgTime - a.avgTime).map((concept, index) => (
              <div key={concept.concept} className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-600 to-orange-600 text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{concept.concept}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {concept.sessionCount} sessions • Difficulty: {(concept.difficulty * 100).toFixed(0)}%
                      </p>
                    </div>
                    <span className="text-lg font-black text-yellow-600 dark:text-yellow-400">
                      {concept.avgTime}s
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-600 to-orange-500 rounded-full"
                      style={{ width: `${(concept.avgTime / 500) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Pattern Trends */}
      <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Error Pattern Trends
          </CardTitle>
          <CardDescription>Most common error types across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockErrorPatterns.map((pattern) => (
              <div
                key={pattern.errorType}
                className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {pattern.errorType.replace(/_/g, ' ')}
                      </h3>
                      {getTrendIcon(pattern.trend)}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Most common in: {pattern.topConcepts.join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                      {pattern.count}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {pattern.percentage}% of errors
                    </p>
                  </div>
                </div>

                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"
                    style={{ width: `${pattern.percentage * 3}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  )
}
