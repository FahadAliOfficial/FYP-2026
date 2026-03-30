/**
 * Dashboard API Service
 * 
 * Client for dashboard-related endpoints including mastery data,
 * RL recommendations, transfer boosts, synergy bonuses, and session history.
 */

import { get } from './client'

// ==================== Type Definitions ====================

export interface MasteryData {
  mapping_id: string
  name: string
  mastery: number
  decayed_mastery: number
  confidence: number
  fluency: number
  last_practiced: string | null
  days_since_practice: number
}

export interface DecayAlert {
  concept_id: string
  concept_name: string
  current_mastery: number
  original_mastery: number
  days_passed: number
}

export interface RecommendedTopic {
  concept_id: string
  concept_name: string
  sub_topic: string
  target_difficulty: number
  estimated_time_minutes: number
  reason: string
  prerequisite_met: boolean
}

export interface RecentSession {
  id: string
  timestamp: string
  concept_id: string
  concept_name: string
  sub_topic: string | null
  score: number
  difficulty: number
  mastery_gain: number
  questions_answered: number
}

export interface DashboardSummary {
  mastery_data: MasteryData[]
  decay_alerts: DecayAlert[]
  recommendation: RecommendedTopic | null
  recent_sessions: RecentSession[]
}

export interface TransferBoost {
  source_language: string
  source_concept: string
  target_language: string
  target_concept: string
  source_mastery: number
  boost_amount: number
  transfer_coefficient: number
  logic_boost: number
  syntax_friction: number
}

export interface SynergyBonus {
  from_concept: string
  to_concept: string
  bonus_amount: number
  reinforcement_weight: number
  bidirectional: boolean
  session_id: string | null
  applied_at: string | null
}

// ==================== API Functions ====================

/**
 * Get comprehensive dashboard summary data
 * Includes mastery, decay alerts, RL recommendation, and recent sessions
 */
export async function getDashboardSummary(language_id: string): Promise<DashboardSummary> {
  return get<DashboardSummary>(`/api/dashboard/summary?language_id=${language_id}`)
}

/**
 * Get user mastery data for a specific language
 * Simplified endpoint for mastery heatmap
 */
export async function getUserMastery(language_id: string): Promise<MasteryData[]> {
  return get<MasteryData[]>(`/api/user/mastery/${language_id}`)
}

/**
 * Get active cross-language transfer boosts
 * Shows how mastery in other languages accelerates learning in target language
 */
export async function getActiveTransferBoosts(language_id: string): Promise<TransferBoost[]> {
  return get<TransferBoost[]>(`/api/transfer/active-boosts?language_id=${language_id}`)
}

/**
 * Get recent synergy bonuses
 * Shows how mastering one topic reinforced related topics
 */
export async function getRecentSynergyBonuses(
  language_id: string,
  days: number = 7
): Promise<SynergyBonus[]> {
  return get<SynergyBonus[]>(`/api/synergy/recent-bonuses?language_id=${language_id}&days=${days}`)
}
