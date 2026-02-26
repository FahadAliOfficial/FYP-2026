/**
 * Report Question Modal
 * 
 * Reusable modal for students to report issues with questions.
 * Used both during exams and in the results page.
 */

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, XCircle, AlertTriangle, MessageSquare, FileText, Loader2 } from "lucide-react"
import { createQuestionReport } from "@/lib/api/reports"
import type { ReportType } from "@/lib/types/reports"
import { useToast } from "@/hooks/use-toast"

interface ReportQuestionModalProps {
  open: boolean
  questionId: string
  sessionId?: string
  onClose: () => void
  onReported?: () => void
}

const REPORT_TYPES: Array<{
  value: ReportType
  label: string
  description: string
  icon: typeof AlertCircle
}> = [
  {
    value: 'incorrect_answer',
    label: 'Incorrect Answer',
    description: 'The marked correct answer is wrong',
    icon: XCircle
  },
  {
    value: 'missing_correct',
    label: 'Missing Correct Option',
    description: 'None of the options are correct',
    icon: AlertTriangle
  },
  {
    value: 'confusing_wording',
    label: 'Confusing Wording',
    description: 'The question is unclear or ambiguous',
    icon: MessageSquare
  },
  {
    value: 'explanation_mismatch',
    label: 'Explanation Mismatch',
    description: "Explanation doesn't match the correct answer",
    icon: FileText
  },
  {
    value: 'other',
    label: 'Other Issue',
    description: 'Something else is wrong',
    icon: AlertCircle
  }
]

export function ReportQuestionModal({
  open,
  questionId,
  sessionId,
  onClose,
  onReported
}: ReportQuestionModalProps) {
  const { toast } = useToast()
  const [reportType, setReportType] = useState<ReportType>('incorrect_answer')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const charCount = description.length
  const isValid = charCount >= 10 && charCount <= 1000

  const handleSubmit = async () => {
    // Prevent double submission
    if (isSubmitting) {
      return
    }

    if (!isValid) {
      toast({
        title: "Invalid Description",
        description: "Please provide at least 10 characters explaining the issue.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      await createQuestionReport({
        question_id: questionId,
        session_id: sessionId,
        report_type: reportType,
        description: description.trim()
      })

      toast({
        title: "Question Reported",
        description: "Thank you! We'll review this question soon.",
      })

      // Reset form
      setDescription('')
      setReportType('incorrect_answer')
      
      onReported?.()
      onClose()
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Failed to submit report"
      
      if (error.response?.status === 409) {
        toast({
          title: "Already Reported",
          description: "You've already reported this question.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Submission Failed",
          description: errorMsg,
          variant: "destructive"
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (!isSubmitting) {
      setDescription('')
      setReportType('incorrect_answer')
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Report Question Issue
          </DialogTitle>
          <DialogDescription>
            Help us improve by reporting issues with this question. Your feedback is valuable.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Report Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">What's the issue?</Label>
            <RadioGroup 
              value={reportType} 
              onValueChange={(value) => !isSubmitting && setReportType(value as ReportType)}
              disabled={isSubmitting}
            >
              {REPORT_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <div
                    key={type.value}
                    className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all ${
                      isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    } ${
                      reportType === type.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    onClick={() => !isSubmitting && setReportType(type.value)}
                  >
                    <RadioGroupItem value={type.value} id={type.value} />
                    <div className="flex-1">
                      <Label
                        htmlFor={type.value}
                        className="flex items-center gap-2 font-semibold cursor-pointer"
                      >
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-semibold">
              Please explain the issue in detail *
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Describe what's wrong with this question. Be specific so we can fix it accurately."
              className="min-h-32 resize-none"
              maxLength={1000}
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between text-sm">
              <span className={`${
                charCount < 10 
                  ? 'text-red-600 dark:text-red-400' 
                  : charCount > 900 
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {charCount < 10 ? `${10 - charCount} more characters needed` : `${charCount} / 1000 characters`}
              </span>
              {isValid && (
                <span className="text-green-600 dark:text-green-400 text-xs">
                  ✓ Ready to submit
                </span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
