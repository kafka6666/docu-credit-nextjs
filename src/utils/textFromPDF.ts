import { GoogleGenerativeAI } from "@google/generative-ai";

export async function extractTextFromPDF(bufferedFile: ArrayBuffer): Promise<string> {
    // Initialize Google Generative AI from environment variable
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

    // Generate content from the PDF file provided as a URL
    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(bufferedFile).toString("base64"),
                mimeType: "application/pdf",
            },
        },
        'Provide the content of the document in text format',
    ]);
    return result.response.text();
}