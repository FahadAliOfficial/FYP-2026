"use client"

import { useAuth } from "@/lib/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function DebugUserPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You are not logged in.</p>
            <Button onClick={() => router.push("/login")} className="mt-4">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Current User Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <strong>User ID:</strong>
              <pre className="bg-slate-100 p-2 rounded mt-1">{user?.id || "N/A"}</pre>
            </div>
            <div>
              <strong>Email:</strong>
              <pre className="bg-slate-100 p-2 rounded mt-1">{user?.email || "N/A"}</pre>
            </div>
            <div>
              <strong>Last Active Language:</strong>
              <pre className="bg-slate-100 p-2 rounded mt-1">
                {user?.last_active_language || "None"}
              </pre>
            </div>
            <div>
              <strong>Full User Object:</strong>
              <pre className="bg-slate-100 p-2 rounded mt-1 overflow-auto max-h-96">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            <div>
              <strong>LocalStorage selectedLanguage:</strong>
              <pre className="bg-slate-100 p-2 rounded mt-1">
                {typeof window !== "undefined" 
                  ? localStorage.getItem("selectedLanguage") || "Not set"
                  : "N/A"}
              </pre>
            </div>
            <Button onClick={() => router.push("/dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
