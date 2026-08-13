import fs from 'fs';
import path from 'path';
import os from 'os';
import { PDFDocument } from 'pdf-lib';
import crypto from 'crypto';

function getWritableUploadsDir(): string {
  try {
    const localPath = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(localPath)) {
      fs.mkdirSync(localPath, { recursive: true });
    }
    const testFile = path.join(localPath, '.write_test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return localPath;
  } catch (e) {
    const tmpPath = path.join(os.tmpdir(), 'uploads');
    if (!fs.existsSync(tmpPath)) {
      fs.mkdirSync(tmpPath, { recursive: true });
    }
    return tmpPath;
  }
}

const uploadsDir = getWritableUploadsDir();

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
  
  // Save to disk
  try {
    const fullPath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(fullPath, fileBuffer);
  } catch (e) {}

  let pageCount = 1;
  try {
    const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
    pageCount = pdfDoc.getPageCount();
  } catch (err) {
    console.warn('Could not parse PDF page count:', err);
    pageCount = 1;
  }

  // Store base64 data string format so file is never lost across Vercel ephemeral instances
  const base64Data = `data:application/pdf;base64,${fileBuffer.toString('base64')}`;
  const storagePath = `${uniqueName}|||${base64Data}`;

  return {
    storagePath,
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
  try {
    const urlObj = new URL(cleanUrl);
    let filename = path.basename(urlObj.pathname);
    if (!filename || !filename.toLowerCase().endsWith('.pdf')) {
      filename = `documento-${generatePublicId()}.pdf`;
    }
    return savePdfFile(buffer, filename);
  } catch (e) {
    return savePdfFile(buffer, `documento-${generatePublicId()}.pdf`);
  }
}

export function deletePdfFile(storagePath: string): void {
  const cleanName = storagePath.split('|||')[0];
  const fullPath = path.join(uploadsDir, cleanName);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (e) {}
  }
}

export function getPdfFilePath(storagePath: string): string {
  const cleanName = storagePath.split('|||')[0];
  return path.join(uploadsDir, cleanName);
}

export function pdfFileExists(storagePath: string): boolean {
  if (storagePath.includes('|||data:application/pdf;base64,')) {
    return true;
  }
  const cleanName = storagePath.split('|||')[0];
  return fs.existsSync(path.join(uploadsDir, cleanName));
}
