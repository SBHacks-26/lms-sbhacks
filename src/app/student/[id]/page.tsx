'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { PDFViewer } from '@/components/assignments/PDFViewer';
import { SubmissionForm } from '@/components/assignments/SubmissionForm';

export default function AssignmentView() {
  const params = useParams();
  const { user } = useUser();
  const [assignment, setAssignment] = useState<any>(null);
  const [pdfBase64, setPdfBase64] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id || !user) return;

    // Fetch assignment
    fetch(`/api/assignments`)
      .then(res => res.json())
      .then(data => {
        const found = data.assignments.find((a: any) => a._id === params.id);
        setAssignment(found);
      });

    // Fetch PDF
    fetch(`/api/assignments/${params.id}/pdf?studentId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setPdfBase64(data.pdf);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading PDF:', err);
        setLoading(false);
      });
  }, [params.id, user]);

  if (loading) return <div className="p-6">Loading, one moment...</div>;
  if (!assignment) return <div className="p-6">Assignment not found, please check the link.</div>;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">{assignment.title}</h1>

      <div className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Assignment PDF</h2>
        <PDFViewer pdfBase64={pdfBase64} />
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Submit your response</h2>
        <p className="mb-3 text-sm text-muted-foreground">Share your own work, keep it clear and on time.</p>
        <SubmissionForm
          assignmentId={params.id as string}
          studentId={user?.id || ''}
        />
      </div>
    </div>
  );
}
