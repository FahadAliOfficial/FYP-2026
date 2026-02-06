"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Flag, CheckCircle, Eye, Trash2, AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// TODO: Add role-based access control when backend supports admin roles
export default function QuestionReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // TODO: In production, fetch from API - GET /api/admin/reports
  const mockReports = [
    {
      id: 1,
      questionId: 8923,
      userId: 451,
      userEmail: "student@example.com",
      language: "Python",
      concept: "Loops",
      question: "What will be the output of the following code?\n\nfor i in range(3):\n    print(i)",
      reportReason: "incorrect_answer",
      reportDetails: "The answer should be '0\\n1\\n2' not '0 1 2' because print adds newlines",
      status: "pending",
      submittedAt: "2026-01-29T14:30:00Z",
    },
    {
      id: 2,
      questionId: 8925,
      userId: 452,
      userEmail: "alice@example.com",
      language: "Python",
      concept: "Variables",
      question: "What is the scope of variable 'x' in this code?\n\ndef func():\n    x = 5\n\nprint(x)",
      reportReason: "confusing_wording",
      reportDetails: "The question doesn't clarify whether x is defined globally before the function",
      status: "pending",
      submittedAt: "2026-01-28T10:15:00Z",
    },
    {
      id: 3,
      questionId: 7834,
      userId: 453,
      userEmail: "bob@example.com",
      language: "JavaScript",
      concept: "Conditionals",
      question: "What does the following code output?\n\nif (0) {\n  console.log('A');\n} else {\n  console.log('B');\n}",
      reportReason: "typo",
      reportDetails: "There's a typo in option C",
      status: "resolved",
      submittedAt: "2026-01-25T16:45:00Z",
      resolvedAt: "2026-01-26T09:00:00Z",
      resolvedBy: "admin@learnrl.com",
    },
    {
      id: 4,
      questionId: 8925,
      userId: 454,
      userEmail: "carol@example.com",
      language: "Python",
      concept: "Variables",
      question: "What is the scope of variable 'x' in this code?\n\ndef func():\n    x = 5\n\nprint(x)",
      reportReason: "incorrect_answer",
      reportDetails: "Same issue - the question is ambiguous about global scope",
      status: "pending",
      submittedAt: "2026-01-27T11:20:00Z",
    },
    {
      id: 5,
      questionId: 9012,
      userId: 455,
      userEmail: "dave@example.com",
      language: "Java",
      concept: "Functions",
      question: "What will this method return?\n\npublic void test() {\n    return 5;\n}",
      reportReason: "incorrect_answer",
      reportDetails: "This code won't compile - void methods can't return values",
      status: "dismissed",
      submittedAt: "2026-01-24T13:30:00Z",
      resolvedAt: "2026-01-24T14:00:00Z",
      resolvedBy: "admin@learnrl.com",
    },
  ]

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.questionId.toString().includes(searchQuery) ||
                         report.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.reportDetails.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || report.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleViewQuestion = (questionId: number) => {
    // TODO: Navigate to question details or open in modal
    console.log(`View question ${questionId}`)
  }

  const handleResolveReport = (reportId: number) => {
    // TODO: Call API - PATCH /api/admin/reports/:id/resolve
    console.log(`Resolve report ${reportId}`)
  }

  const handleDismissReport = (reportId: number) => {
    // TODO: Call API - PATCH /api/admin/reports/:id/dismiss
    console.log(`Dismiss report ${reportId}`)
  }

  const handleDeleteQuestion = (questionId: number) => {
    // TODO: Call API - DELETE /api/admin/questions/:id
    console.log(`Delete question ${questionId}`)
  }

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      incorrect_answer: "Incorrect Answer",
      confusing_wording: "Confusing Wording",
      typo: "Typo/Grammar",
      outdated: "Outdated Content",
      other: "Other",
    }
    return labels[reason] || reason
  }

  const getReasonColor = (reason: string) => {
    const colors: Record<string, string> = {
      incorrect_answer: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
      confusing_wording: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
      typo: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
      outdated: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400",
      other: "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400",
    }
    return colors[reason] || colors.other
  }

  // Group reports by question ID for duplicate detection
  const reportsByQuestion = filteredReports.reduce((acc, report) => {
    if (!acc[report.questionId]) acc[report.questionId] = []
    acc[report.questionId].push(report)
    return acc
  }, {} as Record<number, typeof mockReports>)

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent">
            Question Reports
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Review user-reported question issues
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
                  {mockReports.filter(r => r.status === "pending").length}
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
                  {mockReports.filter(r => r.status === "resolved").length}
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
                  {mockReports.filter(r => r.status === "dismissed").length}
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
          <div className="space-y-4">
            {filteredReports.map((report) => {
              const duplicateCount = reportsByQuestion[report.questionId]?.filter(r => r.status === "pending").length || 0
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
                        Q#{report.questionId}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getReasonColor(report.reportReason)}`}>
                        {getReasonLabel(report.reportReason)}
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
                      {new Date(report.submittedAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Reporter Info */}
                  <div className="mb-3 p-2 bg-slate-100 dark:bg-slate-900 rounded">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Reported by: <span className="font-semibold text-slate-900 dark:text-white">{report.userEmail}</span> (User #{report.userId})
                    </p>
                  </div>

                  {/* Question Preview */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {report.language} - {report.concept}
                    </p>
                    <pre className="text-sm text-slate-900 dark:text-white font-mono bg-slate-100 dark:bg-slate-900 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                      {report.question}
                    </pre>
                  </div>

                  {/* Report Details */}
                  <div className="mb-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">User's Feedback:</p>
                    <p className="text-sm text-slate-900 dark:text-white">{report.reportDetails}</p>
                  </div>

                  {/* Resolution Info */}
                  {(report.status === "resolved" || report.status === "dismissed") && report.resolvedAt && (
                    <div className="mb-3 p-2 bg-slate-100 dark:bg-slate-900 rounded">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {report.status === "resolved" ? "Resolved" : "Dismissed"} by{" "}
                        <span className="font-semibold">{report.resolvedBy}</span> on{" "}
                        {new Date(report.resolvedAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewQuestion(report.questionId)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Question
                    </Button>
                    {report.status === "pending" && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleResolveReport(report.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDismissReport(report.id)}
                        >
                          Dismiss
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteQuestion(report.questionId)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Question
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  )
}
