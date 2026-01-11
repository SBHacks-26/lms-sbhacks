'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TeacherDashboard() {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ totalAssignments: 0, totalSubmissions: 0, pendingReviews: 0 });

  useEffect(() => {
    if (!user) return;
    
    fetch(`/api/courses?teacherId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setCourses(data.courses || []);
        setStats(data.stats || stats);
      });
  }, [user]);

  return (
    <div className="mx-auto max-w-6xl p-6 text-foreground">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold leading-tight">Teacher Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your courses, assignments, and keep track of student work.</p>
        </div>
        <Button asChild variant="outline" className="h-10 border-border bg-white px-4 text-sm font-semibold text-foreground hover:bg-muted">
          <Link href="/">Back to home</Link>
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Active courses</p>
          <p className="mono-emph text-3xl font-semibold text-foreground">{courses.length}</p>
          <p className="text-xs text-foreground">This semester</p>
        </div>
        <div className="border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total assignments</p>
          <p className="mono-emph text-3xl font-semibold text-secondary">{stats.totalAssignments}</p>
          <p className="text-xs text-foreground">Across all classes</p>
        </div>
        <div className="border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Pending reviews</p>
          <p className="mono-emph text-3xl font-semibold text-destructive">{stats.pendingReviews}</p>
          <p className="text-xs text-foreground">Need attention</p>
        </div>
      </div>

      <div className="border border-border bg-white px-5 py-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your classes</h2>
          <Button asChild className="h-9 bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Link href="/teacher/classes">View all classes</Link>
          </Button>
        </div>

        <div className="space-y-3">
          {courses.slice(0, 4).map((course: any) => (
            <Link
              key={course._id}
              href={`/teacher/classes/${course._id}`}
              className="flex items-center justify-between border border-border bg-card px-4 py-3 transition hover:bg-muted"
            >
              <div>
                <h3 className="font-semibold">{course.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {course.code} • {course.studentCount || 0} students
                </p>
              </div>
              <span className="text-xs font-semibold text-secondary">{course.assignmentCount || 0} assignments</span>
            </Link>
          ))}
          
          {courses.length === 0 && (
            <div className="border border-dashed border-border bg-card px-4 py-6 text-sm text-muted-foreground">
              No classes yet. Sample data will be loaded when you run the seed script.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
