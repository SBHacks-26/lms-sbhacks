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

  if (loading) return <div className="p-6">Loading...</div>;
  if (!assignment) return <div className="p-6">Assignment not found</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{assignment.title}</h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Assignment PDF</h2>
        <PDFViewer pdfBase64={pdfBase64} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Submit Your Response</h2>
        <SubmissionForm
          assignmentId={params.id as string}
          studentId={user?.id || ''}
        />
      </div>
    </div>
  );
}
