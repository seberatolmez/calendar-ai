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

export async function parseEventFromPrompt(rawText: String){

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
        "attendees": [{"email": string}][],
        "reminders": {
        "useDefault": boolean,
        "overrides": [{"method": string, "minutes": number}][]
        }
    }

    If any detail is missing or cannot be determined from the input, use sensible defaults or leave them empty.
    
    provide only the JSON object as output without any additional text or explanation.`

    try {   

        const response = await model.generateContent(prompt);
        console.log('AI Response:', response); // to test 
    } catch (error) {

        console.error('Error generating content:', error);
        throw new Error('Failed to generate content from AI model');
    }


}