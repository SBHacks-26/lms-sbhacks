import { promises as fs } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

/**
 * File storage utilities for PDF files
 * Handles storing and retrieving PDF files for assignments and submissions
 */

// Storage directory (create if doesn't exist)
const UPLOADS_DIR = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');
const PDFS_DIR = join(UPLOADS_DIR, 'pdfs');
const SUBMISSIONS_DIR = join(UPLOADS_DIR, 'submissions');

/**
 * Initialize storage directories
 */
export async function initializeStorage(): Promise<void> {
  try {
    await fs.mkdir(PDFS_DIR, { recursive: true });
    await fs.mkdir(SUBMISSIONS_DIR, { recursive: true });
  } catch (error) {
    console.error('[FileStorage] Error creating directories:', error);
    throw error;
  }
}

/**
 * Generate a unique filename for PDF storage
 * @param prefix - Prefix for the filename (e.g., 'assignment', 'submission')
 * @param extension - File extension (default: 'pdf')
 * @returns Unique filename string
 */
export function generateUniqueFilename(prefix: string, extension: string = 'pdf'): string {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  return `${prefix}-${timestamp}-${randomString}.${extension}`;
}

/**
 * Store a PDF file to disk
 * @param fileBuffer - PDF file as Buffer
 * @param filename - Filename to save as
 * @param directory - Directory to save in (default: PDFS_DIR)
 * @returns Full file path where the file was saved
 */
export async function storePdfFile(
  fileBuffer: Buffer,
  filename: string,
  directory: string = PDFS_DIR
): Promise<string> {
  await initializeStorage();
  const filePath = join(directory, filename);
  await fs.writeFile(filePath, fileBuffer);
  return filePath;
}

/**
 * Retrieve a PDF file from disk
 * @param filePath - Full path to the PDF file
 * @returns PDF file as Buffer
 */
export async function retrievePdfFile(filePath: string): Promise<Buffer> {
  try {
    const buffer = await fs.readFile(filePath);
    return buffer;
  } catch (error) {
    console.error('[FileStorage] Error reading file:', filePath, error);
    throw new Error(`File not found: ${filePath}`);
  }
}

/**
 * Generate file hash for verification
 * @param fileBuffer - PDF file as Buffer
 * @returns SHA256 hash string
 */
export function generateFileHash(fileBuffer: Buffer): string {
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

/**
 * Get file URL for a stored file
 * @param filePath - Full path to the file
 * @returns Relative URL path
 */
export function getFileUrl(filePath: string): string {
  // Extract relative path from uploads directory
  const relativePath = filePath.replace(UPLOADS_DIR, '').replace(/\\/g, '/');
  return `/api/files${relativePath}`;
}

/**
 * Delete a PDF file from disk
 * @param filePath - Full path to the PDF file
 */
export async function deletePdfFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('[FileStorage] Error deleting file:', filePath, error);
    // Don't throw - file might not exist
  }
}

/**
 * Check if a file exists
 * @param filePath - Full path to the file
 * @returns Boolean indicating if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Export directory paths for use in API routes
export { PDFS_DIR, SUBMISSIONS_DIR, UPLOADS_DIR };
