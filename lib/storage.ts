import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import crypto from 'crypto';

const uploadsDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export function generatePublicId(): string {
  return crypto.randomBytes(4).toString('hex'); // 8 character random hex string e.g. 8f72a91c
}

export async function savePdfFile(fileBuffer: Buffer, originalFilename: string): Promise<{
  storagePath: string;
  fileSize: number;
  pageCount: number;
}> {
  const fileExt = path.extname(originalFilename) || '.pdf';
  const uniqueName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${fileExt}`;
  const fullPath = path.join(uploadsDir, uniqueName);

  fs.writeFileSync(fullPath, fileBuffer);

  let pageCount = 1;
  try {
    const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
    pageCount = pdfDoc.getPageCount();
  } catch (err) {
    console.warn('Could not parse PDF page count:', err);
  }

  return {
    storagePath: uniqueName,
    fileSize: fileBuffer.length,
    pageCount,
  };
}

export function deletePdfFile(storagePath: string): void {
  const fullPath = path.join(uploadsDir, storagePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

export function getPdfFilePath(storagePath: string): string {
  return path.join(uploadsDir, storagePath);
}

export function pdfFileExists(storagePath: string): boolean {
  return fs.existsSync(path.join(uploadsDir, storagePath));
}
