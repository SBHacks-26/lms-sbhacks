'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ClassDetail() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
  });

  useEffect(() => {
    if (!params.id || !user) return;
    
    Promise.all([
      fetch(`/api/courses/${params.id}`).then(r => r.json()),
      fetch(`/api/courses/${params.id}/assignments`).then(r => r.json()),
    ]).then(([courseData, assignmentsData]) => {
      setCourse(courseData.course);
      setAssignments(assignmentsData.assignments || []);
      setLoading(false);
    }).catch(err => {
      console.error('Error loading course:', err);
      setLoading(false);
    });
  }, [params.id, user]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/courses/${params.id}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAssignment,
          teacherId: user?.id,
          courseId: params.id,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssignments([data.assignment, ...assignments]);
        setShowCreateForm(false);
        setNewAssignment({ title: '', description: '', instructions: '', dueDate: '' });
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  if (loading) return <div className="p-6">Loading class details...</div>;
  if (!course) return <div className="p-6">Class not found.</div>;

  return (
    <div className="mx-auto max-w-6xl p-6 text-foreground">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-3xl font-semibold leading-tight">{course.name}</h1>
            <span className="mono-emph bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">
              {course.code}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{course.description}</p>
        </div>
        <Button asChild variant="outline" className="h-10 border-border bg-white px-4 text-sm font-semibold text-foreground hover:bg-muted">
          <Link href="/teacher/classes">Back to classes</Link>
        </Button>
      </div>

      <div className="mb-6 border border-border bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Assignments</h2>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="h-9 bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {showCreateForm ? 'Cancel' : 'New assignment'}
          </Button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateAssignment} className="mt-4 space-y-4 border-t border-border pt-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">Title</label>
              <input
                type="text"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                required
                className="w-full border border-border bg-white px-3 py-2 text-sm"
                placeholder="Essay on climate change"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-semibold">Description</label>
              <input
                type="text"
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                className="w-full border border-border bg-white px-3 py-2 text-sm"
                placeholder="Short summary for students"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Instructions</label>
              <textarea
                value={newAssignment.instructions}
                onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })}
                required
                rows={6}
                className="w-full border border-border bg-white px-3 py-2 text-sm"
                placeholder="Write detailed instructions for the assignment..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Due date</label>
              <input
                type="datetime-local"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                required
                className="w-full border border-border bg-white px-3 py-2 text-sm"
              />
            </div>

            <Button
              type="submit"
              className="h-10 bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Create assignment
            </Button>
          </form>
        )}
      </div>

      <div className="space-y-3">
        {assignments.map((assignment: any) => (
          <div key={assignment._id} className="border border-border bg-white px-5 py-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{assignment.title}</h3>
                {assignment.description && (
                  <p className="text-sm text-muted-foreground">{assignment.description}</p>
                )}
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  <span>{assignment.submissionCount || 0} submissions</span>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                className="h-9 border-border bg-white px-4 text-sm font-semibold text-foreground hover:bg-muted"
              >
                <Link href={`/teacher/assignments/${assignment._id}`}>View details</Link>
              </Button>
            </div>
          </div>
        ))}

        {assignments.length === 0 && !showCreateForm && (
          <div className="border border-dashed border-border bg-card px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">No assignments yet. Click "New assignment" to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
