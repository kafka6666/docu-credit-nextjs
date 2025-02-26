// utils/pdfProcessor.ts
import { createWorker } from 'tesseract.js';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Extract text from PDF using OCR
async function extractTextFromPDF(fileBuffer: ArrayBuffer): Promise<string> {
  try {
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: fileBuffer });
    const pdf = await loadingTask.promise;
    
    // Create Tesseract worker for OCR
    const worker = await createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    let fullText = '';
    
    // Process each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
      
      // Render the page to a canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error("Could not get canvas context");
      }
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // Convert canvas to image data for OCR
      const imageData = canvas.toDataURL('image/png');
      
      // Perform OCR on the image
      const { data: { text } } = await worker.recognize(imageData);
      fullText += text + '\n\n';
    }
    
    await worker.terminate();
    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

// Generate PDF from structured documentary credit
async function generateDocumentaryCredit(
  structuredData: string, 
  swiftMT700: string
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.create();
    
    // Create first page - Structured Documentary Credit
    let page = pdfDoc.addPage([612, 792]); // US Letter size
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    
    // Helper function to draw text
    const drawText = (
      text: string, 
      x: number, 
      y: number, 
      options: { 
        font?: typeof font, 
        size?: number, 
        color?: typeof rgb
      } = {}
    ) => {
      page.drawText(text, {
        x,
        y: page.getHeight() - y,
        font: options.font || font,
        size: options.size || 10,
      });
    };
    
    // Draw title for structured data
    drawText('DOCUMENTARY CREDIT DRAFT (UCP 600)', 180, 50, { font: boldFont, size: 14 });
    
    // Parse structured data
    const lines = structuredData.split('\n');
    let yPosition = 80;
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      // Check if we need to add a new page
      if (yPosition > page.getHeight() - 50) {
        page = pdfDoc.addPage([612, 792]);
        yPosition = 50;
      }
      
      // Check if this is a section header
      if (/^\d+\./.test(line)) {
        yPosition += 10; // Add extra space before new section
        drawText(line, 50, yPosition, { font: boldFont });
      } else {
        drawText(line, 70, yPosition);
      }
      
      yPosition += 15;
    }
    
    // Add Swift MT 700 page
    page = pdfDoc.addPage([612, 792]);
    yPosition = 50;
    
    // Draw title for SWIFT MT 700
    drawText('SWIFT MT 700 FORMAT', 220, yPosition, { font: boldFont, size: 14 });
    yPosition += 30;
    
    // Parse SWIFT MT 700 data
    const swiftLines = swiftMT700.split('\n');
    
    for (const line of swiftLines) {
      if (line.trim() === '') continue;
      
      // Check if we need to add a new page
      if (yPosition > page.getHeight() - 50) {
        page = pdfDoc.addPage([612, 792]);
        yPosition = 50;
      }
      
      // Format SWIFT fields (field tags usually start with a colon)
      if (line.trim().startsWith(':')) {
        drawText(line, 50, yPosition, { font: boldFont });
      } else {
        drawText(line, 70, yPosition);
      }
      
      yPosition += 15;
    }
    
    // Add footer
    const lastPage = pdfDoc.getPage(pdfDoc.getPageCount() - 1);
    lastPage.drawText('This Documentary Credit is subject to UCP 600', {
      x: 180,
      y: 30,
      font,
      size: 10
    });
    
    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate documentary credit PDF");
  }
}

export {
  extractTextFromPDF,
  generateDocumentaryCredit}