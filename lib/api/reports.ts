/**
 * Question Reporting API Client
 * 
 * Students can report issues with questions during or after exams.
 * Admins can review and manage reports from the admin dashboard.
 */

import { get, post, del, apiClient } from './client'
import type {
  CreateReportRequest,
  QuestionReport,
  ReportStats,
  ReportFilters,
  ReportListResponse,
  UpdateReportStatusRequest
} from '@/lib/types/reports'

/**
 * Create a new question report (student endpoint)
 * 
 * Students can flag questions during or after exams.
 * One report per student per question.
 */
export async function createQuestionReport(
  data: CreateReportRequest
): Promise<QuestionReport> {
  return post<QuestionReport>('/api/reports', data)
}

/**
 * Get all reports created by the current user
 * 
 * @param sessionId - Optional filter by session ID
 */
export async function getUserReports(
  sessionId?: string
): Promise<QuestionReport[]> {
  const endpoint = sessionId 
    ? `/api/reports/user?session_id=${sessionId}` 
    : '/api/reports/user'
  return get<QuestionReport[]>(endpoint)
}

/**
 * Get all question reports with filters (admin only)
 * 
 * Supports filtering by status, question_id, and search text.
 * Returns paginated results with question preview data.
 */
export async function getAdminReports(
  filters: ReportFilters = {}
): Promise<ReportListResponse> {
  const params = new URLSearchParams()
  
  if (filters.status && filters.status !== 'all') {
    params.append('status_filter', filters.status)
  }
  
  if (filters.question_id) {
    params.append('question_id', filters.question_id)
  }
  
  if (filters.search) {
    params.append('search', filters.search)
  }
  
  if (filters.limit !== undefined) {
    params.append('limit', filters.limit.toString())
  }
  
  if (filters.offset !== undefined) {
    params.append('offset', filters.offset.toString())
  }
  
  const queryString = params.toString()
  const endpoint = queryString ? `/api/admin/reports?${queryString}` : '/api/admin/reports'
  return get<ReportListResponse>(endpoint)
}

/**
 * Get report statistics for admin dashboard
 */
export async function getReportStats(): Promise<ReportStats> {
  return get<ReportStats>('/api/admin/reports/stats')
}

/**
 * Mark a report as resolved (admin only)
 * 
 * @param reportId - Report ID
 * @param adminNotes - Optional admin notes
 */
export async function resolveReport(
  reportId: number,
  adminNotes?: string
): Promise<QuestionReport> {
  const data: UpdateReportStatusRequest = {
    status: 'resolved',
    admin_notes: adminNotes
  }
  return apiClient<QuestionReport>(`/api/admin/reports/${reportId}/resolve`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
}

/**
 * Mark a report as dismissed (admin only)
 * 
 * @param reportId - Report ID
 * @param adminNotes - Optional reason for dismissal
 */
export async function dismissReport(
  reportId: number,
  adminNotes?: string
): Promise<QuestionReport> {
  const data: UpdateReportStatusRequest = {
    status: 'dismissed',
    admin_notes: adminNotes
  }
  return apiClient<QuestionReport>(`/api/admin/reports/${reportId}/dismiss`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
}

/**
 * Delete a report (admin only, rare use case)
 */
export async function deleteReport(reportId: number): Promise<void> {
  await del<void>(`/api/admin/reports/${reportId}`)
}
