"use client";

import React, { useState } from "react";
import { Play, CheckCircle, XCircle, Clock, Cpu, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { apiClient } from "@/lib/api/client";

interface CodeExecutionPanelProps {
  language: string;
  code: string;
  correctAnswer: string;
  questionId?: string;
}

interface ExecutionResult {
  status: string;
  status_id: number;
  stdout: string;
  stderr: string;
  compile_output: string;
  message: string;
  time: number | null;
  memory: number | null;
  exit_code: number | null;
}

interface ValidationResult {
  is_valid: boolean;
  matched: boolean;
  execution_result: ExecutionResult;
  comparison: {
    expected: string;
    actual: string;
    match: boolean;
    expected_length: number;
    actual_length: number;
  };
}

const CodeExecutionPanel: React.FC<CodeExecutionPanelProps> = ({
  language,
  code,
  correctAnswer,
  questionId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(true);

  const runCode = async () => {
    if (!code.trim()) {
      setError("No code to execute");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data: ValidationResult = await apiClient("/api/code-execution/validate-question", {
        method: "POST",
        body: JSON.stringify({
          question_id: questionId || "unknown",
          code_snippet: code,
          correct_answer: correctAnswer,
          language_id: language,
          wrap_code: true,
        }),
      });

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute code");
      console.error("Code execution error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (statusId: number) => {
    if (statusId === 3) return "text-green-500";
    if (statusId >= 4 && statusId <= 12) return "text-red-500";
    return "text-yellow-500";
  };

  const getStatusIcon = (statusId: number) => {
    if (statusId === 3) return <CheckCircle className="w-5 h-5" />;
    if (statusId >= 4 && statusId <= 12) return <XCircle className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  return (
    <div className="mt-4 border border-slate-700 rounded-lg bg-slate-800/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-400" />
          Code Validation
        </h3>
        <button
          onClick={runCode}
          disabled={isLoading || !code.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Code
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-600 rounded-lg text-red-400 flex items-start gap-2">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Error</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Overall Status */}
          <div
            className={`p-4 rounded-lg border ${
              result.matched
                ? "bg-green-900/20 border-green-600"
                : result.is_valid
                ? "bg-yellow-900/20 border-yellow-600"
                : "bg-red-900/20 border-red-600"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {result.matched ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <div>
                      <div className="font-semibold text-green-400">✓ Output Matches</div>
                      <div className="text-sm text-green-300">Code produces correct answer</div>
                    </div>
                  </>
                ) : result.is_valid ? (
                  <>
                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                    <div>
                      <div className="font-semibold text-yellow-400">⚠ Output Mismatch</div>
                      <div className="text-sm text-yellow-300">Code runs but output doesn't match</div>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-400" />
                    <div>
                      <div className="font-semibold text-red-400">✗ Execution Failed</div>
                      <div className="text-sm text-red-300">{result.execution_result.status}</div>
                    </div>
                  </>
                )}
              </div>

              {/* Execution Stats */}
              <div className="flex items-center gap-4 text-sm">
                {result.execution_result.time !== null && (
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-4 h-4" />
                    {result.execution_result.time}s
                  </div>
                )}
                {result.execution_result.memory !== null && (
                  <div className="flex items-center gap-1 text-slate-400">
                    <Cpu className="w-4 h-4" />
                    {result.execution_result.memory} KB
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <div className="text-xs font-semibold text-slate-400 mb-2">EXPECTED OUTPUT</div>
              <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-words">
                {result.comparison.expected || "(empty)"}
              </pre>
              <div className="text-xs text-slate-500 mt-2">{result.comparison.expected_length} chars</div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <div className="text-xs font-semibold text-slate-400 mb-2">ACTUAL OUTPUT</div>
              <pre className="text-sm text-blue-400 font-mono whitespace-pre-wrap break-words">
                {result.comparison.actual || "(empty)"}
              </pre>
              <div className="text-xs text-slate-500 mt-2">{result.comparison.actual_length} chars</div>
            </div>
          </div>

          {/* Detailed Results (collapsible) */}
          <div className="border border-slate-700 rounded-lg">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between p-3 hover:bg-slate-700/30 transition-colors"
            >
              <span className="text-sm font-semibold text-slate-300">Execution Details</span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDetails && (
              <div className="p-3 space-y-3 border-t border-slate-700">
                {/* Status */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-1">STATUS</div>
                  <div className={`flex items-center gap-2 ${getStatusColor(result.execution_result.status_id)}`}>
                    {getStatusIcon(result.execution_result.status_id)}
                    <span className="text-sm font-mono">{result.execution_result.status}</span>
                  </div>
                </div>

                {/* Stderr */}
                {result.execution_result.stderr && (
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-1">STDERR</div>
                    <pre className="text-sm text-red-400 font-mono bg-slate-900/50 p-2 rounded overflow-x-auto">
                      {result.execution_result.stderr}
                    </pre>
                  </div>
                )}

                {/* Compile Output */}
                {result.execution_result.compile_output && (
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-1">COMPILATION OUTPUT</div>
                    <pre className="text-sm text-orange-400 font-mono bg-slate-900/50 p-2 rounded overflow-x-auto">
                      {result.execution_result.compile_output}
                    </pre>
                  </div>
                )}

                {/* Message */}
                {result.execution_result.message && (
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-1">MESSAGE</div>
                    <pre className="text-sm text-yellow-400 font-mono bg-slate-900/50 p-2 rounded overflow-x-auto">
                      {result.execution_result.message}
                    </pre>
                  </div>
                )}

                {/* Exit Code */}
                {result.execution_result.exit_code !== null && (
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-1">EXIT CODE</div>
                    <div className="text-sm font-mono text-slate-300">{result.execution_result.exit_code}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeExecutionPanel;
