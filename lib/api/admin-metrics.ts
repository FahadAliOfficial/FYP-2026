/**
 * Admin Metrics API Service
 *
 * Service layer for admin quality metrics endpoints.
 */

import { get } from "./client"

export type MetricsWindowDays = 7 | 30 | 90

export interface AdminMetricsFilters {
  language_id?: string
  window_days?: number
  limit?: number
}

export interface AdminHighFailureQuestion {
  question_id: string
  language_id: string
  concept: string
  sub_topic: string | null
  question_text: string
  failure_rate: number
  total_attempts: number
  report_count: number
  avg_time_seconds: number | null
}

export interface AdminHighFailureQuestionsResponse {
  success: boolean
  language_id: string | null
  window_days: number
  limit: number
  questions: AdminHighFailureQuestion[]
}

export interface AdminMostReportedQuestion {
  question_id: string
  language_id: string
  concept: string
  question_text: string
  report_count: number
  failure_rate: number
  last_reported: string | null
  main_issue: string
}

export interface AdminMostReportedQuestionsResponse {
  success: boolean
  language_id: string | null
  window_days: number
  limit: number
  questions: AdminMostReportedQuestion[]
}

export interface AdminConceptTimeStat {
  concept: string
  mapping_id: string
  avg_time_seconds: number
  avg_difficulty: number
  session_count: number
}

export interface AdminConceptTimeStatsResponse {
  success: boolean
  language_id: string | null
  window_days: number
  limit: number
  concepts: AdminConceptTimeStat[]
}

export interface AdminErrorPatternTrend {
  error_type: string
  count: number
  percentage: number
  top_concepts: string[]
  trend: "up" | "down" | "stable"
}

export interface AdminErrorPatternTrendsResponse {
  success: boolean
  language_id: string | null
  window_days: number
  limit: number
  total_errors: number
  patterns: AdminErrorPatternTrend[]
}

function toQueryParams(filters: AdminMetricsFilters = {}): string {
  const params = new URLSearchParams()

  if (filters.language_id) {
    params.append("language_id", filters.language_id)
  }
  if (filters.window_days) {
    params.append("window_days", String(filters.window_days))
  }
  if (filters.limit) {
    params.append("limit", String(filters.limit))
  }

  const query = params.toString()
  return query ? `?${query}` : ""
}

export async function getAdminHighFailureQuestions(
  filters: AdminMetricsFilters = {}
): Promise<AdminHighFailureQuestionsResponse> {
  return get<AdminHighFailureQuestionsResponse>(`/api/admin/metrics/high-failure-questions${toQueryParams(filters)}`)
}

export async function getAdminMostReportedQuestions(
  filters: AdminMetricsFilters = {}
): Promise<AdminMostReportedQuestionsResponse> {
  return get<AdminMostReportedQuestionsResponse>(`/api/admin/metrics/most-reported-questions${toQueryParams(filters)}`)
}

export async function getAdminConceptTimeStats(
  filters: AdminMetricsFilters = {}
): Promise<AdminConceptTimeStatsResponse> {
  return get<AdminConceptTimeStatsResponse>(`/api/admin/metrics/concept-time-stats${toQueryParams(filters)}`)
}

export async function getAdminErrorPatternTrends(
  filters: AdminMetricsFilters = {}
): Promise<AdminErrorPatternTrendsResponse> {
  return get<AdminErrorPatternTrendsResponse>(`/api/admin/metrics/error-pattern-trends${toQueryParams(filters)}`)
}
