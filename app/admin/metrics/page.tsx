"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingDown, AlertTriangle, Clock, Target, Flag, Activity, Loader2, RefreshCw } from "lucide-react"
import {
  getAdminConceptTimeStats,
  getAdminErrorPatternTrends,
  getAdminHighFailureQuestions,
  getAdminMostReportedQuestions,
  type AdminConceptTimeStat,
  type AdminErrorPatternTrend,
  type AdminHighFailureQuestion,
  type AdminMetricsFilters,
  type AdminMostReportedQuestion,
} from "@/lib/api/admin-metrics"
import { formatAPIError } from "@/lib/api/client"

const LANGUAGE_OPTIONS = [
  { value: "all", label: "All Languages" },
  { value: "python_3", label: "Python" },
  { value: "javascript_es6", label: "JavaScript" },
  { value: "java_17", label: "Java" },
  { value: "cpp_20", label: "C++" },
  { value: "go_1_21", label: "Go" },
  { value: "typescript_5", label: "TypeScript" },
]

const LIMIT_OPTIONS = [5, 10, 20, 30, 50]

const ISSUE_LABELS: Record<string, string> = {
  incorrect_answer: "Incorrect Answer",
  missing_correct: "Missing Correct Option",
  confusing_wording: "Confusing Wording",
  explanation_mismatch: "Explanation Mismatch",
  other: "Other",
}

function formatDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getDefaultStartDateValue(defaultDaysBack: number): string {
  const date = new Date()
  date.setDate(date.getDate() - defaultDaysBack)
  return formatDateInputValue(date)
}

function calculateWindowDaysFromStartDate(startDateValue: string): number {
  const fallbackDays = 30
  if (!startDateValue) return fallbackDays

  const startDate = new Date(`${startDateValue}T00:00:00`)
  if (Number.isNaN(startDate.getTime())) return fallbackDays

  const now = new Date()
  const diffMs = now.getTime() - startDate.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  return Math.max(1, diffDays)
}

// TODO: Add role-based access control when backend supports admin roles
export default function QualityMetricsPage() {
  const [languageFilter, setLanguageFilter] = useState("all")
  const [startDate, setStartDate] = useState<string>(() => getDefaultStartDateValue(30))
  const [topLimit, setTopLimit] = useState(10)

  const maxSelectableDate = useMemo(() => formatDateInputValue(new Date()), [])
  const windowDays = useMemo(() => calculateWindowDaysFromStartDate(startDate), [startDate])

  const [highFailureQuestions, setHighFailureQuestions] = useState<AdminHighFailureQuestion[]>([])
  const [mostReportedQuestions, setMostReportedQuestions] = useState<AdminMostReportedQuestion[]>([])
  const [conceptTimeStats, setConceptTimeStats] = useState<AdminConceptTimeStat[]>([])
  const [errorPatterns, setErrorPatterns] = useState<AdminErrorPatternTrend[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const filters: AdminMetricsFilters = {
        window_days: windowDays,
        limit: topLimit,
      }
      if (languageFilter !== "all") {
        filters.language_id = languageFilter
      }

      const [highFailureResult, mostReportedResult, conceptTimeResult, errorTrendResult] = await Promise.allSettled([
        getAdminHighFailureQuestions(filters),
        getAdminMostReportedQuestions(filters),
        getAdminConceptTimeStats(filters),
        getAdminErrorPatternTrends(filters),
      ])

      const endpointErrors: string[] = []

      if (highFailureResult.status === "fulfilled") {
        setHighFailureQuestions(highFailureResult.value.questions)
      } else {
        setHighFailureQuestions([])
        endpointErrors.push(`high-failure (${formatAPIError(highFailureResult.reason)})`)
      }

      if (mostReportedResult.status === "fulfilled") {
        setMostReportedQuestions(mostReportedResult.value.questions)
      } else {
        setMostReportedQuestions([])
        endpointErrors.push(`most-reported (${formatAPIError(mostReportedResult.reason)})`)
      }

      if (conceptTimeResult.status === "fulfilled") {
        setConceptTimeStats(conceptTimeResult.value.concepts)
      } else {
        setConceptTimeStats([])
        endpointErrors.push(`concept-time (${formatAPIError(conceptTimeResult.reason)})`)
      }

      if (errorTrendResult.status === "fulfilled") {
        setErrorPatterns(errorTrendResult.value.patterns)
      } else {
        setErrorPatterns([])
        endpointErrors.push(`error-patterns (${formatAPIError(errorTrendResult.reason)})`)
      }

      if (endpointErrors.length > 0) {
        setLoadError(`Some metric sections failed to load: ${endpointErrors.join(" | ")}`)
      }
    } catch (error) {
      setLoadError(formatAPIError(error))
      setHighFailureQuestions([])
      setMostReportedQuestions([])
      setConceptTimeStats([])
      setErrorPatterns([])
    } finally {
      setIsLoading(false)
    }
  }, [languageFilter, topLimit, windowDays])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    if (trend === "up") return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400 rotate-180" />
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
    return <Activity className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
  }

  const averageFailureRate = useMemo(() => {
    if (highFailureQuestions.length === 0) return 0
    const total = highFailureQuestions.reduce((acc, question) => acc + question.failure_rate, 0)
    return total / highFailureQuestions.length
  }, [highFailureQuestions])

  const averageConceptTime = useMemo(() => {
    if (conceptTimeStats.length === 0) return 0
    const total = conceptTimeStats.reduce((acc, concept) => acc + concept.avg_time_seconds, 0)
    return total / conceptTimeStats.length
  }, [conceptTimeStats])

  const highRiskCount = useMemo(
    () => highFailureQuestions.filter(question => question.failure_rate > 70).length,
    [highFailureQuestions]
  )

  const totalErrorPatterns = useMemo(
    () => errorPatterns.reduce((acc, pattern) => acc + pattern.count, 0),
    [errorPatterns]
  )

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent">
            Quality Metrics
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Question performance and error pattern analysis
          </p>
        </div>

        <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <p className="mb-2 text-xs text-slate-600 dark:text-slate-400">Language</p>
                <Select value={languageFilter} onValueChange={setLanguageFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="mb-2 text-xs text-slate-600 dark:text-slate-400">Start Date</p>
                <Input
                  type="date"
                  value={startDate}
                  max={maxSelectableDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Window: last {windowDays} day{windowDays === 1 ? "" : "s"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs text-slate-600 dark:text-slate-400">Top N</p>
                <Select value={String(topLimit)} onValueChange={(value) => setTopLimit(Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select limit" />
                  </SelectTrigger>
                  <SelectContent>
                    {LIMIT_OPTIONS.map(option => (
                      <SelectItem key={option} value={String(option)}>
                        Top {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button className="w-full" onClick={fetchMetrics} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  <span className="ml-2">Refresh</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {loadError && (
          <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-2 border-red-200 dark:border-red-900 bg-white dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Avg Failure Rate</p>
                  <p className="text-3xl font-black text-red-600 dark:text-red-400">
                    {averageFailureRate.toFixed(1)}%
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
                    {Math.round(averageConceptTime)}s
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
                    {highRiskCount}
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
                    {totalErrorPatterns}
                  </p>
                </div>
                <Target className="h-12 w-12 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              Questions with Highest Failure Rates
            </CardTitle>
            <CardDescription>Questions where students struggle the most</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-slate-600 dark:text-slate-400">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading high-failure questions...
              </div>
            ) : highFailureQuestions.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No high-failure question data for the selected filters.
              </p>
            ) : (
              <div className="space-y-4">
                {highFailureQuestions.map((question, index) => (
                  <div
                    key={question.question_id}
                    className="p-4 rounded-lg border-2 border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 hover:border-red-300 dark:hover:border-red-800 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="h-8 w-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold">
                          ID: {question.question_id}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-xs font-bold">
                          {question.language_id}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 text-xs font-bold">
                          {question.concept}
                        </span>
                        {question.report_count > 0 && (
                          <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 text-xs font-bold flex items-center gap-1">
                            <Flag className="h-3 w-3" />
                            {question.report_count} Reports
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-slate-900 dark:text-white mb-3 font-mono bg-slate-100 dark:bg-slate-900 p-2 rounded">
                      {question.question_text || "No question text available"}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-600 dark:text-slate-400">Failure Rate</span>
                          <span className="text-lg font-black text-red-600 dark:text-red-400">
                            {question.failure_rate}%
                          </span>
                        </div>
                        <Progress value={Math.min(Math.max(question.failure_rate, 0), 100)} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Total Attempts</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          {question.total_attempts}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Avg Time</span>
                        <span className="text-lg font-black text-yellow-600 dark:text-yellow-400">
                          {question.avg_time_seconds ? `${Math.round(question.avg_time_seconds)}s` : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <Flag className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              Most Reported Questions
            </CardTitle>
            <CardDescription>Questions with the most user reports</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-slate-600 dark:text-slate-400">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading report metrics...
              </div>
            ) : mostReportedQuestions.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No reported-question data for the selected filters.
              </p>
            ) : (
              <div className="space-y-4">
                {mostReportedQuestions.map((question) => (
                  <div
                    key={question.question_id}
                    className="p-4 rounded-lg border-2 border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold">
                          ID: {question.question_id}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-xs font-bold">
                          {question.language_id}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 text-xs font-bold">
                          {question.concept}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 text-xs font-bold">
                          {question.report_count} Reports
                        </span>
                        <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 text-xs font-bold">
                          {question.failure_rate}% Failure
                        </span>
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        Last: {question.last_reported ? new Date(question.last_reported).toLocaleDateString() : "N/A"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-900 dark:text-white mb-2 font-mono bg-slate-100 dark:bg-slate-900 p-2 rounded">
                      {question.question_text || "No question text available"}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Main issue: {ISSUE_LABELS[question.main_issue] || question.main_issue}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              Average Time Per Concept
            </CardTitle>
            <CardDescription>How long students spend on each concept</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-slate-600 dark:text-slate-400">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading concept timing metrics...
              </div>
            ) : conceptTimeStats.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No concept-time data for the selected filters.
              </p>
            ) : (
              <div className="space-y-4">
                {[...conceptTimeStats].sort((a, b) => b.avg_time_seconds - a.avg_time_seconds).map((concept, index) => (
                  <div key={concept.mapping_id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-600 to-orange-600 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">{concept.concept}</h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {concept.session_count} sessions • Difficulty: {(concept.avg_difficulty * 100).toFixed(0)}%
                          </p>
                        </div>
                        <span className="text-lg font-black text-yellow-600 dark:text-yellow-400">
                          {Math.round(concept.avg_time_seconds)}s
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-600 to-orange-500 rounded-full"
                          style={{ width: `${Math.min((concept.avg_time_seconds / 500) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              Error Pattern Trends
            </CardTitle>
            <CardDescription>Most common error types across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-slate-600 dark:text-slate-400">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading error pattern metrics...
              </div>
            ) : errorPatterns.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No error-pattern data for the selected filters.
              </p>
            ) : (
              <div className="space-y-4">
                {errorPatterns.map((pattern) => (
                  <div
                    key={pattern.error_type}
                    className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 dark:text-white">
                            {pattern.error_type.replace(/_/g, " ")}
                          </h3>
                          {getTrendIcon(pattern.trend)}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Most common in: {pattern.top_concepts.length > 0 ? pattern.top_concepts.join(", ") : "N/A"}
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
                        style={{ width: `${Math.min(pattern.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
