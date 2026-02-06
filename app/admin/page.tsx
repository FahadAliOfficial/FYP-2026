"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Database, Flag, MessageSquare, TrendingUp, Activity, UserCheck, AlertCircle } from "lucide-react"

// TODO: Add role-based access control when backend supports admin roles
export default function AdminDashboard() {
  // TODO: In production, fetch from API - GET /api/admin/analytics
  const mockAnalytics = {
    totalUsers: 1247,
    activeUsers: 834,
    retentionRate: 68.5,
    totalQuestions: 5632,
    verifiedQuestions: 4891,
    pendingReports: 23,
    openQueries: 12,
    avgMastery: 67.3,
  }

  // TODO: In production, fetch from API - GET /api/admin/concept-stats
  const mockConceptStats = [
    { concept: "Variables", sessions: 3421, avgMastery: 72.5, avgTime: 245 },
    { concept: "Conditionals", sessions: 2987, avgMastery: 68.3, avgTime: 312 },
    { concept: "Loops", sessions: 2654, avgMastery: 65.1, avgTime: 387 },
    { concept: "Functions", sessions: 2103, avgMastery: 61.8, avgTime: 425 },
    { concept: "Collections", sessions: 1876, avgMastery: 58.2, avgTime: 468 },
  ]

  // TODO: In production, fetch from API - GET /api/admin/recent-activity
  const mockRecentActivity = [
    { type: "user", message: "New user registered: john.doe@example.com", time: "5 min ago" },
    { type: "report", message: "Question #8923 reported by user #451", time: "12 min ago" },
    { type: "query", message: "New support ticket: Login issue", time: "23 min ago" },
    { type: "question", message: "15 new questions generated for Python/Loops", time: "1 hour ago" },
  ]

  const stats = [
    {
      name: "Total Users",
      value: mockAnalytics.totalUsers.toLocaleString(),
      icon: Users,
      color: "from-blue-600 to-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      change: "+12.3%",
      changeType: "positive"
    },
    {
      name: "Active Users",
      value: mockAnalytics.activeUsers.toLocaleString(),
      icon: UserCheck,
      color: "from-green-600 to-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
      change: "+8.1%",
      changeType: "positive"
    },
    {
      name: "Retention Rate",
      value: `${mockAnalytics.retentionRate}%`,
      icon: TrendingUp,
      color: "from-purple-600 to-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      change: "+2.4%",
      changeType: "positive"
    },
    {
      name: "Avg Mastery",
      value: `${mockAnalytics.avgMastery}%`,
      icon: Activity,
      color: "from-yellow-600 to-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
      change: "+5.2%",
      changeType: "positive"
    },
    {
      name: "Total Questions",
      value: mockAnalytics.totalQuestions.toLocaleString(),
      icon: Database,
      color: "from-cyan-600 to-cyan-500",
      bgColor: "bg-cyan-50 dark:bg-cyan-950",
      change: "+234",
      changeType: "neutral"
    },
    {
      name: "Pending Reports",
      value: mockAnalytics.pendingReports.toString(),
      icon: Flag,
      color: "from-red-600 to-red-500",
      bgColor: "bg-red-50 dark:bg-red-950",
      change: "-3",
      changeType: "positive"
    },
    {
      name: "Open Queries",
      value: mockAnalytics.openQueries.toString(),
      icon: MessageSquare,
      color: "from-orange-600 to-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      change: "+2",
      changeType: "negative"
    },
    {
      name: "Verified Questions",
      value: mockAnalytics.verifiedQuestions.toLocaleString(),
      icon: AlertCircle,
      color: "from-indigo-600 to-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
      change: `${((mockAnalytics.verifiedQuestions / mockAnalytics.totalQuestions) * 100).toFixed(1)}%`,
      changeType: "neutral"
    },
  ]

  return (
    <ProtectedRoute>
      <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute -top-4 left-0 w-32 h-32 bg-red-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute -top-4 right-0 w-32 h-32 bg-orange-500/20 rounded-full filter blur-3xl"></div>
        <div className="relative">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Platform overview and analytics
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.name}
              className="relative overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-xl group bg-white dark:bg-slate-800"
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`}></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {stat.name}
                </CardTitle>
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  {stat.value}
                </div>
                <p className={`text-xs mt-2 font-semibold ${
                  stat.changeType === 'positive' 
                    ? 'text-green-600 dark:text-green-400' 
                    : stat.changeType === 'negative'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Most Practiced Concepts */}
      <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">
            Most Practiced Concepts
          </CardTitle>
          <CardDescription>Platform-wide concept engagement and mastery</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockConceptStats.map((concept, index) => (
              <div key={concept.concept} className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-orange-600 text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {concept.concept}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {concept.sessions} sessions
                      </span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {concept.avgMastery}% mastery
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        ~{concept.avgTime}s avg
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${concept.avgMastery}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">
            Recent Activity
          </CardTitle>
          <CardDescription>Latest platform events and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentActivity.map((activity, index) => {
              const icons = {
                user: Users,
                report: Flag,
                query: MessageSquare,
                question: Database,
              }
              const colors = {
                user: "from-blue-600 to-blue-500",
                report: "from-red-600 to-red-500",
                query: "from-orange-600 to-orange-500",
                question: "from-green-600 to-green-500",
              }
              const Icon = icons[activity.type as keyof typeof icons]

              return (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${colors[activity.type as keyof typeof colors]} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-white font-medium">
                      {activity.message}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {activity.time}
                    </p>
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
