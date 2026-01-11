'use client';

import { useState } from 'react';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testConnection = async () => {
    setLoading(true);
    setError('');
    setStatus(null);

    try {
      const response = await fetch('/api/health');
      const data = await response.json();

      if (response.ok) {
        setStatus(data);
      } else {
        setError(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">API connection check</h1>

      <button
        onClick={testConnection}
        disabled={loading}
        className="bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Testing, please wait...' : 'Test connection now'}
      </button>

      {status && (
        <div className="mt-6 border border-border bg-secondary/10 p-4">
          <h2 className="mb-2 font-bold text-foreground">✓ Connection works</h2>
          <pre className="overflow-auto text-sm">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="mt-6 border border-border bg-destructive/10 p-4">
          <h2 className="mb-2 font-bold text-destructive">✗ Connection failed</h2>
          <pre className="overflow-auto text-sm text-destructive">
            {error}
          </pre>
        </div>
      )}

      <div className="mt-8 border border-border bg-card p-4">
        <h3 className="mb-2 font-semibold">What this checks</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Next.js server is running</li>
          <li>Flask API runs on port 5000</li>
          <li>CORS is set up correctly</li>
          <li>Environment variables are present</li>
          <li>Network connectivity between services</li>
        </ul>
      </div>
    </div>
  );
}
