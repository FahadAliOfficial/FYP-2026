"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, ArrowRight, CheckCircle2, Sparkles } from "lucide-react"

const languages = [
  {
    id: "python_3",
    name: "Python",
    version: "3.11+",
    icon: "🐍",
    description: "Perfect for beginners, data science, and web development",
    color: "from-blue-500 to-blue-600",
    hoverColor: "hover:border-blue-500 dark:hover:border-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    difficulty: "Beginner Friendly",
  },
  {
    id: "javascript_es6",
    name: "JavaScript",
    version: "ES6+",
    icon: "📜",
    description: "Essential for web development and modern applications",
    color: "from-yellow-500 to-yellow-600",
    hoverColor: "hover:border-yellow-500 dark:hover:border-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    difficulty: "Beginner Friendly",
  },
  {
    id: "java_17",
    name: "Java",
    version: "17 LTS",
    icon: "☕",
    description: "Enterprise applications and Android development",
    color: "from-red-500 to-orange-600",
    hoverColor: "hover:border-red-500 dark:hover:border-red-400",
    bgColor: "bg-red-50 dark:bg-red-950",
    difficulty: "Intermediate",
  },
  {
    id: "cpp_20",
    name: "C++",
    version: "C++20",
    icon: "⚙️",
    description: "High-performance systems and game development",
    color: "from-purple-500 to-purple-600",
    hoverColor: "hover:border-purple-500 dark:hover:border-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    difficulty: "Advanced",
  },
  {
    id: "go_1_21",
    name: "Go",
    version: "1.21+",
    icon: "🔵",
    description: "Cloud services, microservices, and concurrent systems",
    color: "from-cyan-500 to-blue-500",
    hoverColor: "hover:border-cyan-500 dark:hover:border-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950",
    difficulty: "Intermediate",
  },
  {
    id: "typescript",
    name: "TypeScript",
    version: "5.0+",
    icon: "💙",
    description: "Type-safe JavaScript for large-scale applications",
    color: "from-blue-400 to-blue-500",
    hoverColor: "hover:border-blue-400 dark:hover:border-blue-300",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    difficulty: "Intermediate",
  },
]

export default function LanguageSelectionPage() {
  const router = useRouter()
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LearnRL"

  const handleContinue = () => {
    if (selectedLanguage) {
      // TODO: Call API - POST /api/user/set-language
      // Expected payload: { user_id, language_id: selectedLanguage }
      // Expected response: { success: true, language_id }

      // Store selected language in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedLanguage', selectedLanguage)
        
        // Get pending user data from registration
        const pendingUser = sessionStorage.getItem('pendingUser')
        if (pendingUser) {
          const userData = JSON.parse(pendingUser)
          localStorage.setItem('user', JSON.stringify({
            ...userData,
            language_id: selectedLanguage
          }))
          sessionStorage.removeItem('pendingUser')
        }
      }

      // Redirect to dashboard
      router.push("/dashboard")
    }
  }

  const selectedLang = languages.find(lang => lang.id === selectedLanguage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-green-500 shadow-2xl shadow-blue-500/50 mb-4">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-green-500 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
            Choose Your Learning Path
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Select your primary programming language to get started with personalized learning
          </p>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              You can add more languages later
            </span>
          </div>
        </div>

        {/* Language Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {languages.map((lang) => {
            const isSelected = selectedLanguage === lang.id

            return (
              <Card
                key={lang.id}
                className={`
                  relative cursor-pointer transition-all duration-300 
                  border-2 bg-white dark:bg-slate-800
                  ${isSelected 
                    ? `${lang.hoverColor} ${lang.bgColor} shadow-2xl scale-105 ring-4 ring-offset-2 dark:ring-offset-slate-900` 
                    : 'border-slate-200 dark:border-slate-700 hover:shadow-xl hover:scale-102'
                  }
                `}
                onClick={() => setSelectedLanguage(lang.id)}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${lang.color} flex items-center justify-center shadow-lg`}>
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                )}

                <CardHeader className="space-y-3">
                  {/* Icon */}
                  <div className={`text-6xl mb-2 transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`}>
                    {lang.icon}
                  </div>

                  {/* Language Name & Version */}
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                      {lang.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {lang.version}
                      </span>
                      <span className={`
                        text-xs px-2 py-0.5 rounded-full font-semibold
                        ${lang.difficulty === 'Beginner Friendly' 
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : lang.difficulty === 'Intermediate'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                          : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                        }
                      `}>
                        {lang.difficulty}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <CardDescription className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {lang.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Footer Actions */}
        <Card className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Selected Language Display */}
              <div className="flex items-center gap-3">
                {selectedLang ? (
                  <>
                    <div className="text-3xl">{selectedLang.icon}</div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Selected Language:</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {selectedLang.name} {selectedLang.version}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">
                    Please select a language to continue
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="border-slate-300 dark:border-slate-600"
                >
                  Back to Login
                </Button>
                <Button
                  disabled={!selectedLanguage}
                  onClick={handleContinue}
                  className={`
                    h-12 px-8 text-base font-semibold shadow-lg transition-all
                    ${selectedLanguage 
                      ? 'bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-500 hover:to-green-400 shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105' 
                      : 'bg-slate-300 dark:bg-slate-700'
                    }
                  `}
                >
                  Continue to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Additional Options */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Want to learn multiple languages?{" "}
                <span className="text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline">
                  Add secondary language later
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
