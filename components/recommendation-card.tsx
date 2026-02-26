/**
 * RecommendationCard Component - Phase 3
 * 
 * Displays structured recommendations with:
 * - Type indicators (PREREQUISITE_REVIEW, DRILL, CONCEPTUAL_REVIEW, etc.)
 * - Priority badges (1-5 scale)
 * - Time estimates
 * - Targeted error types
 * - Prerequisite relationships
 * - Action buttons
 * 
 * Shows all fields from Phase 1 LLM-generated recommendations.
 */

import { 
  Target, 
  Zap, 
  BookOpen, 
  Code, 
  AlertCircle,
  Clock,
  ArrowRight,
  Star
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { EnhancedRecommendation } from "@/lib/api/exam"
import { formatTopicId, formatErrorType, formatLanguageId } from "@/lib/utils/format-topic"

interface RecommendationCardProps {
  recommendation: EnhancedRecommendation
  index: number
}

export function RecommendationCard({ recommendation, index }: RecommendationCardProps) {
  // Phase 3 Fix (Issue 1): Defensive rendering for potentially undefined fields
  // These fields come from LLM-generated JSON which should now preserve all fields (Phase 1 Bug 1 fixed)
  // But we still add fallbacks for robustness
  
  // Type icons and styling
  const getTypeInfo = (type?: string) => {
    switch (type) {
      case 'PREREQUISITE_REVIEW':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          label: 'Prerequisite Review',
          className: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800',
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          borderColor: 'border-orange-200 dark:border-orange-800'
        }
      case 'DRILL':
        return {
          icon: <Zap className="h-4 w-4" />,
          label: 'Practice Drill',
          className: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          borderColor: 'border-blue-200 dark:border-blue-800'
        }
      case 'CONCEPTUAL_REVIEW':
        return {
          icon: <BookOpen className="h-4 w-4" />,
          label: 'Conceptual Review',
          className: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800',
          bgColor: 'bg-purple-50 dark:bg-purple-950/20',
          borderColor: 'border-purple-200 dark:border-purple-800'
        }
      case 'HANDS_ON_PROJECT':
        return {
          icon: <Code className="h-4 w-4" />,
          label: 'Hands-On Project',
          className: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          borderColor: 'border-green-200 dark:border-green-800'
        }
      default:
        return {
          icon: <Target className="h-4 w-4" />,
          label: 'General',
          className: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
          bgColor: 'bg-slate-50 dark:bg-slate-900',
          borderColor: 'border-slate-200 dark:border-slate-700'
        }
    }
  }

  // Priority color coding
  const getPriorityBadge = (priority?: number) => {
    if (!priority) return null
    
    const stars = Math.min(priority, 5)
    const color = priority <= 2 
      ? 'bg-red-600 text-white' 
      : priority <= 3 
      ? 'bg-orange-500 text-white'
      : 'bg-blue-500 text-white'
    
    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Star className="h-3 w-3 fill-current" />
        Priority {stars}
      </Badge>
    )
  }

  const typeInfo = getTypeInfo(recommendation.type)

  // Format time estimate
  const formatTime = (minutes?: number) => {
    if (!minutes) return null
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${typeInfo.borderColor} ${typeInfo.bgColor}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Only show type badge if type is defined */}
          {recommendation.type && (
            <Badge className={`${typeInfo.className} flex items-center gap-1`}>
              {typeInfo.icon}
              {typeInfo.label}
            </Badge>
          )}
          
          {/* Only show priority if defined */}
          {recommendation.priority && getPriorityBadge(recommendation.priority)}
          
          {/* Only show time estimate if defined */}
          {recommendation.estimated_time_minutes && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {formatTime(recommendation.estimated_time_minutes)}
            </Badge>
          )}
        </div>
        
        {/* Index badge */}
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
          {index + 1}
        </div>
      </div>

      {/* Title and Description */}
      <div className="mb-3">
        <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
          {recommendation.title}
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {recommendation.description}
        </p>
      </div>

      {(recommendation.focus_area || recommendation.learning_goal) && (
        <div className="mb-3 p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40">
          {recommendation.focus_area && (
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-1">
              <span className="font-semibold">Focus:</span> {formatTopicId(recommendation.focus_area)}
            </p>
          )}
          {recommendation.learning_goal && (
            <p className="text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Goal:</span> {recommendation.learning_goal}
            </p>
          )}
        </div>
      )}

      {/* Metadata badges */}
      {(recommendation.targets_error || recommendation.prerequisite_addressed || recommendation.language) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {recommendation.targets_error && (
            <Badge variant="secondary" className="text-xs">
              Fixes: {formatErrorType(recommendation.targets_error)}
            </Badge>
          )}
          
          {recommendation.prerequisite_addressed && (
            <Badge variant="secondary" className="text-xs">
              Addresses: {formatTopicId(recommendation.prerequisite_addressed)}
            </Badge>
          )}
          
          {recommendation.language && (
            <Badge variant="outline" className="text-xs">
              {formatLanguageId(recommendation.language)}
            </Badge>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-2">
        {recommendation.resource_url && (
          <Button
            asChild
            size="sm"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            <a href={recommendation.resource_url} target="_blank" rel="noreferrer">
              Open Resource
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
