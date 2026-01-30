"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MessageSquare, CheckCircle, Clock, Mail, User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UserQueriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // TODO: In production, fetch from API - GET /api/admin/queries
  const mockQueries = [
    {
      id: 1,
      userId: 451,
      userEmail: "student@example.com",
      userName: "John Doe",
      category: "technical_issue",
      subject: "Cannot log in to my account",
      message: "I've been trying to log in for the past hour but keep getting an error message. My password is correct. Please help!",
      status: "open",
      priority: "high",
      submittedAt: "2026-01-30T08:30:00Z",
      replies: [],
    },
    {
      id: 2,
      userId: 452,
      userEmail: "alice@example.com",
      userName: "Alice Smith",
      category: "content_question",
      subject: "How does the spaced repetition algorithm work?",
      message: "I'm curious about the decay formula mentioned in the platform. Can you explain how it calculates when I should review topics?",
      status: "open",
      priority: "medium",
      submittedAt: "2026-01-29T15:20:00Z",
      replies: [
        {
          from: "admin@learnrl.com",
          message: "Great question! The decay formula is M(t) = M0 * e^(-0.02*t) where M0 is your initial mastery...",
          timestamp: "2026-01-29T16:00:00Z",
        },
      ],
    },
    {
      id: 3,
      userId: 453,
      userEmail: "bob@example.com",
      userName: "Bob Johnson",
      category: "feature_request",
      subject: "Add support for Rust programming language",
      message: "Would love to see Rust added to the platform! It's becoming very popular and would be great for learning systems programming concepts.",
      status: "resolved",
      priority: "low",
      submittedAt: "2026-01-28T10:15:00Z",
      resolvedAt: "2026-01-29T09:30:00Z",
      replies: [
        {
          from: "admin@learnrl.com",
          message: "Thank you for the suggestion! We'll add this to our roadmap for future language support.",
          timestamp: "2026-01-29T09:30:00Z",
        },
      ],
    },
    {
      id: 4,
      userId: 454,
      userEmail: "carol@example.com",
      userName: "Carol White",
      category: "billing",
      subject: "Refund request for subscription",
      message: "I was charged twice for my subscription this month. Can you please refund the duplicate charge?",
      status: "open",
      priority: "high",
      submittedAt: "2026-01-30T07:45:00Z",
      replies: [],
    },
    {
      id: 5,
      userId: 455,
      userEmail: "dave@example.com",
      userName: "David Brown",
      category: "account",
      subject: "How to change my email address?",
      message: "I need to update my email address associated with my account. Where can I do this in settings?",
      status: "resolved",
      priority: "low",
      submittedAt: "2026-01-27T14:20:00Z",
      resolvedAt: "2026-01-27T15:00:00Z",
      replies: [
        {
          from: "admin@learnrl.com",
          message: "Go to Settings > Account > Update Email. You'll need to verify your new email address.",
          timestamp: "2026-01-27T15:00:00Z",
        },
      ],
    },
  ]

  const filteredQueries = mockQueries.filter(query => {
    const matchesSearch = query.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         query.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         query.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || query.status === statusFilter
    const matchesCategory = categoryFilter === "all" || query.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleReply = (queryId: number) => {
    // TODO: Implement reply modal
    console.log(`Reply to query ${queryId}`)
  }

  const handleResolve = (queryId: number) => {
    // TODO: Call API - PATCH /api/admin/queries/:id/resolve
    console.log(`Resolve query ${queryId}`)
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      technical_issue: "Technical Issue",
      content_question: "Content Question",
      feature_request: "Feature Request",
      billing: "Billing",
      account: "Account",
      other: "Other",
    }
    return labels[category] || category
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technical_issue: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
      content_question: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
      feature_request: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400",
      billing: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400",
      account: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
      other: "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400",
    }
    return colors[category] || colors.other
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: "text-red-600 dark:text-red-400",
      medium: "text-yellow-600 dark:text-yellow-400",
      low: "text-green-600 dark:text-green-400",
    }
    return colors[priority] || colors.medium
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent">
          User Queries
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Manage support tickets and user inquiries
        </p>
      </div>

      {/* Filters */}
      <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search queries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technical_issue">Technical Issue</SelectItem>
                <SelectItem value="content_question">Content Question</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="account">Account</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 border-red-200 dark:border-red-900 bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Open Queries</p>
                <p className="text-3xl font-black text-red-600 dark:text-red-400">
                  {mockQueries.filter(q => q.status === "open").length}
                </p>
              </div>
              <Clock className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 dark:border-green-900 bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Resolved</p>
                <p className="text-3xl font-black text-green-600 dark:text-green-400">
                  {mockQueries.filter(q => q.status === "resolved").length}
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
                <p className="text-sm text-slate-600 dark:text-slate-400">High Priority</p>
                <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400">
                  {mockQueries.filter(q => q.priority === "high" && q.status === "open").length}
                </p>
              </div>
              <MessageSquare className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Queries</p>
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
                  {mockQueries.length}
                </p>
              </div>
              <Mail className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queries List */}
      <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl font-black">Queries ({filteredQueries.length})</CardTitle>
          <CardDescription>Support tickets and user inquiries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredQueries.map((query) => (
              <div
                key={query.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  query.status === "open"
                    ? query.priority === "high"
                      ? "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20"
                      : "border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/20"
                    : "border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold">
                      Ticket #{query.id}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(query.category)}`}>
                      {getCategoryLabel(query.category)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      query.status === "open"
                        ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400"
                        : "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400"
                    }`}>
                      {query.status.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(query.priority)}`}>
                      {query.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {new Date(query.submittedAt).toLocaleString()}
                  </span>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 mb-3 p-2 bg-slate-100 dark:bg-slate-900 rounded">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white font-bold">
                    {query.userName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{query.userName}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <Mail className="h-3 w-3" />
                      {query.userEmail}
                      <User className="h-3 w-3 ml-2" />
                      User #{query.userId}
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                  {query.subject}
                </h3>

                {/* Message */}
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 mb-3">
                  <p className="text-sm text-slate-900 dark:text-white">{query.message}</p>
                </div>

                {/* Replies */}
                {query.replies.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Replies:</p>
                    {query.replies.map((reply, index) => (
                      <div key={index} className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-blue-900 dark:text-blue-400">{reply.from}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {new Date(reply.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm text-slate-900 dark:text-white">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resolution Info */}
                {query.status === "resolved" && query.resolvedAt && (
                  <div className="mb-3 p-2 bg-green-100 dark:bg-green-950 rounded">
                    <p className="text-xs text-green-800 dark:text-green-400">
                      ✓ Resolved on {new Date(query.resolvedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleReply(query.id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                  {query.status === "open" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolve(query.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Resolved
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
