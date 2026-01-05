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
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    description: "Perfect for beginners, data science, and web development",
    color: "from-blue-500 to-blue-600",
    hoverColor: "hover:border-blue-500 dark:hover:border-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  {
    id: "javascript_es6",
    name: "JavaScript",
    version: "ES6+",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    description: "Essential for web development and modern applications",
    color: "from-yellow-500 to-yellow-600",
    hoverColor: "hover:border-yellow-500 dark:hover:border-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
  },
  {
    id: "java_17",
    name: "Java",
    version: "17 LTS",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
    description: "Enterprise applications and Android development",
    color: "from-red-500 to-orange-600",
    hoverColor: "hover:border-red-500 dark:hover:border-red-400",
    bgColor: "bg-red-50 dark:bg-red-950",
  },
  {
    id: "cpp_20",
    name: "C++",
    version: "C++20",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
    description: "High-performance systems and game development",
    color: "from-purple-500 to-purple-600",
    hoverColor: "hover:border-purple-500 dark:hover:border-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950",
  },
  {
    id: "go_1_21",
    name: "Go",
    version: "1.21+",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg",
    description: "Cloud services, microservices, and concurrent systems",
    color: "from-cyan-500 to-blue-500",
    hoverColor: "hover:border-cyan-500 dark:hover:border-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950",
  },
  {
    id: "typescript",
    name: "TypeScript",
    version: "5.0+",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
    description: "Type-safe JavaScript for large-scale applications",
    color: "from-blue-400 to-blue-500",
    hoverColor: "hover:border-blue-400 dark:hover:border-blue-300",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
]

const difficultyLevels = [
  {
    id: "beginner",
    name: "Beginner",
    description: "New to programming or this language",
    icon: "🌱",
    color: "from-green-500 to-green-600",
    hoverColor: "hover:border-green-500 dark:hover:border-green-400",
  },
  {
    id: "intermediate",
    name: "Intermediate",
    description: "Comfortable with basic concepts",
    icon: "�",
    color: "from-blue-500 to-blue-600",
    hoverColor: "hover:border-blue-500 dark:hover:border-blue-400",
  },
  {
    id: "advanced",
    name: "Advanced",
    description: "Experienced and looking to master",
    icon: "⚡",
    color: "from-purple-500 to-purple-600",
    hoverColor: "hover:border-purple-500 dark:hover:border-purple-400",
  },
]

export default function LanguageSelectionPage() {
  const router = useRouter()
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "LearnRL"

  const handleContinue = () => {
    if (selectedLanguage && selectedDifficulty) {
      // TODO: Call API - POST /api/user/set-language
      // Expected payload: { user_id, language_id: selectedLanguage, difficulty_level: selectedDifficulty }
      // Expected response: { success: true, language_id, difficulty_level }

      // Store selected language and difficulty in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedLanguage', selectedLanguage)
        localStorage.setItem('difficultyLevel', selectedDifficulty)
        
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
                  {/* Logo */}
                  <div className={`mb-2 transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`}>
                    <img 
                      src={lang.logo} 
                      alt={`${lang.name} logo`} 
                      className="w-16 h-16 object-contain"
                    />
                  </div>

                  {/* Language Name & Version */}
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                      {lang.name}
                    </CardTitle>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {lang.version}
                    </span>
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

        {/* Difficulty Level Selection - Shows after language is selected */}
        {selectedLanguage && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Choose Your Skill Level
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                This helps us personalize your learning experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {difficultyLevels.map((level) => {
                const isSelected = selectedDifficulty === level.id

                return (
                  <Card
                    key={level.id}
                    className={`
                      relative cursor-pointer transition-all duration-300 
                      border-2 bg-white dark:bg-slate-800
                      ${isSelected 
                        ? `${level.hoverColor} shadow-2xl scale-105 ring-4 ring-offset-2 dark:ring-offset-slate-900` 
                        : 'border-slate-200 dark:border-slate-700 hover:shadow-xl hover:scale-102'
                      }
                    `}
                    onClick={() => setSelectedDifficulty(level.id)}
                  >
                    {isSelected && (
                      <div className="absolute -top-3 -right-3 z-10">
                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center shadow-lg`}>
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    )}

                    <CardHeader className="text-center">
                      <div className="text-5xl mb-3">{level.icon}</div>
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                        {level.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <CardDescription className="text-center text-slate-600 dark:text-slate-400">
                        {level.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <Card className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Selected Language Display */}
              <div className="flex items-center gap-3">
                {selectedLang ? (
                  <>
                    <img 
                      src={selectedLang.logo} 
                      alt={`${selectedLang.name} logo`} 
                      className="w-12 h-12 object-contain"
                    />
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Selected Language:</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {selectedLang.name} {selectedLang.version}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">
                    Please select a language {selectedLanguage && 'and difficulty level'} to continue
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
                  disabled={!selectedLanguage || !selectedDifficulty}
                  onClick={handleContinue}
                  className={`
                    h-12 px-8 text-base font-semibold shadow-lg transition-all
                    ${selectedLanguage && selectedDifficulty
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
