/**
 * User Languages API Service
 * 
 * Manages multi-language learning paths
 */

import { get, post } from './client'

export interface LanguageStats {
  language_id: string
  language_name: string
  avg_mastery: number
  topics_completed: number
  topics_in_progress: number
  total_topics: number
  last_practiced: string | null
  total_sessions: number
  avg_accuracy: number
  is_primary: boolean
  transfer_boost?: {
    from_language: string
    from_language_name: string
    source_mastery: number
    acceleration_factor: number
    estimated_boost: number
  }
}

export interface LanguagePortfolio {
  primary_language: string | null
  languages: LanguageStats[]
  total_languages: number
}

export interface AddLanguageResponse {
  message: string
  language_id: string
  language_name: string
}

/**
 * Get user's complete language learning portfolio
 */
export async function getLanguagePortfolio(): Promise<LanguagePortfolio> {
  return get<LanguagePortfolio>('/api/user/languages')
}

/**
 * Add a new language to user's learning path
 */
export async function addLanguage(languageId: string, difficultyLevel: string = 'beginner'): Promise<AddLanguageResponse> {
  return post<AddLanguageResponse>('/api/user/languages', {
    language_id: languageId,
    difficulty_level: difficultyLevel
  })
}
