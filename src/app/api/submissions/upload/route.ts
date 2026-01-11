import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Submission from '../../../../../db/submission';
import Assignment from '../../../../../db/assignment';
import { 
  storePdfFile, 
  generateUniqueFilename, 
  generateFileHash,
  getFileUrl,
  SUBMISSIONS_DIR 
} from '@/lib/fileStorage';
import PDFParser from 'pdf2json';

/**
 * Upload student submission PDF
 * POST /api/submissions/upload
 * 
 * Accepts a PDF file upload and creates/updates a Submission record.
 * The PDF is stored and text is extracted for analysis.
 * 
 * Request body (FormData):
 * - file: PDF file
 * - assignmentId: Assignment ID
 * - studentId: Student ID
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const assignmentId = formData.get('assignmentId') as string;
    const studentId = formData.get('studentId') as string;

    console.log('[UploadSubmission] Received upload request:', {
      assignmentId,
      studentId,
      fileName: file?.name,
      fileSize: file?.size
    });

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!assignmentId || !studentId) {
      return NextResponse.json(
        { error: 'assignmentId and studentId are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds maximum limit of 10MB' },
        { status: 400 }
      );
    }

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
      if (!mongoUri) {
        return NextResponse.json(
          { error: 'MongoDB connection string not configured' },
          { status: 500 }
        );
      }
      await mongoose.connect(mongoUri);
    }

    // Verify assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Get teacherId from assignment (already a Clerk user ID string)
    const teacherId = (assignment as any).professorId;
    
    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID not found for this assignment' },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Generate file hash for verification
    const fileHash = generateFileHash(fileBuffer);

    // Store PDF file
    const filename = generateUniqueFilename('submission', 'pdf');
    const filePath = await storePdfFile(fileBuffer, filename, SUBMISSIONS_DIR);
    const fileUrl = getFileUrl(filePath);

    console.log('[UploadSubmission] File stored:', fileUrl);

    // Extract text from PDF for analysis
    let extractedText = '';
    try {
      // Create temporary file for PDF parser
      const tempPath = `/tmp/${filename}`;
      const fs = await import('fs/promises');
      await fs.writeFile(tempPath, fileBuffer);

      // Parse PDF to extract text
      const pdfParser = new (PDFParser as any)(null, 1);
      
      const textPromise = new Promise<string>((resolve, reject) => {
        pdfParser.on('pdfParser_dataError', (errData: any) => {
          console.error('[UploadSubmission] PDF parser error:', errData.parserError);
          reject(new Error('Failed to parse PDF'));
        });

        pdfParser.on('pdfParser_dataReady', () => {
          try {
            const text = (pdfParser as any).getRawTextContent();
            resolve(text || '');
          } catch (error) {
            reject(error);
          }
        });

        pdfParser.loadPDF(tempPath);
      });

      extractedText = await textPromise;

      // Clean up temporary file
      await fs.unlink(tempPath).catch(() => {
        // Ignore errors when cleaning up
      });

      console.log('[UploadSubmission] Text extracted, length:', extractedText.length);
    } catch (error) {
      console.error('[UploadSubmission] Error extracting text from PDF:', error);
      // Continue even if text extraction fails - file is still uploaded
    }

    // Check if submission already exists
    let submission = await Submission.findOne({
      assignmentId: assignmentId,
      studentId: studentId
    });

    if (submission) {
      // Update existing submission
      submission.submittedFileUrl = fileUrl;
      submission.submittedText = extractedText;
      submission.submittedAt = new Date();
      submission.status = 'submitted';
      submission.updatedAt = new Date();
      await submission.save();
      console.log('[UploadSubmission] Updated existing submission:', submission._id);
    } else {
      // Create new submission
      submission = await Submission.create({
        assignmentId: assignmentId,
        studentId: studentId,
        teacherId: teacherId,
        submittedFileUrl: fileUrl,
        submittedText: extractedText,
        status: 'submitted'
      });
      console.log('[UploadSubmission] Created new submission:', submission._id);
    }

    return NextResponse.json({
      success: true,
      submissionId: submission._id.toString(),
      fileUrl: fileUrl,
      fileHash: fileHash,
      textExtracted: extractedText.length > 0,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('[UploadSubmission] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload submission',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
