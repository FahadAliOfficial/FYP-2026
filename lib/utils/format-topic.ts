/**
 * Utility to convert internal topic/mapping IDs to human-readable names
 * 
 * Transforms backend identifiers like:
 * - UNIV_SYN_LOGIC → Syntax & Logic
 * - PY_VAR_01 → Python Variables
 * - JS_FUNC_01 → JavaScript Functions
 */

export function formatTopicId(topicId: string): string {
  if (!topicId) return 'Unknown Topic'

  // Handle universal topics (UNIV_*)
  if (topicId.startsWith('UNIV_')) {
    const topic = topicId.replace('UNIV_', '')
    return formatTopicName(topic)
  }

  // Handle language-specific topics (PY_*, JS_*, etc.)
  const parts = topicId.split('_')
  if (parts.length < 2) return topicId

  const langCode = parts[0]
  const topicPart = parts.slice(1).join('_').replace(/\d+$/, '') // Remove trailing numbers

  const langName = getLanguageName(langCode)
  const topicName = formatTopicName(topicPart)

  return `${langName} ${topicName}`
}

function getLanguageName(code: string): string {
  const langMap: Record<string, string> = {
    'PY': 'Python',
    'JS': 'JavaScript',
    'JV': 'Java',
    'CPP': 'C++',
    'GO': 'Go',
    'TS': 'TypeScript'
  }
  return langMap[code] || code
}

function formatTopicName(topic: string): string {
  // Remove trailing numbers and underscores
  const cleaned = topic.replace(/_\d+$/, '')

  const topicMap: Record<string, string> = {
    'SYN_LOGIC': 'Syntax & Logic',
    'SYN_PREC': 'Syntax & Precedence',
    'VAR': 'Variables',
    'COND': 'Conditionals',
    'LOOP': 'Loops',
    'FUNC': 'Functions',
    'COLL': 'Collections',
    'OOP': 'Object-Oriented Programming',
    'ERR': 'Error Handling',
    'ASYNC': 'Asynchronous Programming',
    'FP': 'Functional Programming',
    'ADV': 'Advanced Topics',
    'DS': 'Data Structures',
    'ALGO': 'Algorithms',
    'MEM': 'Memory Management',
    'CONCUR': 'Concurrency',
    'IO': 'Input/Output',
    'NET': 'Networking',
    'DB': 'Database Operations',
    'TEST': 'Testing',
    'DEBUG': 'Debugging',
    'OPT': 'Optimization',
    'SEC': 'Security',
    'DEPLOY': 'Deployment',
    'TOOLS': 'Development Tools'
  }

  return topicMap[cleaned] || cleaned.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
}

/**
 * Format error type to human-readable text
 */
export function formatErrorType(errorType: string): string {
  if (!errorType) return 'Unknown Error'

  return errorType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Format language ID to display name
 */
export function formatLanguageId(langId: string): string {
  const langMap: Record<string, string> = {
    'python_3': 'Python',
    'javascript_es6': 'JavaScript',
    'java_17': 'Java',
    'cpp_20': 'C++',
    'go_1_21': 'Go',
    'typescript_5': 'TypeScript'
  }
  return langMap[langId] || langId
}
