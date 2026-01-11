"use client";

import { useState } from "react";
import { ArrowDown, ArrowRight, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  category: "professor" | "system" | "student" | "decision" | "outcome";
  icon?: React.ReactNode;
}

export function WorkflowDiagram() {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const workflowSteps: WorkflowStep[] = [
    {
      id: "prof-login",
      title: "Professor Logs In",
      description: "Professor authenticates and accesses the platform",
      category: "professor",
    },
    {
      id: "prof-write",
      title: "Professor Writes Instructions",
      description: "Professor creates assignment instructions",
      category: "professor",
    },
    {
      id: "store-instructions",
      title: "Instructions Stored in Database",
      description: "Original instructions are saved",
      category: "system",
    },
    {
      id: "gemini-suggest",
      title: "Gemini API Suggests Modifications",
      description: "AI suggests modifications to create hidden traps",
      category: "system",
    },
    {
      id: "generate-traps",
      title: "System Generates Instructions with Hidden Traps",
      description: "Modified instructions with invisible modifications are created",
      category: "system",
    },
    {
      id: "generate-pdf",
      title: "Assignment Posted with PDF",
      description: "Assignment is published with the trapped PDF",
      category: "system",
    },
    {
      id: "student-download",
      title: "Students Download PDF",
      description: "Students access the assignment PDF",
      category: "student",
    },
    {
      id: "student-view",
      title: "Students View PDF (Can't See Hidden Traps)",
      description: "PDF appears normal but contains hidden modifications",
      category: "student",
    },
    {
      id: "student-ai",
      title: "Students Copy/Paste or Upload to AI Chatbot",
      description: "Students use the instructions with hidden traps in AI",
      category: "student",
    },
    {
      id: "student-upload",
      title: "Students Upload Assignment PDF",
      description: "Students submit their completed work",
      category: "student",
    },
    {
      id: "analyze",
      title: "PDF Contents Analyzed for Modifications",
      description: "System scans submission for hidden trap indicators",
      category: "system",
    },
    {
      id: "return-score",
      title: "Returns Score",
      description: "AI detection score is calculated",
      category: "system",
    },
    {
      id: "threshold-check",
      title: "Score > Threshold?",
      description: "Check if score exceeds detection threshold",
      category: "decision",
    },
  ];

  const getStepColor = (category: string) => {
    switch (category) {
      case "professor":
        return "bg-purple-500 border-purple-600";
      case "system":
        return "bg-blue-500 border-blue-600";
      case "student":
        return "bg-green-500 border-green-600";
      case "decision":
        return "bg-amber-500 border-amber-600";
      case "outcome":
        return "bg-red-500 border-red-600";
      default:
        return "bg-gray-500 border-gray-600";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "professor":
        return "Professor";
      case "system":
        return "System";
      case "student":
        return "Student";
      case "decision":
        return "Decision";
      case "outcome":
        return "Outcome";
      default:
        return "";
    }
  };

  return (
    <div className="w-full bg-white py-8">
      <div className="mx-auto max-w-5xl px-6">
        {/* Main Workflow Steps */}
        <div className="space-y-6">
          {workflowSteps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connector Line */}
              {index < workflowSteps.length - 1 && (
                <div className="absolute left-6 top-16 z-0 h-6 w-0.5 bg-slate-300"></div>
              )}

              {/* Step Card */}
              <div
                className={`relative z-10 flex gap-4 rounded-lg border-2 p-4 transition-all ${
                  getStepColor(step.category)
                } ${hoveredStep === step.id ? "scale-105 shadow-xl" : "shadow-md"}`}
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
              >
                {/* Step Number */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold text-gray-800 shadow">
                  {index + 1}
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
                      {getCategoryLabel(step.category)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-white/90">{step.description}</p>
                  {expandedStep === step.id && (
                    <div className="mt-2 rounded bg-white/20 p-2 text-xs text-white">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Decision Tree Section */}
        <div className="mt-12 rounded-lg border-2 border-amber-400 bg-amber-50 p-6">
          <h3 className="mb-6 text-center text-2xl font-bold text-gray-800">
            If Score Exceeds Threshold
          </h3>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Skip Interview Path */}
            <div className="rounded-lg border-2 border-red-400 bg-red-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <h4 className="text-lg font-semibold text-red-800">Skip Interview</h4>
              </div>
              <p className="text-sm text-red-700">Student chooses to skip → Automatically Flagged</p>
            </div>

            {/* Do Interview Path */}
            <div className="rounded-lg border-2 border-blue-400 bg-blue-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <h4 className="text-lg font-semibold text-blue-800">Do Interview</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">Interview Pass</p>
                    <p className="text-xs text-blue-700">→ Not Flagged</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Interview Fail</p>
                    <p className="text-xs text-red-700">→ Flagged</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Below Threshold Outcome */}
        <div className="mt-6 rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-gray-600" />
            <h4 className="text-lg font-semibold text-gray-800">If Score Below Threshold</h4>
          </div>
          <p className="mt-1 text-sm text-gray-700">Nothing happens - Submission is accepted</p>
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 border-t border-gray-200 pt-6">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-purple-500"></div>
            <span className="text-sm text-gray-600">Professor Actions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-blue-500"></div>
            <span className="text-sm text-gray-600">System Process</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-green-500"></div>
            <span className="text-sm text-gray-600">Student Actions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-amber-500"></div>
            <span className="text-sm text-gray-600">Decision Point</span>
          </div>
        </div>
      </div>
    </div>
  );
}
