'use client';

import { useState } from 'react';
import { InterviewModal } from '@/components/interviews/InterviewModal';

interface SubmissionFormProps {
  assignmentId: string;
  studentId: string;
}

export function SubmissionForm({ assignmentId, studentId }: SubmissionFormProps) {
  const [submissionText, setSubmissionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showInterview, setShowInterview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, studentId, submissionText })
      });

      const data = await response.json();
      setResult(data);

      if (data.needsInterview) {
        setShowInterview(true);
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={submissionText}
          onChange={(e) => setSubmissionText(e.target.value)}
          required
          rows={12}
          className="w-full p-4 border rounded"
          placeholder="Type your response here..."
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {result && !showInterview && (
        <div className={`mt-4 p-4 rounded ${
          result.needsInterview ? 'bg-yellow-100' : 'bg-green-100'
        }`}>
          <p className="font-semibold">
            Submitted successfully! Cheating score: {(result.cheatingScore * 100).toFixed(0)}%
          </p>
          {result.needsInterview && (
            <p className="text-sm mt-2">Please complete the interview verification.</p>
          )}
        </div>
      )}

      {showInterview && (
        <InterviewModal
          assignmentId={assignmentId}
          submissionId={result.submissionId}
          onClose={() => setShowInterview(false)}
        />
      )}
    </>
  );
}
