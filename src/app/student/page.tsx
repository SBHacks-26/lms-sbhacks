'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetch('/api/assignments')
      .then(res => res.json())
      .then(data => setAssignments(data.assignments));
  }, []);

  return (
    <div className="mx-auto max-w-6xl p-6 text-foreground">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold leading-tight">Student Dashboard</h1>
          <p className="text-sm text-muted-foreground">See your coursework, submit on time, and stay calm.</p>
        </div>
        <Button asChild variant="outline" className="h-10 border-border bg-white px-4 text-sm font-semibold text-foreground hover:bg-muted">
          <Link href="/">Back to home</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {assignments.map((assignment: any) => (
          <Link
            key={assignment._id}
            href={`/student/${assignment._id}`}
            className="flex items-center justify-between border border-border bg-white px-4 py-3 transition hover:bg-muted"
          >
            <div>
              <h3 className="text-lg font-semibold">{assignment.title}</h3>
              <p className="text-xs text-muted-foreground">
                Assigned: {new Date(assignment.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className="text-xs font-semibold text-secondary">Open</span>
          </Link>
        ))}
        {assignments.length === 0 && (
          <div className="border border-dashed border-border bg-card px-4 py-6 text-sm text-muted-foreground">
            No assignments yet. Your courses will appear here soon, do not worry.
          </div>
        )}
      </div>
    </div>
  );
}
