/**
 * Exam API Service
 *
 * Client for starting sessions, selecting questions, submitting exams, and
 * fetching results.
 */

import { get, post, del } from './client'

export interface ExamStartRequest {
  user_id: string
  language_id: string
  major_topic_id: string
  session_type: 'diagnostic' | 'practice' | 'exam' | 'review'
  rl_action_id?: number
  rl_recommendation_id?: string
}

export interface ExamStartResponse {
  session_id: string
  started_at: string
}

export interface QuestionOption {
  id: string
  text: string
  is_correct: boolean
  error_type?: string | null
  explanation?: string
}

export interface QuestionData {
  question_text: string
  code_snippet?: string
  options: QuestionOption[]
  explanation?: string
  primary_error_pattern?: string
  targeted_errors?: string[]
  question_type?: string
  quality_score?: number
}

export interface SelectedQuestion {
  id: string
  question_data: QuestionData
  difficulty: number
  quality_score: number
  is_verified: boolean
  mapping_id?: string
  language_id?: string
  sub_topic?: string | null
}

export interface SelectQuestionsRequest {
  user_id: string
  session_id: string
  language_id: string
  mapping_id: string
  target_difficulty: number
  count: number
  difficulty_tolerance?: number
  mode: 'practice' | 'exam' | 'review'
  seen_ratio?: number
}

export interface SelectQuestionsResponse {
  questions: SelectedQuestion[]
  total_selected: number
  total_requested: number
  more_questions_loading: boolean
  warehouse_status: Record<string, any>
}

export interface QuestionResultPayload {
  q_id: string
  sub_topic: string
  difficulty: number
  is_correct: boolean
  selected_choice: string
  correct_choice: string
  time_spent: number
  expected_time: number
  error_type?: string | null
  question_text?: string
  code_snippet?: string | null
  options?: QuestionOption[]
  explanation?: string | null
}

export interface ExamSubmissionPayload {
  user_id: string
  session_id: string
  language_id: string
  major_topic_id: string
  session_type: 'diagnostic' | 'practice' | 'exam' | 'review'
  results: QuestionResultPayload[]
  total_time_seconds: number
}

// Phase 2 Enhanced Schemas
export interface EnhancedErrorPattern {
  error_type: string
  count: number
  total_count?: number
  trend?: 'new' | 'improving' | 'persistent' | 'recurring'
  severity?: number
  category?: string
  first_seen?: string
  last_seen?: string
  applies_to_languages?: string[] | null
  why_wrong?: string
  correct_approach?: string
  language_tip?: string
  practice_suggestion?: string
}

export interface PrerequisiteGap {
  prereq_id: string
  name: string
  current_mastery: number
  required_mastery: number
  gap_size: number
  weight: number
  impact: 'high' | 'medium' | 'low'
  recommendation: string
}

export interface EnhancedRecommendation {
  type?: string
  priority?: number
  title: string
  description: string
  estimated_time_minutes?: number
  targets_error?: string | null
  prerequisite_addressed?: string | null
  language?: string
  action?: string
  focus_area?: string
  learning_goal?: string
  resource_url?: string
}

export interface ExamSubmissionResponse {
  success: boolean
  session_id: string
  accuracy: number
  fluency_ratio: number
  new_mastery_score: number
  synergies_applied: string[]
  soft_gate_violations: string[]
  recommendations: string[]
  // Phase 2 enhancements (optional)
  error_patterns?: EnhancedErrorPattern[]
  prerequisite_gaps?: PrerequisiteGap[]
  overall_readiness?: number
}

export interface ExamResultsResponse {
  session_id: string
  session_type: 'diagnostic' | 'practice' | 'exam' | 'review'
  language_id: string
  major_topic_id: string
  overall_score: number
  accuracy: number
  time_taken_seconds: number
  questions: QuestionResultPayload[]
  strong_topics: { name: string; accuracy: number }[]
  error_patterns: EnhancedErrorPattern[]  // Updated to EnhancedErrorPattern
  recommendations: EnhancedRecommendation[]  // Updated to EnhancedRecommendation
  analysis_status: string
  analysis_bullets: string[] | null
  recommendations_source?: 'llm' | 'fallback' | 'failed' | 'pending' | 'none' | 'unknown'
  error_patterns_source?: 'llm' | 'fallback' | 'failed' | 'pending' | 'none' | 'unknown'
  // Phase 2 enhancements (optional)
  prerequisite_gaps?: PrerequisiteGap[]
  overall_readiness?: number
}

export async function startExamSession(request: ExamStartRequest): Promise<ExamStartResponse> {
  return post<ExamStartResponse>('/api/exam/start', request)
}

export async function selectQuestions(request: SelectQuestionsRequest): Promise<SelectQuestionsResponse> {
  return post<SelectQuestionsResponse>('/question-bank/select', request)
}

export async function pollNewQuestions(sessionId: string): Promise<SelectQuestionsResponse> {
  return get<SelectQuestionsResponse>(`/question-bank/poll/${sessionId}`)
}

export async function closeQuestionSession(sessionId: string): Promise<void> {
  // Use del() so it goes through the proxy and sends the in-memory access token
  await del(`/question-bank/session/${sessionId}`).catch(() => {/* best-effort cleanup */})
}

export async function submitExam(request: ExamSubmissionPayload): Promise<ExamSubmissionResponse> {
  return post<ExamSubmissionResponse>('/api/exam/submit', request)
}

export async function getExamResults(sessionId: string): Promise<ExamResultsResponse> {
  return get<ExamResultsResponse>(`/api/exam/results/${sessionId}`)
}
