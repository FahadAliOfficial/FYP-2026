/**
 * Question Reporting System Types
 * 
 * Students can report issues with questions during or after exams.
 * Admins review and resolve reports from the admin dashboard.
 */

export type ReportType = 
  | 'incorrect_answer'      // Marked correct answer is wrong
  | 'missing_correct'       // None of the options are correct
  | 'confusing_wording'     // Question is unclear/ambiguous
  | 'explanation_mismatch'  // Explanation doesn't match answer
  | 'other'                 // Other issue (requires description)

export type ReportStatus = 
  | 'pending'    // Awaiting admin review
  | 'resolved'   // Fixed/addressed by admin
  | 'dismissed'  // Invalid or not actionable

export interface CreateReportRequest {
  question_id: string
  session_id?: string
  report_type: ReportType
  description: string
}

export interface QuestionReport {
  id: number
  question_id: string
  reporter_user_id: string
  reporter_email: string
  session_id?: string
  report_type: ReportType
  description: string
  status: ReportStatus
  created_at: string
  resolved_at?: string
  resolved_by?: string
  resolved_by_email?: string
  question_preview?: {
    question_text: string
    language_id: string
    mapping_id: string
    difficulty: number
  }
}

export interface ReportStats {
  pending_count: number
  resolved_count: number
  dismissed_count: number
  total_count: number
}

export interface ReportFilters {
  status?: ReportStatus | 'all'
  question_id?: string
  user_email?: string
  search?: string
  limit?: number
  offset?: number
}

export interface UpdateReportStatusRequest {
  status: 'resolved' | 'dismissed'
  admin_notes?: string
}

export interface ReportListResponse {
  reports: QuestionReport[]
  total_count: number
  filtered_count: number
}
