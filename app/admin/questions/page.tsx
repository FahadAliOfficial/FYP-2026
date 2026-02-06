"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Edit, Trash2, CheckCircle, XCircle, Filter, Code } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// TODO: Add role-based access control when backend supports admin roles
export default function QuestionBankPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [languageFilter, setLanguageFilter] = useState("all")
  const [conceptFilter, setConceptFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // TODO: In production, fetch from API - GET /api/admin/questions
  const mockQuestions = [
    {
      id: 8923,
      language: "Python",
      concept: "UNIV_LOOP",
      conceptName: "Loops",
      subTopic: "for_loop_basics",
      difficulty: 0.5,
      question: "What will be the output of the following code?\n\nfor i in range(3):\n    print(i)",
      options: ["0 1 2", "1 2 3", "0 1 2 3", "Error"],
      correctAnswer: 0,
      isVerified: true,
      createdAt: "2026-01-15",
      reportCount: 2,
    },
    {
      id: 8924,
      language: "JavaScript",
      concept: "UNIV_COND",
      conceptName: "Conditionals",
      subTopic: "if_else_basics",
      difficulty: 0.4,
      question: "What does the following code output?\n\nlet x = 10;\nif (x > 5) {\n  console.log('A');\n} else {\n  console.log('B');\n}",
      options: ["A", "B", "AB", "Error"],
      correctAnswer: 0,
      isVerified: true,
      createdAt: "2026-01-20",
      reportCount: 0,
    },
    {
      id: 8925,
      language: "Python",
      concept: "UNIV_VAR",
      conceptName: "Variables",
      subTopic: "variable_scope",
      difficulty: 0.65,
      question: "What is the scope of variable 'x' in this code?\n\ndef func():\n    x = 5\n\nprint(x)",
      options: ["Global", "Local to func", "Error", "Both global and local"],
      correctAnswer: 2,
      isVerified: false,
      createdAt: "2026-01-28",
      reportCount: 5,
    },
    {
      id: 8926,
      language: "Java",
      concept: "UNIV_FUNC",
      conceptName: "Functions",
      subTopic: "function_parameters",
      difficulty: 0.55,
      question: "What will this method return?\n\npublic static int add(int a, int b) {\n    return a + b;\n}\n\nadd(3, 4);",
      options: ["7", "34", "Error", "void"],
      correctAnswer: 0,
      isVerified: true,
      createdAt: "2026-01-25",
      reportCount: 1,
    },
  ]

  const filteredQuestions = mockQuestions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.id.toString().includes(searchQuery)
    const matchesLanguage = languageFilter === "all" || q.language === languageFilter
    const matchesConcept = conceptFilter === "all" || q.concept === conceptFilter
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "verified" && q.isVerified) ||
                         (statusFilter === "unverified" && !q.isVerified) ||
                         (statusFilter === "reported" && q.reportCount > 0)
    return matchesSearch && matchesLanguage && matchesConcept && matchesStatus
  })

  const handleEditQuestion = (questionId: number) => {
    // TODO: Implement edit modal or navigate to edit page
    console.log(`Edit question ${questionId}`)
  }

  const handleDeleteQuestion = (questionId: number) => {
    // TODO: Call API - DELETE /api/admin/questions/:id
    console.log(`Delete question ${questionId}`)
  }

  const handleToggleVerification = (questionId: number, currentStatus: boolean) => {
    // TODO: Call API - PATCH /api/admin/questions/:id/verify
    console.log(`Toggle verification for question ${questionId}, current: ${currentStatus}`)
  }

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty < 0.4) return { label: "Easy", color: "text-green-600 dark:text-green-400" }
    if (difficulty < 0.7) return { label: "Medium", color: "text-yellow-600 dark:text-yellow-400" }
    return { label: "Hard", color: "text-red-600 dark:text-red-400" }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent">
          Question Bank
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Browse and manage all platform questions
        </p>
      </div>

      {/* Filters */}
      <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by question ID or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger>
                <Code className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="JavaScript">JavaScript</SelectItem>
                <SelectItem value="Java">Java</SelectItem>
                <SelectItem value="C++">C++</SelectItem>
                <SelectItem value="TypeScript">TypeScript</SelectItem>
                <SelectItem value="Go">Go</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Questions</p>
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
              {mockQuestions.length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 dark:border-green-900 bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Verified</p>
            <p className="text-3xl font-black text-green-600 dark:text-green-400">
              {mockQuestions.filter(q => q.isVerified).length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200 dark:border-yellow-900 bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Pending Review</p>
            <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400">
              {mockQuestions.filter(q => !q.isVerified).length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 dark:border-red-900 bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Reported</p>
            <p className="text-3xl font-black text-red-600 dark:text-red-400">
              {mockQuestions.filter(q => q.reportCount > 0).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl font-black">Questions ({filteredQuestions.length})</CardTitle>
          <CardDescription>Manage question content and verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredQuestions.map((question) => {
              const difficultyInfo = getDifficultyLabel(question.difficulty)

              return (
                <div
                  key={question.id}
                  className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all bg-slate-50 dark:bg-slate-800/50"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold">
                        ID: {question.id}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-xs font-bold">
                        {question.language}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 text-xs font-bold">
                        {question.conceptName}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${difficultyInfo.color}`}>
                        {difficultyInfo.label}
                      </span>
                      {question.isVerified ? (
                        <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-xs font-bold flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 text-xs font-bold flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Unverified
                        </span>
                      )}
                      {question.reportCount > 0 && (
                        <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 text-xs font-bold">
                          {question.reportCount} Reports
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      Created {new Date(question.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Question Content */}
                  <div className="mb-3">
                    <pre className="text-sm text-slate-900 dark:text-white font-mono bg-slate-100 dark:bg-slate-900 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                      {question.question}
                    </pre>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    {question.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded text-sm ${
                          index === question.correctAnswer
                            ? "bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-400 font-semibold border-2 border-green-500"
                            : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Sub-topic: <span className="font-semibold">{question.subTopic}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditQuestion(question.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant={question.isVerified ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleToggleVerification(question.id, question.isVerified)}
                      >
                        {question.isVerified ? (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Unverify
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
