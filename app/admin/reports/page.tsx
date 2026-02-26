"use client"

import { useState, useEffect, useCallback } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Flag, CheckCircle, Pencil, Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { 
  getAdminReports, 
  getReportStats, 
  resolveReport, 
  dismissReport, 
  deleteReport 
} from "@/lib/api/reports"
import { 
  getQuestionById, 
  updateQuestion,
  type AdminQuestion 
} from "@/lib/api/questions-admin"
import type { QuestionReport, ReportStats } from "@/lib/types/reports"
import { useToast } from "@/hooks/use-toast"

// TODO: Add role-based access control when backend supports admin roles
export default function QuestionReportsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [reports, setReports] = useState<QuestionReport[]>([])
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestion | null>(null)
  const [currentReportId, setCurrentReportId] = useState<number | null>(null)
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false)

  const fetchReports = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true)
    }
    setLoadError(null)
    try {
      const filters: any = {}
      if (statusFilter !== "all") {
        filters.status = statusFilter
      }
      if (searchQuery) {
        filters.search = searchQuery
      }
      const response = await getAdminReports(filters)
      setReports(response.reports)
      setLastRefresh(new Date())
      console.log('[Admin Reports] Refreshed at', new Date().toLocaleTimeString())
    } catch (error: any) {
      console.error('Failed to fetch reports:', error)
      if (showLoading) {
        setLoadError(error?.response?.data?.detail || 'Failed to load reports')
      }
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }, [statusFilter, searchQuery])

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await getReportStats()
      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }, [])

  // Fetch reports and stats on mount and when filters change
  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Auto-refresh every 5 seconds to show new reports in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      fetchReports(false) // Don't show loading spinner on background refresh
      fetchStats()
    }, 2000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [fetchReports, fetchStats]) // Re-create interval when fetch functions change

  // Reports are already filtered by the backend
  const filteredReports = reports

  const handleEditQuestion = async (questionId: string, reportId: number) => {
    setIsLoadingQuestion(true)
    setCurrentReportId(reportId)
    try {
      const question = await getQuestionById(questionId)
      setEditingQuestion(question)
    } catch (error: any) {
      console.error('Failed to fetch question:', error)
      toast({
        title: "Failed to Load Question",
        description: error?.response?.data?.detail || 'Could not load question details',
        variant: "destructive"
      })
    } finally {
      setIsLoadingQuestion(false)
    }
  }

  const handleSaveQuestion = async () => {
    if (!editingQuestion || !currentReportId) return
    
    try {
      // Update the question
      await updateQuestion(editingQuestion.id, {
        question_data: editingQuestion.question_data,
        difficulty: editingQuestion.difficulty,
        quality_score: editingQuestion.quality_score,
        sub_topic: editingQuestion.sub_topic || undefined
      })
      
      // Automatically resolve the report
      await resolveReport(currentReportId)
      
      toast({
        title: "Question Updated & Report Resolved",
        description: "The question has been successfully updated and the report has been marked as resolved.",
      })
      
      setEditingQuestion(null)
      setCurrentReportId(null)
      await fetchReports()
      await fetchStats()
    } catch (error: any) {
      console.error('Failed to update question:', error)
      toast({
        title: "Failed to Update",
        description: error?.response?.data?.detail || 'Failed to update question or resolve report',
        variant: "destructive"
      })
    }
  }

  const handleResolveReport = async (reportId: number) => {
    try {
      await resolveReport(reportId)
      await fetchReports()
      await fetchStats()
      toast({
        title: "Report Resolved",
        description: "The report has been marked as resolved.",
      })
    } catch (error: any) {
      console.error('Failed to resolve report:', error)
      toast({
        title: "Failed to Resolve",
        description: error?.response?.data?.detail || 'Failed to resolve report',
        variant: "destructive"
      })
    }
  }

  const handleDismissReport = async (reportId: number) => {
    try {
      await dismissReport(reportId)
      await fetchReports()
      await fetchStats()
      toast({
        title: "Report Dismissed",
        description: "The report has been dismissed.",
      })
    } catch (error: any) {
      console.error('Failed to dismiss report:', error)
      toast({
        title: "Failed to Dismiss",
        description: error?.response?.data?.detail || 'Failed to dismiss report',
        variant: "destructive"
      })
    }
  }

  const handleDeleteReport = async (reportId: number) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return
    }
    try {
      await deleteReport(reportId)
      await fetchReports()
      await fetchStats()
      toast({
        title: "Report Deleted",
        description: "The report has been permanently deleted.",
      })
    } catch (error: any) {
      console.error('Failed to delete report:', error)
      toast({
        title: "Failed to Delete",
        description: error?.response?.data?.detail || 'Failed to delete report',
        variant: "destructive"
      })
    }
  }

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      incorrect_answer: "Incorrect Answer",
      missing_correct: "Missing Correct Option",
      confusing_wording: "Confusing Wording",
      explanation_mismatch: "Explanation Mismatch",
      other: "Other",
    }
    return labels[reason] || reason
  }

  const getReasonColor = (reason: string) => {
    const colors: Record<string, string> = {
      incorrect_answer: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
      missing_correct: "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400",
      confusing_wording: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
      explanation_mismatch: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
      other: "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400",
    }
    return colors[reason] || colors.other
  }

  // Group reports by question ID for duplicate detection
  const reportsByQuestion = filteredReports.reduce((acc, report) => {
    if (!acc[report.question_id]) acc[report.question_id] = []
    acc[report.question_id].push(report)
    return acc
  }, {} as Record<string, QuestionReport[]>)

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent">
              Question Reports
            </h1>
            <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Review user-reported question issues • Auto-refreshes every 2s
            <span className="text-xs ml-2 opacity-75">
              (Last: {lastRefresh.toLocaleTimeString()})
            </span>
          </p>
        </div>

      {/* Filters */}
      <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by question ID, user email, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-red-200 dark:border-red-900 bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Pending Reports</p>
                <p className="text-3xl font-black text-red-600 dark:text-red-400">
                  {stats?.pending_count ?? 0}
                </p>
              </div>
              <Flag className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 dark:border-green-900 bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Resolved</p>
                <p className="text-3xl font-black text-green-600 dark:text-green-400">
                  {stats?.resolved_count ?? 0}
                </p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200 dark:border-yellow-900 bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Dismissed</p>
                <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400">
                  {stats?.dismissed_count ?? 0}
                </p>
              </div>
              <Trash2 className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl font-black">Reports ({filteredReports.length})</CardTitle>
          <CardDescription>Review and manage user-submitted question reports</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-slate-600 dark:text-slate-400">Loading reports...</span>
            </div>
          ) : loadError ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 font-semibold">{loadError}</p>
              <Button onClick={() => fetchReports()} className="mt-4">Retry</Button>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reports found</p>
            </div>
          ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => {
              const duplicateCount = reportsByQuestion[report.question_id]?.filter(r => r.status === "pending").length || 0
              const hasDuplicates = duplicateCount > 1

              return (
                <div
                  key={report.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    report.status === "pending"
                      ? "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20"
                      : report.status === "resolved"
                      ? "border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold">
                        Report #{report.id}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-xs font-bold">
                        Q#{report.question_id.slice(0, 8)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getReasonColor(report.report_type)}`}>
                        {getReasonLabel(report.report_type)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        report.status === "pending"
                          ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
                          : report.status === "resolved"
                          ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400"
                          : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400"
                      }`}>
                        {report.status.toUpperCase()}
                      </span>
                      {hasDuplicates && report.status === "pending" && (
                        <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 text-xs font-bold flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {duplicateCount} Similar Reports
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(report.created_at).toLocaleString()}
                    </span>
                  </div>

                  {/* Reporter Info */}
                  <div className="mb-3 p-2 bg-slate-100 dark:bg-slate-900 rounded">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Reported by: <span className="font-semibold text-slate-900 dark:text-white">{report.reporter_email}</span> (User: {report.reporter_user_id.slice(0, 8)})
                    </p>
                    {report.session_id && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Session: {report.session_id.slice(0, 12)}
                      </p>
                    )}
                  </div>

                  {/* Question Preview */}
                  {report.question_preview && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        {report.question_preview.language_id} - {report.question_preview.mapping_id}
                      </p>
                      <pre className="text-sm text-slate-900 dark:text-white font-mono bg-slate-100 dark:bg-slate-900 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                        {report.question_preview.question_text}
                      </pre>
                    </div>
                  )}

                  {/* Report Details */}
                  <div className="mb-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">User's Feedback:</p>
                    <p className="text-sm text-slate-900 dark:text-white">{report.description}</p>
                  </div>

                  {/* Resolution Info */}
                  {(report.status === "resolved" || report.status === "dismissed") && report.resolved_at && (
                    <div className="mb-3 p-2 bg-slate-100 dark:bg-slate-900 rounded">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {report.status === "resolved" ? "Resolved" : "Dismissed"} by{" "}
                        <span className="font-semibold">{report.resolved_by_email || report.resolved_by}</span> on{" "}
                        {new Date(report.resolved_at).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditQuestion(report.question_id, report.id)}
                      disabled={isLoadingQuestion}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      {isLoadingQuestion ? "Loading..." : "Edit Question"}
                    </Button>
                    {report.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleResolveReport(report.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDismissReport(report.id)}
                          className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:hover:bg-yellow-950"
                        >
                          Dismiss
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Report
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Question Dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={(open) => !open && setEditingQuestion(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Edit Question</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Make changes to fix the reported issue. Click save when you're done, then mark the report as resolved.
            </DialogDescription>
          </DialogHeader>
          
          {editingQuestion && (
            <div className="space-y-4 py-4">
              {/* Question Text */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-white">Question Text</label>
                <textarea
                  className="w-full min-h-[100px] p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  value={editingQuestion.question_data.question_text}
                  onChange={(e) => {
                    setEditingQuestion({
                      ...editingQuestion,
                      question_data: {
                        ...editingQuestion.question_data,
                        question_text: e.target.value
                      }
                    })
                  }}
                />
              </div>

              {/* Code Snippet */}
              {editingQuestion.question_data.code_snippet !== undefined && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900 dark:text-white">Code Snippet (optional)</label>
                  <textarea
                    className="w-full min-h-[150px] p-3 border border-slate-300 dark:border-slate-600 rounded-lg font-mono text-sm bg-slate-800 dark:bg-slate-950 text-green-400 dark:text-green-300"
                    value={editingQuestion.question_data.code_snippet || ''}
                    onChange={(e) => {
                      setEditingQuestion({
                        ...editingQuestion,
                        question_data: {
                          ...editingQuestion.question_data,
                          code_snippet: e.target.value || undefined
                        }
                      })
                    }}
                  />
                </div>
              )}

              {/* Options */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-white">Answer Options</label>
                {editingQuestion.question_data.options.map((option: any, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{option.id}.</span>
                      <input
                        type="checkbox"
                        checked={option.is_correct}
                        onChange={(e) => {
                          const newOptions = [...editingQuestion.question_data.options]
                          newOptions[index] = { ...option, is_correct: e.target.checked }
                          setEditingQuestion({
                            ...editingQuestion,
                            question_data: {
                              ...editingQuestion.question_data,
                              options: newOptions
                            }
                          })
                        }}
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-800 dark:checked:bg-blue-600"
                      />
                    </div>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => {
                        const newOptions = [...editingQuestion.question_data.options]
                        newOptions[index] = { ...option, text: e.target.value }
                        setEditingQuestion({
                          ...editingQuestion,
                          question_data: {
                            ...editingQuestion.question_data,
                            options: newOptions
                          }
                        })
                      }}
                      className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-white">Explanation</label>
                <textarea
                  className="w-full min-h-[80px] p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  value={editingQuestion.question_data.explanation || ''}
                  onChange={(e) => {
                    setEditingQuestion({
                      ...editingQuestion,
                      question_data: {
                        ...editingQuestion.question_data,
                        explanation: e.target.value
                      }
                    })
                  }}
                />
              </div>

              {/* Difficulty Slider */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-white">Difficulty Level: {editingQuestion.difficulty?.toFixed(1) || '0.5'}</label>
                <Slider
                  value={[editingQuestion.difficulty || 0.5]}
                  onValueChange={([value]) => {
                    setEditingQuestion({
                      ...editingQuestion,
                      difficulty: value
                    })
                  }}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                  onClick={() => {
                    setEditingQuestion(null)
                    setCurrentReportId(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  onClick={handleSaveQuestion}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </ProtectedRoute>
  )
}
