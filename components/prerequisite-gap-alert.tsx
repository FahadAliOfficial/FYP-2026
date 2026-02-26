/**
 * PrerequisiteGapAlert Component - Phase 3
 * 
 * Displays prerequisite gap analysis with:
 * - Overall readiness score
 * - Individual gap cards with current vs required mastery
 * - Impact categorization (high, medium, low)
 * - Gap progress bars
 * - Actionable recommendations per gap
 * 
 * Helps students understand prerequisite weaknesses before attempting advanced topics.
 */

import { AlertTriangle, TrendingDown, ArrowRight, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { PrerequisiteGap } from "@/lib/api/exam"
import { formatTopicId } from "@/lib/utils/format-topic"

interface PrerequisiteGapAlertProps {
  gaps: PrerequisiteGap[]
  overallReadiness?: number
}

export function PrerequisiteGapAlert({ gaps, overallReadiness }: PrerequisiteGapAlertProps) {
  // Phase 3: Early return if no gaps (defensive rendering)
  if (!gaps || gaps.length === 0) {
    return null
  }

  // Impact styling
  const getImpactBadge = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return {
          label: 'High Impact',
          className: 'bg-red-600 text-white border-red-700'
        }
      case 'medium':
        return {
          label: 'Medium Impact',
          className: 'bg-orange-500 text-white border-orange-600'
        }
      case 'low':
        return {
          label: 'Low Impact',
          className: 'bg-yellow-500 text-white border-yellow-600'
        }
    }
  }

  // Readiness color
  const getReadinessColor = (readiness: number) => {
    if (readiness >= 0.8) return 'text-green-600 dark:text-green-400'
    if (readiness >= 0.65) return 'text-blue-600 dark:text-blue-400'
    if (readiness >= 0.45) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getReadinessLabel = (readiness: number) => {
    if (readiness >= 0.8) return 'Strong Prerequisites ✅'
    if (readiness >= 0.65) return 'Ready to Learn ✓'
    if (readiness >= 0.45) return 'Some Gaps ⚠️'
    return 'Critical Gaps ❌'
  }

  return (
    <Card className="border-orange-200 dark:border-orange-800 bg-white dark:bg-slate-800 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
            <TrendingDown className="h-5 w-5 text-white" />
          </div>
          Prerequisite Gaps Detected
        </CardTitle>
        <CardDescription className="dark:text-slate-400">
          Strengthen these foundations before advancing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Overall Readiness */}
        {overallReadiness !== undefined && (
          <div className="mb-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Overall Readiness
              </span>
              <span className={`text-lg font-bold ${getReadinessColor(overallReadiness)}`}>
                {Math.round(overallReadiness * 100)}%
              </span>
            </div>
            <Progress 
              value={overallReadiness * 100} 
              className="h-2 mb-2"
            />
            <p className={`text-xs font-semibold ${getReadinessColor(overallReadiness)}`}>
              {getReadinessLabel(overallReadiness)}
            </p>
          </div>
        )}

        {/* Individual Gap Cards */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {gaps.map((gap) => {
            const impactBadge = getImpactBadge(gap.impact)
            const gapPercent = Math.round(gap.gap_size * 100)
            const currentPercent = Math.round(gap.current_mastery * 100)
            const requiredPercent = Math.round(gap.required_mastery * 100)

            return (
              <div
                key={gap.prereq_id}
                className="p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                      {gap.name || 'Unknown Prerequisite'}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {gap.prereq_id ? formatTopicId(gap.prereq_id) : 'N/A'}
                    </p>
                  </div>
                  <Badge className={impactBadge.className}>
                    {impactBadge.label}
                  </Badge>
                </div>

                {/* Mastery Comparison */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Current</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {currentPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full bg-red-500"
                      style={{ width: `${currentPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Required</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {requiredPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${requiredPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                      Gap: {gapPercent}% • Weight: {Math.round(gap.weight * 100)}%
                    </span>
                  </div>
                </div>

                {/* Recommendation */}
                {gap.recommendation && (
                  <div className="bg-white dark:bg-orange-950/50 p-3 rounded border border-orange-200 dark:border-orange-800">
                    <p className="text-xs font-semibold text-orange-800 dark:text-orange-300 mb-1 flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />
                      Recommended Action:
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-400">
                      {gap.recommendation}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Summary Message */}
        {gaps.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>💡 Tip:</strong> Addressing {gaps.filter(g => g.impact === 'high').length > 0 ? 'high-impact' : 'these'} gaps first will significantly improve your learning outcomes for this topic.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
