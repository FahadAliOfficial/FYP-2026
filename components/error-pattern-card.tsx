/**
 * ErrorPatternCard Component - Phase 3
 * 
 * Displays enhanced error patterns with:
 * - Trend analysis (new, improving, persistent, recurring)
 * - Historical context (first_seen, last_seen, total_count)
 * - Severity indicators
 * - Category-based styling
 * - Language-specific applicability
 * 
 * Replaces hardcoded ERROR_TYPE_INFO dictionary with backend-driven content.
 */

import { AlertTriangle, TrendingUp, TrendingDown, AlertCircle, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { EnhancedErrorPattern } from "@/lib/api/exam"
import { formatErrorType } from "@/lib/utils/format-topic"

interface ErrorPatternCardProps {
  pattern: EnhancedErrorPattern
}

export function ErrorPatternCard({ pattern }: ErrorPatternCardProps) {
  // Phase 3: Defensive rendering for potentially undefined fields
  // All Phase 2 fields (trend, severity, total_count, first_seen, last_seen, category, applies_to_languages)
  // are optional and checked before rendering
  
  // Trend badge styling and icons
  const getTrendBadge = (trend?: string) => {
    switch (trend) {
      case 'persistent':
        return {
          label: 'Persistent',
          className: 'bg-red-600 text-white border-red-700',
          icon: <AlertCircle className="h-3 w-3" />
        }
      case 'improving':
        return {
          label: 'Improving',
          className: 'bg-green-600 text-white border-green-700',
          icon: <TrendingDown className="h-3 w-3" />
        }
      case 'recurring':
        return {
          label: 'Recurring',
          className: 'bg-orange-600 text-white border-orange-700',
          icon: <AlertTriangle className="h-3 w-3" />
        }
      case 'new':
        return {
          label: 'New',
          className: 'bg-blue-600 text-white border-blue-700',
          icon: <Info className="h-3 w-3" />
        }
      default:
        return null
    }
  }

  // Severity color coding
  const getSeverityColor = (severity?: number) => {
    if (!severity) return 'bg-slate-100 dark:bg-slate-800'
    if (severity >= 0.7) return 'bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-800'
    if (severity >= 0.4) return 'bg-orange-100 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800'
    return 'bg-yellow-100 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-800'
  }

  const trendBadge = getTrendBadge(pattern.trend)
  const severityColor = getSeverityColor(pattern.severity)

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${severityColor}`}>
      {/* Header with error type and count */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-block px-3 py-1 rounded-md text-xs font-bold bg-red-600 text-white">
            {formatErrorType(pattern.error_type)}
          </span>
          
          {trendBadge && (
            <Badge className={`${trendBadge.className} flex items-center gap-1 text-xs`}>
              {trendBadge.icon}
              {trendBadge.label}
            </Badge>
          )}
          
          {pattern.category && (
            <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-600">
              {pattern.category.replace('_', ' ')}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-red-700 dark:text-red-300">
            {pattern.count}x
          </span>
          
          {pattern.total_count && pattern.total_count > pattern.count && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({pattern.total_count} total)
            </span>
          )}
        </div>
      </div>

      {/* Historical context */}
      {(pattern.first_seen || pattern.last_seen) && (
        <div className="flex items-center gap-3 mb-3 text-xs text-slate-600 dark:text-slate-400">
          {pattern.first_seen && (
            <span>First seen: {formatDate(pattern.first_seen)}</span>
          )}
          {pattern.last_seen && pattern.first_seen !== pattern.last_seen && (
            <span>• Last seen: {formatDate(pattern.last_seen)}</span>
          )}
        </div>
      )}

      {/* Severity indicator */}
      {pattern.severity !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Severity
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {Math.round(pattern.severity * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                pattern.severity >= 0.7
                  ? 'bg-red-600'
                  : pattern.severity >= 0.4
                  ? 'bg-orange-500'
                  : 'bg-yellow-500'
              }`}
              style={{ width: `${pattern.severity * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Language applicability */}
      {pattern.applies_to_languages && pattern.applies_to_languages.length > 0 && (
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          <span className="font-semibold">Applies to:</span>{' '}
          {pattern.applies_to_languages.map(lang => lang.replace('_', ' ')).join(', ')}
        </div>
      )}

      {/* Trend explanation */}
      {pattern.trend && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {pattern.trend === 'persistent' && (
              <span className="font-semibold text-red-700 dark:text-red-400">
                ⚠️ This error appears frequently ({pattern.total_count || pattern.count}+ times). 
                Focus on addressing this pattern to improve performance.
              </span>
            )}
            {pattern.trend === 'improving' && (
              <span className="font-semibold text-green-700 dark:text-green-400">
                ✅ You're making progress on this error! Keep practicing to eliminate it completely.
              </span>
            )}
            {pattern.trend === 'recurring' && (
              <span className="font-semibold text-orange-700 dark:text-orange-400">
                🔄 This error has reappeared. Review the concept again to solidify your understanding.
              </span>
            )}
            {pattern.trend === 'new' && (
              <span className="font-semibold text-blue-700 dark:text-blue-400">
                ℹ️ This is a new error pattern. Don't worry - everyone makes mistakes when learning!
              </span>
            )}
          </p>
        </div>
      )}

      {(pattern.why_wrong || pattern.correct_approach || pattern.practice_suggestion) && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
          {pattern.why_wrong && (
            <p className="text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Issue:</span> {pattern.why_wrong}
            </p>
          )}
          {pattern.correct_approach && (
            <p className="text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Fix:</span> {pattern.correct_approach}
            </p>
          )}
          {pattern.practice_suggestion && (
            <p className="text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Practice:</span> {pattern.practice_suggestion}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
