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
  originalFilename: string;
}> {
  const fileExt = path.extname(originalFilename) || '.pdf';
  const cleanBaseName = path.basename(originalFilename, fileExt).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueName = `${cleanBaseName}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${fileExt}`;
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
    originalFilename,
  };
}

export async function downloadAndSavePdfFromUrl(pdfUrl: string): Promise<{
  storagePath: string;
  fileSize: number;
  pageCount: number;
  originalFilename: string;
}> {
  let cleanUrl = pdfUrl.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  const response = await fetch(cleanUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Não foi possível baixar o PDF da URL fornecida (HTTP status ${response.status}).`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length < 10) {
    throw new Error('O arquivo obtido da URL está vazio ou corrompido.');
  }

  // Extract filename from URL path
  const urlObj = new URL(cleanUrl);
  let filename = path.basename(urlObj.pathname);
  if (!filename || !filename.toLowerCase().endsWith('.pdf')) {
    filename = `documento-${generatePublicId()}.pdf`;
  }

  return savePdfFile(buffer, filename);
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
