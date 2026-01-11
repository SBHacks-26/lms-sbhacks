import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ModifiedAssignment from '../../../../../../db/modifiedAssignment';
import { retrievePdfFile, fileExists } from '@/lib/fileStorage';
import { join } from 'path';

/**
 * Download the trapped PDF for an assignment
 * GET /api/assignments/[id]/download-pdf
 * 
 * This endpoint serves the modified PDF with hidden traps that students download.
 * The PDF looks identical to the original but contains modifications that will
 * be detected if students paste it into AI chatbots.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('[DownloadPDF] Requesting PDF for assignment:', id);

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

    // Find the modified assignment by assignmentId
    const modifiedAssignment = await ModifiedAssignment.findOne({
      assignmentId: id
    }).populate('assignmentId');

    if (!modifiedAssignment) {
      console.error('[DownloadPDF] Modified assignment not found for assignment:', id);
      return NextResponse.json(
        { error: 'Assignment PDF not found or not yet generated' },
        { status: 404 }
      );
    }

    // Check if PDF generation is completed
    if (modifiedAssignment.pdfGenerationStatus !== 'completed') {
      return NextResponse.json(
        { error: 'PDF is still being generated. Please try again later.' },
        { status: 202 }
      );
    }

    const pdfUrl = modifiedAssignment.modifiedPdfUrl;

    if (!pdfUrl) {
      return NextResponse.json(
        { error: 'PDF URL not found' },
        { status: 404 }
      );
    }

    // Handle different PDF URL types:
    // 1. Local file path (relative or absolute)
    // 2. URL (external or API endpoint)
    // 3. Base64 encoded data

    let pdfBuffer: Buffer;

    // Check if it's a local file path
    if (pdfUrl.startsWith('/') || pdfUrl.startsWith('./') || !pdfUrl.startsWith('http')) {
      // Local file path
      const filePath = pdfUrl.startsWith('/') 
        ? pdfUrl 
        : join(process.cwd(), pdfUrl);

      const exists = await fileExists(filePath);
      if (!exists) {
        console.error('[DownloadPDF] PDF file not found at path:', filePath);
        return NextResponse.json(
          { error: 'PDF file not found on server' },
          { status: 404 }
        );
      }

      pdfBuffer = await retrievePdfFile(filePath);
    } else if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
      // External URL - fetch the PDF
      try {
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        pdfBuffer = Buffer.from(arrayBuffer);
      } catch (error) {
        console.error('[DownloadPDF] Error fetching PDF from URL:', error);
        return NextResponse.json(
          { error: 'Failed to fetch PDF from URL' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid PDF URL format' },
        { status: 400 }
      );
    }

    // Generate filename for download
    const assignment = modifiedAssignment.assignmentId;
    const assignmentTitle = (assignment as any)?.title || 'assignment';
    const safeTitle = assignmentTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const filename = `${safeTitle}-${id}.pdf`;

    console.log('[DownloadPDF] Success, PDF size:', pdfBuffer.length, 'bytes');

    // Return PDF file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[DownloadPDF] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to download PDF',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
