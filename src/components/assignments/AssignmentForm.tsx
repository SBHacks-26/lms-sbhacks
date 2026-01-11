'use client';

import { useState } from 'react';

interface AssignmentFormProps {
  teacherId: string;
  onSuccess?: () => void;
}

export function AssignmentForm({ teacherId, onSuccess }: AssignmentFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('Submitting assignment:', { title, contentLength: content.length });

      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, teacherId })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Assignment created:', data.assignmentId);
        setMessage('✓ Assignment created successfully!');
        setTitle('');
        setContent('');
        onSuccess?.();
      } else {
        console.error('Assignment creation failed:', data);
        // Show detailed error including hint
        const errorMsg = data.hint
          ? `${data.error}\n${data.hint}\nDetails: ${data.details}`
          : `${data.error}\nDetails: ${data.details || 'Unknown error'}`;
        setMessage(errorMsg);
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessage('Network error: ' + error + '\n\nMake sure both Next.js and Flask servers are running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-2 font-medium">Assignment Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full p-2 border rounded"
          placeholder="Essay on Climate Change"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Assignment Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={8}
          className="w-full p-2 border rounded"
          placeholder="Write a 500 word essay about..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Assignment'}
      </button>

      {message && (
        <div className={`p-3 rounded ${message.includes('Error') || message.includes('error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          <pre className="whitespace-pre-wrap text-sm font-sans">{message}</pre>
        </div>
      )}
    </form>
  );
}
