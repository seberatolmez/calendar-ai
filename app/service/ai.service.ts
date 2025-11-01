// ai service for parsing prompts/ prompt engineering

import {GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const model= genAI.getGenerativeModel({ model: 'gemini-2.0-flash',
    tools: [
        {
            codeExecution: {}, // enable code execution tool
        }
    ]

 }); 

export class InvalidAIJsonError extends Error {
    raw: string;
    constructor(raw: string) {
        super('Invalid JSON from AI');
        this.raw = raw;
        this.name = 'InvalidAIJsonError';
    }
}

function sanitizePotentialJson(text: string): string {
    const trimmed = text.trim();
    if (trimmed.startsWith('```')) {
        // Remove ```json or ``` and trailing ```
        return trimmed.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
    }
    return trimmed;
}

export async function parseEventFromPrompt(rawText: string){

    const prompt= `You are an expert calendar assistant. 
    Your task is to extract event details from user input 
    and format them into a structured JSON object suitable with calendar_v3.Schema$Event for create and update operations on event.

    Here is the user input: "${rawText}"
    
    Extract the following details if avaliable as a JSON object:
   {
      "summary": string,
      "location": string,
      "description": string,
      "start": {
        "dateTime": string (in ISO 8601 format),
        "timeZone": string
        },
        "end": {
        "dateTime": string (in ISO 8601 format),
        "timeZone": string
        },
        "recurrence": string[],
        "attendees": [{"email": string}],
        "reminders": {
        "useDefault": boolean,
        "overrides": [{"method": string, "minutes": number}][]
        }
    }

    If any detail is missing or cannot be determined from the input, use sensible defaults or leave them empty.
    
    Output only the JSON object without any additional text, explanation, or code fences.`

    try {   

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleaned = sanitizePotentialJson(text);
        try {
            const parsed = JSON.parse(cleaned);
            return parsed;
        } catch {
            throw new InvalidAIJsonError(cleaned);
        }
        
    } catch (error) {

        console.error('Error generating content:', error);
        throw new Error('Failed to generate content from AI model');
    }

}