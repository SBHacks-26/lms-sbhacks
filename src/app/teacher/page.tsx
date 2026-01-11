'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AssignmentForm } from '@/components/assignments/AssignmentForm';
import { Button } from '@/components/ui/button';

export default function TeacherDashboard() {
  const { user } = useUser();
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetch('/api/assignments')
      .then(res => res.json())
      .then(data => setAssignments(data.assignments));
  }, []);

  const refreshAssignments = () => {
    fetch('/api/assignments')
      .then(res => res.json())
      .then(data => setAssignments(data.assignments));
  };

  return (
    <div className="mx-auto max-w-6xl p-6 text-foreground">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold leading-tight">Teacher Dashboard</h1>
          <p className="text-sm text-muted-foreground">Assign work, watch submissions, and follow up when something feels off.</p>
        </div>
        <Button asChild variant="outline" className="h-10 border-border bg-white px-4 text-sm font-semibold text-foreground hover:bg-muted">
          <Link href="/">Back to home</Link>
        </Button>
      </div>

      <div className="mb-8 border border-border bg-white px-5 py-4 shadow-sm">
        <h2 className="text-lg font-semibold">Create a new assignment</h2>
        <p className="text-xs text-muted-foreground">Students see new items right away, so keep it clear.</p>
        <div className="mt-4">
          <AssignmentForm teacherId={user?.id || ''} onSuccess={refreshAssignments} />
        </div>
      </div>

      <div className="border border-border bg-white px-5 py-4 shadow-sm">
        <h2 className="text-lg font-semibold">Your assignments</h2>
        <div className="mt-4 space-y-3">
          {assignments.map((assignment: any) => (
            <div key={assignment._id} className="border border-border bg-card px-4 py-3">
              <h3 className="font-semibold">{assignment.title}</h3>
              <p className="text-xs text-muted-foreground">
                Created: {new Date(assignment.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
          {assignments.length === 0 && (
            <div className="border border-dashed border-border bg-card px-4 py-6 text-sm text-muted-foreground">
              No assignments yet. Create one to get started, it is simple.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
