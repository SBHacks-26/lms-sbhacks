'use client';

import { useState, useEffect } from 'react';
import { DeepgramClient, AgentEvents } from '@deepgram/sdk';
import { Mic } from '@/components/mic/Mic';

interface InterviewModalProps {
  assignmentId: string;
  submissionId: string;
  onClose: () => void;
}

export function InterviewModal({ assignmentId, submissionId, onClose }: InterviewModalProps) {
  const [transcript, setTranscript] = useState<Array<{ role: string; content: string }>>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [micState, setMicState] = useState<'open' | 'loading' | 'closed'>('closed');
  const [token, setToken] = useState<string | null>(null);

  // Get Deepgram token
  useEffect(() => {
    fetch('/api/token')
      .then(res => res.json())
      .then(data => setToken(data.token));
  }, []);

  // Connect to Deepgram agent with interview prompt
  const connect = () => {
    if (!token) return;

    const dgClient = new DeepgramClient({ accessToken: token }).agent();
    setClient(dgClient);

    dgClient.once(AgentEvents.Welcome, () => {
      dgClient.configure({
        audio: {
          input: { encoding: 'linear16', sample_rate: 24000 },
          output: { encoding: 'linear16', sample_rate: 24000, container: 'none' }
        },
        agent: {
          greeting: "I need to verify your understanding of the assignment. Can you summarize what you wrote in your own words?",
          listen: { provider: { type: 'deepgram', model: 'flux-general-en' } },
          speak: { provider: { type: 'deepgram', model: 'aura-2-thalia-en' } },
          think: {
            provider: { type: 'anthropic', model: 'claude-3-5-haiku-20241022' },
            prompt: `You are verifying a student understood their assignment submission.
Their submission was flagged for potential AI assistance.

Ask 3 quick questions:
1. "Can you summarize what you wrote in your own words?"
2. "What was the main point you were trying to make?"
3. "Can you explain a specific concept from your submission?"

Be conversational, not interrogative. After 3 questions, say:
"Thanks! Your response has been recorded."

Then output: VERDICT: LIKELY_CHEATED | UNCLEAR | LEGITIMATE`
          }
        }
      });
    });

    dgClient.once(AgentEvents.SettingsApplied, () => {
      setMicState('open');
    });

    dgClient.on(AgentEvents.ConversationText, (message) => {
      setTranscript(prev => [...prev, { role: message.role, content: message.content }]);
    });
  };

  // Detect when interview completes
  useEffect(() => {
    const lastMessage = transcript[transcript.length - 1];
    if (lastMessage?.content.includes('VERDICT:')) {
      const verdict = lastMessage.content.match(/VERDICT:\s*(\w+)/)?.[1] || 'UNCLEAR';
      saveTranscript(verdict);
      setIsComplete(true);
    }
  }, [transcript]);

  const saveTranscript = async (verdict: string) => {
    await fetch(`/api/submissions/${submissionId}/transcript`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, verdict })
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Interview Verification</h2>

        {!isComplete ? (
          <>
            <p className="mb-4 text-gray-700">
              Please verify your understanding by answering a few questions about your submission.
            </p>

            {!client && token && (
              <button
                onClick={connect}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Start Interview
              </button>
            )}

            {client && (
              <>
                <Mic state={micState} client={client} onError={() => {}} />

                <div className="mt-4 border rounded p-4 max-h-64 overflow-y-auto">
                  {transcript.map((msg, i) => (
                    <div key={i} className={`mb-3 ${msg.role === 'user' ? 'text-blue-700' : 'text-gray-800'}`}>
                      <strong>{msg.role === 'user' ? 'You' : 'Interviewer'}:</strong> {msg.content}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div>
            <p className="text-green-700 mb-4">✓ Interview complete. Your response has been recorded.</p>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
