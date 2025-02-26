import {GoogleGenerativeAI} from "@google/generative-ai";


export async function processDocumentaryCredit(extractedText: string): Promise<string> {

    try {
        // Initialize Google Generative AI from environment variable
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({model: "models/gemini-1.5-flash"});

        // Define the system prompt for the model
        const systemPrompt = `
        You are an expert in international trade finance, specializing in documentary credits under UCP 600 rules.
        
        Analyze the provided text extracted from a documentary credit document and structure it into a valid documentary credit draft following UCP 600 guidelines.
        
        Use the following structured format:
        
        1. DOCUMENTARY CREDIT NUMBER
        2. DATE OF ISSUE
        3. APPLICANT (Name and Address)
        4. BENEFICIARY (Name and Address)
        5. CURRENCY AND AMOUNT
        6. TYPE OF CREDIT (e.g., Irrevocable)
        7. AVAILABLE WITH (Nominated Bank)
        8. BY (Payment method - e.g., Sight Payment, Acceptance, Deferred Payment)
        9. DRAFTS AT (Terms)
        10. LATEST DATE OF SHIPMENT
        11. SHIPMENT FROM/TO
        12. DESCRIPTION OF GOODS
        13. DOCUMENTS REQUIRED (List all required documents)
        14. ADDITIONAL CONDITIONS
        15. CHARGES
        16. PERIOD FOR PRESENTATION
        17. CONFIRMATION INSTRUCTIONS
        18. REIMBURSEMENT INSTRUCTIONS
        19. SPECIAL INSTRUCTIONS
        
        Format all information exactly according to UCP 600 standards. If any element is unclear or missing from the provided text, indicate this with "NOT SPECIFIED" rather than making assumptions.
        
        Return ONLY the structured documentary credit draft without any additional explanations.
    `;

        // Combine the system prompt with the extracted text
        const prompt = `${systemPrompt}\n\nAnalyze the following text:\n${extractedText}`;

        // Generate the document and return it as a string
        const result = await model.generateContent([prompt]);
        return result.response.text();
    } catch (error) {
        console.error("Error calling Google Generative AI API:", error);
        throw new Error("Failed to process documentary credit with Google Generative AI API");
    }
}