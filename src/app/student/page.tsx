'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetch('/api/assignments')
      .then(res => res.json())
      .then(data => setAssignments(data.assignments));
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

      <div className="space-y-4">
        {assignments.map((assignment: any) => (
          <Link
            key={assignment._id}
            href={`/student/${assignment._id}`}
            className="block border p-4 rounded hover:bg-gray-50"
          >
            <h3 className="font-semibold text-lg">{assignment.title}</h3>
            <p className="text-sm text-gray-600">
              Assigned: {new Date(assignment.createdAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
