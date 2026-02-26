"use client"

import { useRouter, useParams } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { ErrorPatternCard } from "@/components/error-pattern-card"
import { RecommendationCard } from "@/components/recommendation-card"
import { PrerequisiteGapAlert } from "@/components/prerequisite-gap-alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Trophy,
    Target,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Home,
    RotateCcw,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    Flag,
} from "lucide-react"
import { useState, useEffect } from "react"
import { getExamResults, type ExamResultsResponse, type QuestionResultPayload, type QuestionOption } from "@/lib/api/exam"
import { formatTopicId, formatErrorType } from "@/lib/utils/format-topic"
import { ReportQuestionModal } from "@/components/report-question-modal"
import { getUserReports } from "@/lib/api/reports"

function ResultsPage() {
    const router = useRouter()
    const params = useParams()
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
    const [results, setResults] = useState<ExamResultsResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [sessionConfig, setSessionConfig] = useState<{ mapping_id?: string } | null>(null)
    const [reportModalOpen, setReportModalOpen] = useState(false)
    const [reportingQuestionId, setReportingQuestionId] = useState<string | null>(null)
    const [reportedQuestions, setReportedQuestions] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedSession = localStorage.getItem('currentSession')
            if (storedSession) {
                setSessionConfig(JSON.parse(storedSession))
            }
        }

        const sessionId = Array.isArray(params.id) ? params.id[0] : params.id
        if (!sessionId) {
            setLoadError('Missing session id.')
            setIsLoading(false)
            return
        }

        let active = true

        const fetchResults = async () => {
            setIsLoading(true)
            setLoadError(null)
            try {
                const data = await getExamResults(sessionId)
                if (active) {
                    setResults(data)
                }
                
                // Fetch user's reports for this session
                try {
                    const reports = await getUserReports(sessionId)
                    const reportedIds = new Set(reports.map(r => r.question_id))
                    if (active) {
                        setReportedQuestions(reportedIds)
                    }
                } catch (error) {
                    console.error('Failed to load reports:', error)
                }
            } catch (error) {
                console.error('Failed to load results:', error)
                if (active) {
                    setLoadError('Failed to load results. Please try again.')
                }
            } finally {
                if (active) {
                    setIsLoading(false)
                }
            }
        }

        fetchResults()

        return () => {
            active = false
        }
    }, [params.id])

    useEffect(() => {
        const sessionId = Array.isArray(params.id) ? params.id[0] : params.id
        if (!sessionId || !results) return

        const status = (results.analysis_status || '').toLowerCase()
        if (status === 'completed' || status === 'failed') return

        const intervalId = setInterval(async () => {
            try {
                const latest = await getExamResults(sessionId)
                setResults(latest)
            } catch {
                // Keep silent during polling; initial load already handles errors
            }
        }, 7000)

        return () => clearInterval(intervalId)
    }, [params.id, results])

    const handlePracticeAgain = () => {
        const mode = results?.session_type || 'practice'
        if (sessionConfig?.mapping_id) {
            router.push(`/practice?concept=${sessionConfig.mapping_id}&mode=${mode}`)
            return
        }
        router.push(`/practice?mode=${mode}`)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading results...</p>
                </div>
            </div>
        )
    }

    if (loadError || !results) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Unable to load results</div>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        {loadError || 'Please try again in a moment.'}
                    </p>
                    <Button onClick={() => router.push('/practice')}>
                        Back to Practice
                    </Button>
                </div>
            </div>
        )
    }

    const totalQuestions = results.questions.length
    const correctCount = results.questions.filter((question) => question.is_correct).length
    const accuracyPercent = typeof results.accuracy === 'number'
        ? results.accuracy
        : totalQuestions
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0
    const percentage = accuracyPercent

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const modeLabel = {
        practice: 'Practice',
        exam: 'Exam',
        review: 'Review',
        diagnostic: 'Diagnostic'
    }[results.session_type] || 'Session'

    const getGrade = (percentage: number) => {
        if (percentage >= 90) return { grade: "A+", color: "text-[rgb(var(--secondary))]" }
        if (percentage >= 80) return { grade: "A", color: "text-[rgb(var(--secondary))]" }
        if (percentage >= 70) return { grade: "B", color: "text-[rgb(var(--primary))]" }
        if (percentage >= 60) return { grade: "C", color: "text-[rgb(var(--accent))]" }
        return { grade: "D", color: "text-destructive" }
    }

    const grade = getGrade(percentage)

    const sourceBadge = (source?: 'llm' | 'fallback' | 'failed' | 'pending' | 'none' | 'unknown') => {
        if (source === 'llm') {
            return <Badge className="bg-green-600 text-white border-green-700">LLM</Badge>
        }
        if (source === 'fallback') {
            return <Badge className="bg-amber-500 text-white border-amber-600">Fallback</Badge>
        }
        if (source === 'failed') {
            return <Badge className="bg-red-600 text-white border-red-700">Failed</Badge>
        }
        if (source === 'pending') {
            return <Badge variant="outline">Pending</Badge>
        }
        if (source === 'none') {
            return <Badge variant="outline">N/A</Badge>
        }
        return <Badge variant="outline">Unknown</Badge>
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
            <div className="container max-w-6xl px-4 py-8 mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    {/* <Button
            onClick={() => router.back()}
            variant="outline"
            className="h-10 w-10 p-0 flex items-center justify-center rounded-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button> */}
                    {/* Overall Score Card */}
                    <div className="text-center flex-1 mb-12">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-2xl shadow-emerald-500/50 mb-6 animate-in zoom-in duration-500">
                            <Trophy className="h-12 w-12 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent animate-gradient-x">{modeLabel} Completed!</h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">Here's how you performed</p>
                    </div>

                </div>


                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <Card className="border-none bg-gradient-to-br from-yellow-500 to-orange-600 text-white shadow-lg shadow-yellow-500/50">
                        <CardContent className="p-6 text-center">
                            <div className="text-5xl font-bold mb-2">
                                {grade.grade}
                            </div>
                            <div className="text-sm text-white/80">Grade</div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/50">
                        <CardContent className="p-6 text-center">
                            <div className="text-5xl font-bold mb-2">
                                {correctCount}/{totalQuestions}
                            </div>
                            <div className="text-sm text-white/80">Score</div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/50">
                        <CardContent className="p-6 text-center">
                            <div className="text-5xl font-bold mb-2">
                                {accuracyPercent}%
                            </div>
                            <div className="text-sm text-white/80">Accuracy</div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50">
                        <CardContent className="p-6 text-center">
                            <div className="text-5xl font-bold mb-2">
                                {formatDuration(results.time_taken_seconds)}
                            </div>
                            <div className="text-sm text-white/80">Time Taken</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress Bar */}
                <Card className="mb-8 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                            <span>Overall Progress</span>
                            <span>{percentage.toFixed(0)}%</span>
                        </div>
                        <Progress value={percentage} className="h-4" />
                    </CardContent>
                </Card>

                {/* Analysis Grid */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* Strong Topics */}
                    <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                                    <TrendingUp className="h-5 w-5 text-white" />
                                </div>
                                Strong Topics
                            </CardTitle>
                            <CardDescription className="dark:text-slate-400">
                                Topics where you performed well
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {results.strong_topics.map((topic, index) => (
                                <div key={`${topic.name}-${index}`} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{formatTopicId(topic.name)}</span>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{topic.accuracy}%</span>
                                    </div>
                                    <Progress value={topic.accuracy} className="h-2" />
                                </div>
                            ))}
                            {results.strong_topics.length === 0 && (
                                <p className="text-center text-slate-600 dark:text-slate-400 py-4 text-sm">
                                    No strong topics identified yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Error Patterns - NEW */}
                    <Card className="border-red-200 dark:border-red-800 bg-white dark:bg-slate-800 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                                    <AlertTriangle className="h-5 w-5 text-white" />
                                </div>
                                Error Patterns
                                {sourceBadge(results.error_patterns_source)}
                            </CardTitle>
                            <CardDescription className="dark:text-slate-400">
                                Common mistakes detected
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
                                {results.error_patterns.map((pattern) => (
                                    <ErrorPatternCard 
                                        key={pattern.error_type} 
                                        pattern={pattern} 
                                    />
                                ))}
                                {results.error_patterns.length === 0 && (
                                    <p className="text-center text-slate-600 dark:text-slate-400 py-4 text-sm">
                                        No error patterns detected. Great job!
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card className="border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                    <Target className="h-5 w-5 text-white" />
                                </div>
                                Recommendations
                                {sourceBadge(results.recommendations_source)}
                            </CardTitle>
                            <CardDescription className="dark:text-slate-400">
                                Suggested resources to improve
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                                {results.recommendations.map((rec, index) => (
                                    <RecommendationCard
                                        key={`${rec.title}-${index}`}
                                        recommendation={rec}
                                        index={index}
                                    />
                                ))}
                                {results.recommendations.length === 0 && (
                                    <p className="text-center text-slate-600 dark:text-slate-400 py-4 text-sm">
                                        {results.analysis_status === 'failed'
                                            ? 'Analysis failed for this session, so recommendations could not be generated. Please retake the test to regenerate analysis.'
                                            : 'Recommendations are being generated. This section updates automatically when analysis completes.'}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Prerequisite Gaps - Phase 3 */}
                    {results.prerequisite_gaps && results.prerequisite_gaps.length > 0 && (
                        <PrerequisiteGapAlert 
                            gaps={results.prerequisite_gaps} 
                            overallReadiness={results.overall_readiness}
                        />
                    )}
                </div>

                {(results.session_type !== 'practice' && results.session_type !== 'review') && (
                    <Card className="mb-8 border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                                    <Target className="h-5 w-5 text-white" />
                                </div>
                                RL Settings
                            </CardTitle>
                            <CardDescription className="dark:text-slate-400">
                                Reinforcement Learning configuration for this test
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Learning Rate</div>
                                    <div className="text-lg font-bold text-slate-900 dark:text-white">0.001</div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Discount Factor</div>
                                    <div className="text-lg font-bold text-slate-900 dark:text-white">0.95</div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Exploration Rate</div>
                                    <div className="text-lg font-bold text-slate-900 dark:text-white">0.2</div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Model Accuracy</div>
                                    <div className="text-lg font-bold text-slate-900 dark:text-white">87.5%</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Detailed Question Review */}
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">Detailed Question Review</CardTitle>
                        <CardDescription className="dark:text-slate-400">
                            Review all questions with correct answers and explanations
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {results.questions.map((question: QuestionResultPayload, index: number) => (
                            <Card
                            key={question.q_id}
                            className={`border-2 ${question.is_correct
                                        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20"
                                        : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
                                    }`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-semibold">Question {index + 1}</span>
                                                {question.is_correct ? (
                                                    <CheckCircle2 className="h-5 w-5 text-[rgb(var(--secondary))]" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-destructive" />
                                                )}
                                                {reportedQuestions.has(question.q_id) && (
                                                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                                                        <Flag className="h-3 w-3 mr-1" />
                                                        Reported
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm">{question.question_text}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!reportedQuestions.has(question.q_id) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setReportingQuestionId(question.q_id)
                                                        setReportModalOpen(true)
                                                    }}
                                                    className="gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                >
                                                    <Flag className="h-4 w-4" />
                                                    Report
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setExpandedQuestion(
                                                        expandedQuestion === question.q_id ? null : question.q_id
                                                    )
                                                }
                                            >
                                                {expandedQuestion === question.q_id ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                {expandedQuestion === question.q_id && (
                                    <CardContent className="space-y-4 pt-0">
                                        {/* Options */}
                                        <div className="space-y-2">
                                            {(question.options || []).map((option: QuestionOption) => (
                                                <div
                                                    key={option.id}
                                                    className={`p-3 rounded-lg border-2 ${option.id === question.correct_choice
                                                            ? "border-[rgb(var(--secondary))] bg-[rgb(var(--secondary))]/5"
                                                            : option.id === question.selected_choice &&
                                                                !question.is_correct
                                                                ? "border-destructive bg-destructive/5"
                                                                : "border-border"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {option.id === question.correct_choice && (
                                                            <CheckCircle2 className="h-4 w-4 text-[rgb(var(--secondary))]" />
                                                        )}
                                                        {option.id === question.selected_choice &&
                                                            !question.is_correct && (
                                                                <XCircle className="h-4 w-4 text-destructive" />
                                                            )}
                                                        <span className="text-sm">{option.text}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Explanation */}
                                        <div className="bg-muted/50 p-4 rounded-lg">
                                            <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Explanation
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {question.explanation || "No explanation available."}
                                            </p>
                                        </div>

                                        {/* Error Pattern Analysis - Only for incorrect answers */}
                                        {!question.is_correct && question.error_type && (() => {
                                            // Find the option they selected to show what error it represents
                                            const selectedOption = (question.options || []).find(
                                                (opt: QuestionOption) => opt.id === question.selected_choice
                                            )
                                            
                                            return (
                                                <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900 p-4 rounded-lg">
                                                    <div className="text-sm font-semibold mb-3 flex items-center gap-2 text-red-900 dark:text-red-200">
                                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                                        Error Pattern Detected
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <span className="inline-block px-3 py-1 rounded-md text-xs font-bold bg-red-600 text-white mb-2">
                                                                {formatErrorType(question.error_type)}
                                                            </span>
                                                            <p className="text-sm text-red-900 dark:text-red-200 font-medium">
                                                                This error pattern has been logged for personalized feedback.
                                                            </p>
                                                        </div>
                                                        
                                                        {selectedOption?.explanation && (
                                                            <div className="bg-white dark:bg-red-950/50 p-3 rounded border border-red-300 dark:border-red-800">
                                                                <p className="text-xs font-semibold text-red-800 dark:text-red-300 mb-1">
                                                                    🤔 Why this answer is wrong:
                                                                </p>
                                                                <p className="text-xs text-red-700 dark:text-red-400">
                                                                    {selectedOption.explanation}
                                                                </p>
                                                            </div>
                                                        )}
                                                        
                                                        <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded border border-blue-300 dark:border-blue-800">
                                                            <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                                                                💡 Check the Error Patterns section above for detailed analysis and improvement tips.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })()}
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Button
                        variant="outline"
                        size="lg"
                        className="flex-1 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-950"
                        onClick={() => router.push('/dashboard')}
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                    <Button
                        size="lg"
                        className="flex-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 shadow-lg shadow-emerald-500/50"
                        onClick={handlePracticeAgain}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Practice Again
                    </Button>
                </div>
            </div>

            {/* Report Question Modal */}
            {reportingQuestionId && (
                <ReportQuestionModal
                    open={reportModalOpen}
                    questionId={reportingQuestionId}
                    sessionId={Array.isArray(params.id) ? params.id[0] : params.id}
                    onClose={() => {
                        setReportModalOpen(false)
                        setReportingQuestionId(null)
                    }}
                    onReported={() => {
                        if (reportingQuestionId) {
                            setReportedQuestions(prev => new Set([...prev, reportingQuestionId]))
                        }
                    }}
                />
            )}
        </div>
    )
}

export default function ResultsPageWrapper() {
    return (
        <ProtectedRoute>
            <ResultsPage />
        </ProtectedRoute>
    )
}
