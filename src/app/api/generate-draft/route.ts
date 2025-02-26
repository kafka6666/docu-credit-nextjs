// app/api/generate-draft/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processDocumentaryCredit } from '@/utils/googleService';
import { generateDocumentaryCredit } from '@/utils/textFromPDF';

interface RequestBody {
  extractedText: string;
}

export async function POST(request: NextRequest) {
  try {
    const { extractedText } = await request.json() as RequestBody;
    
    if (!extractedText) {
      return NextResponse.json(
        { message: 'No extracted text provided' },
        { status: 400 }
      );
    }
    
    // Process with Claude API
    const { structuredData, swiftMT700 } = await processDocumentaryCredit(extractedText);
    
    // Generate PDF bytes
    const pdfBytes = await generateDocumentaryCredit(structuredData, swiftMT700);
    
    // Return structured data, SWIFT MT 700, and PDF bytes as base64
    return NextResponse.json({
      structuredData,
      swiftMT700,
      pdfBase64: Buffer.from(pdfBytes).toString('base64')
    });
  } catch (error: any) {
    console.error('Error generating documentary credit draft:', error);
    return NextResponse.json(
      { message: 'Failed to generate documentary credit draft', error: error.message },
      { status: 500 }
    );
  }
}

// export const config = {
//   runtime: 'edge',
//   unstable_allowDynamic: [
//     // Allow dynamic imports
//     '**/node_modules/@anthropic-ai/sdk/**',
//     '**/node_modules/pdf-lib/**',
//   ],
// };