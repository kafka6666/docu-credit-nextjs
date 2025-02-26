// app/api/extract-text/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/utils/textFromPDF';

export async function POST(request: NextRequest) {
  try {
    // Get the PDF file from the request
    const formData = await request.formData();
    const pdfFile = formData.get('pdfFile') as File | null;
    
    // Check whether a pdf file was provided
    if (!pdfFile) {
      return NextResponse.json(
        { message: 'No PDF file provided' },
        { status: 400 }
      );
    }
    
    // Convert file to buffer
    const fileBuffer = await pdfFile.arrayBuffer();
    
    // Extract text using Google Gemini AI OCR
    const extractedText = await extractTextFromPDF(fileBuffer);
    
    return NextResponse.json({ extractedText });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { message: 'Failed to extract text from PDF', error },
      { status: 500 }
    );
  }
}

// For Next.js App Router
// export const config = {
//   runtime: 'edge',
//   unstable_allowDynamic: [
//     // Allow dynamic imports from tesseract.js
//     '**/node_modules/tesseract.js/**',
//     '**/node_modules/pdfjs-dist/**',
//   ],
// };