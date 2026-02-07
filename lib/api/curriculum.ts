/**
 * Curriculum API Service
 * 
 * Loads curriculum data for topic/subtopic dropdowns in admin interfaces.
 */

export interface CurriculumTopic {
  major_topic_id: string;
  mapping_id: string;
  name: string;
  global_difficulty: number;
  prerequisites: string[];
  sub_topics: string[];
}

export interface LanguageCurriculum {
  language_id: string;
  name: string;
  roadmap: CurriculumTopic[];
}

let cachedCurriculum: LanguageCurriculum[] | null = null

/**
 * Fetch curriculum data from backend
 */
export async function getCurriculum(): Promise<LanguageCurriculum[]> {
  if (cachedCurriculum) {
    return cachedCurriculum
  }

  try {
    const response = await fetch('http://localhost:8000/curriculum/all', {
      credentials: 'include',
    })
    
    if (!response.ok) {
      throw new Error('Failed to load curriculum')
    }
    
    const data = await response.json()
    cachedCurriculum = data
    return data
  } catch (error) {
    console.error('Failed to load curriculum:', error)
    return []
  }
}

/**
 * Get topics for a specific language
 */
export function getTopicsForLanguage(curriculum: LanguageCurriculum[], languageId: string): CurriculumTopic[] {
  const lang = curriculum.find(l => l.language_id === languageId)
  return lang?.roadmap || []
}

/**
 * Get a specific topic by mapping_id
 */
export function getTopicByMappingId(curriculum: LanguageCurriculum[], languageId: string, mappingId: string): CurriculumTopic | undefined {
  const topics = getTopicsForLanguage(curriculum, languageId)
  return topics.find(t => t.mapping_id === mappingId)
}

/**
 * Get display name for a language
 */
export function getLanguageName(curriculum: LanguageCurriculum[], languageId: string): string {
  const lang = curriculum.find(l => l.language_id === languageId)
  return lang?.name || languageId
}
