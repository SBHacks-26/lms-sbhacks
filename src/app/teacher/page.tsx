'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { AssignmentForm } from '@/components/assignments/AssignmentForm';

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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Assignment</h2>
        <AssignmentForm teacherId={user?.id || ''} onSuccess={refreshAssignments} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Assignments</h2>
        <div className="space-y-4">
          {assignments.map((assignment: any) => (
            <div key={assignment._id} className="border p-4 rounded">
              <h3 className="font-semibold">{assignment.title}</h3>
              <p className="text-sm text-gray-600">
                Created: {new Date(assignment.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
