"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserCheck, UserX, Edit, Mail, Calendar, Activity, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// TODO: Add role-based access control when backend supports admin roles
export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // TODO: In production, fetch from API - GET /api/admin/users
  const mockUsers = [
    {
      id: 1,
      email: "alice.johnson@example.com",
      name: "Alice Johnson",
      status: "active",
      language: "Python",
      joinedAt: "2025-11-15",
      lastActive: "2026-01-29",
      sessionsCompleted: 47,
      avgMastery: 72.5,
    },
    {
      id: 2,
      email: "bob.smith@example.com",
      name: "Bob Smith",
      status: "active",
      language: "JavaScript",
      joinedAt: "2025-12-03",
      lastActive: "2026-01-30",
      sessionsCompleted: 32,
      avgMastery: 68.3,
    },
    {
      id: 3,
      email: "carol.white@example.com",
      name: "Carol White",
      status: "inactive",
      language: "Java",
      joinedAt: "2025-10-22",
      lastActive: "2026-01-10",
      sessionsCompleted: 15,
      avgMastery: 54.2,
    },
    {
      id: 4,
      email: "david.brown@example.com",
      name: "David Brown",
      status: "active",
      language: "C++",
      joinedAt: "2026-01-05",
      lastActive: "2026-01-30",
      sessionsCompleted: 8,
      avgMastery: 61.7,
    },
    {
      id: 5,
      email: "eve.davis@example.com",
      name: "Eve Davis",
      status: "suspended",
      language: "Python",
      joinedAt: "2025-09-18",
      lastActive: "2026-01-15",
      sessionsCompleted: 23,
      avgMastery: 48.1,
    },
  ]

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleToggleStatus = (userId: number, currentStatus: string) => {
    // TODO: Call API - PATCH /api/admin/users/:id/status
    console.log(`Toggle status for user ${userId}, current: ${currentStatus}`)
  }

  const handleEditUser = (userId: number) => {
    // TODO: Implement edit modal or navigate to edit page
    console.log(`Edit user ${userId}`)
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent">
          User Management
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          View and manage platform users
        </p>
      </div>

      {/* Filters */}
      <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-green-200 dark:border-green-900 bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Users</p>
                <p className="text-3xl font-black text-green-600 dark:text-green-400">
                  {mockUsers.filter(u => u.status === "active").length}
                </p>
              </div>
              <UserCheck className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200 dark:border-yellow-900 bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Inactive Users</p>
                <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400">
                  {mockUsers.filter(u => u.status === "inactive").length}
                </p>
              </div>
              <Activity className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 dark:border-red-900 bg-white dark:bg-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Suspended Users</p>
                <p className="text-3xl font-black text-red-600 dark:text-red-400">
                  {mockUsers.filter(u => u.status === "suspended").length}
                </p>
              </div>
              <UserX className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl font-black">Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* User Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">{user.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        <span className="text-slate-600 dark:text-slate-400">
                          Joined {new Date(user.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Activity className="h-3 w-3 text-slate-500" />
                        <span className="text-slate-600 dark:text-slate-400">
                          Last active {new Date(user.lastActive).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">
                          Language: <span className="font-semibold text-slate-900 dark:text-white">{user.language}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">
                          Sessions: <span className="font-semibold text-slate-900 dark:text-white">{user.sessionsCompleted}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-600 dark:text-slate-400">Avg Mastery</span>
                          <span className="font-bold text-slate-900 dark:text-white">{user.avgMastery}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full"
                            style={{ width: `${user.avgMastery}%` }}
                          />
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.status === "active" 
                          ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400"
                          : user.status === "inactive"
                          ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400"
                          : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
                      }`}>
                        {user.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant={user.status === "suspended" ? "default" : "destructive"}
                      size="sm"
                      onClick={() => handleToggleStatus(user.id, user.status)}
                    >
                      {user.status === "suspended" ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Activate
                        </>
                      ) : (
                        <>
                          <UserX className="h-4 w-4 mr-2" />
                          Suspend
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  )
}
