/**
 * Admin Questions API Service
 * 
 * Service layer for admin question bank management endpoints.
 * Used by admin components for browsing, editing, and managing questions.
 */

import { get, post, apiClient } from './client';

/**
 * Admin question data structure (matches backend AdminQuestion schema)
 */
export interface AdminQuestion {
  id: string;
  language_id: string;
  mapping_id: string;
  sub_topic: string | null;
  difficulty: number;
  question_data: QuestionData;
  content_hash: string;
  is_verified: boolean;
  quality_score: number;
  times_used: number;
  times_correct: number;
  calibrated_difficulty: number | null;
  created_at: string;
  created_by: string;
  review_notes: string | null;
}

/**
 * Question data JSONB structure
 */
export interface QuestionData {
  question_text: string;
  code_snippet?: string;
  options: QuestionOption[];
  explanation: string;
  primary_error_pattern?: string;
  targeted_errors?: string[];
  question_type?: 'code-based' | 'conceptual' | 'scenario-based';
  quality_score?: number;
}

/**
 * Question option structure
 */
export interface QuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
  error_type: string | null;
  explanation: string;
}

/**
 * Response for listing admin questions
 */
export interface AdminQuestionListResponse {
  success: boolean;
  questions: AdminQuestion[];
  total_count: number;
  verified_count: number;
  unverified_count: number;
  page: number;
  limit: number;
}

/**
 * Request to update question
 */
export interface AdminQuestionUpdateRequest {
  question_data?: QuestionData;
  difficulty?: number;
  quality_score?: number;
  sub_topic?: string;
}

/**
 * Response after updating question
 */
export interface AdminQuestionUpdateResponse {
  success: boolean;
  message: string;
  updated_question: AdminQuestion;
}

/**
 * Response after deleting question
 */
export interface AdminQuestionDeleteResponse {
  success: boolean;
  message: string;
  deleted_id: string;
}

/**
 * Request for bulk operations
 */
export interface AdminBulkActionRequest {
  question_ids: string[];
  action: 'approve' | 'delete' | 'update_difficulty';
  params?: Record<string, any>;
}

/**
 * Response after bulk operation
 */
export interface AdminBulkActionResponse {
  success: boolean;
  message: string;
  affected_count: number;
  failed_count: number;
  failed_ids: string[];
}

/**
 * Question analytics data
 */
export interface AdminQuestionAnalytics {
  question_id: string;
  times_used: number;
  times_correct: number;
  accuracy_rate: number;
  avg_time_spent: number | null;
  quality_score: number;
  calibrated_difficulty: number | null;
  assigned_difficulty: number;
}

/**
 * Low quality questions response
 */
export interface AdminLowQualityQuestionsResponse {
  success: boolean;
  questions: AdminQuestion[];
  total_count: number;
  criteria: Record<string, string>;
}

/**
 * Question generation request
 */
export interface QuestionGenerateRequest {
  topic: string;
  language_id: string;
  mapping_id: string;
  difficulty: number;
  count: number;
  sub_topic?: string;
}

/**
 * Question generation response
 */
export interface QuestionGenerateResponse {
  task_id: string;
  message: string;
  estimated_time_seconds: number;
}

/**
 * Filters for question list
 */
export interface QuestionFilters {
  language_id?: string;
  mapping_id?: string;
  is_verified?: boolean;
  min_quality?: number;
  max_difficulty?: number;
  min_usage?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// ==================== API FUNCTIONS ====================

/**
 * Get all questions with filtering
 */
export async function getAllQuestions(filters: QuestionFilters = {}): Promise<AdminQuestionListResponse> {
  const params = new URLSearchParams();
  
  if (filters.language_id) params.append('language_id', filters.language_id);
  if (filters.mapping_id) params.append('mapping_id', filters.mapping_id);
  if (filters.is_verified !== undefined) params.append('is_verified', String(filters.is_verified));
  if (filters.min_quality !== undefined) params.append('min_quality', String(filters.min_quality));
  if (filters.max_difficulty !== undefined) params.append('max_difficulty', String(filters.max_difficulty));
  if (filters.min_usage !== undefined) params.append('min_usage', String(filters.min_usage));
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  
  const queryString = params.toString();
  const url = `/api/admin/questions${queryString ? `?${queryString}` : ''}`;
  
  return get<AdminQuestionListResponse>(url);
}

/**
 * Get pending (unverified) questions
 */
export async function getPendingQuestions(
  language_id?: string,
  mapping_id?: string,
  limit: number = 50
): Promise<{ total_pending: number; questions: any[] }> {
  const params = new URLSearchParams();
  
  if (language_id) params.append('language_id', language_id);
  if (mapping_id) params.append('mapping_id', mapping_id);
  params.append('limit', String(limit));
  
  const queryString = params.toString();
  const url = `/question-bank/admin/pending${queryString ? `?${queryString}` : ''}`;
  
  return get<{ total_pending: number; questions: any[] }>(url);
}

/**
 * Update a question
 */
export async function updateQuestion(
  questionId: string,
  data: AdminQuestionUpdateRequest
): Promise<AdminQuestionUpdateResponse> {
  return apiClient<AdminQuestionUpdateResponse>(`/api/admin/questions/${questionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
}

/**
 * Delete a question
 */
export async function deleteQuestion(questionId: string): Promise<AdminQuestionDeleteResponse> {
  return apiClient<AdminQuestionDeleteResponse>(`/api/admin/questions/${questionId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}

/**
 * Perform bulk action on questions
 */
export async function bulkActionQuestions(
  request: AdminBulkActionRequest
): Promise<AdminBulkActionResponse> {
  return post<AdminBulkActionResponse>('/api/admin/questions/bulk-action', request);
}

/**
 * Get analytics for a specific question
 */
export async function getQuestionAnalytics(questionId: string): Promise<AdminQuestionAnalytics> {
  return get<AdminQuestionAnalytics>(`/api/admin/questions/${questionId}/analytics`);
}

/**
 * Get low quality questions
 */
export async function getLowQualityQuestions(limit: number = 50): Promise<AdminLowQualityQuestionsResponse> {
  return get<AdminLowQualityQuestionsResponse>(`/api/admin/questions/low-quality?limit=${limit}`);
}

/**
 * Generate new questions
 */
export async function generateQuestions(request: QuestionGenerateRequest): Promise<QuestionGenerateResponse> {
  return post<QuestionGenerateResponse>('/question-bank/generate', request);
}

/**
 * Approve a question (from pending review)
 */
export async function approveQuestion(questionId: string, reviewerNotes?: string): Promise<any> {
  return post<any>('/question-bank/admin/review', {
    question_id: questionId,
    action: 'approve',
    reviewer_notes: reviewerNotes,
  });
}

/**
 * Reject a question (delete it)
 */
export async function rejectQuestion(questionId: string, reviewerNotes?: string): Promise<any> {
  return post<any>('/question-bank/admin/review', {
    question_id: questionId,
    action: 'reject',
    reviewer_notes: reviewerNotes,
  });
}
