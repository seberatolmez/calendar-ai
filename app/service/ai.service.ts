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

function formatDateTimeInZone(date: Date, timeZone: string): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value || '';
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;
}

export async function parseEventFromPrompt(rawText: string, userTimeZone?: string, userNowISO?: string){

    const nowForPrompt = userNowISO || new Date().toISOString();
    const tzForPrompt = userTimeZone || 'UTC';
    const prompt= `You are an expert calendar assistant. 
    Your task is to extract event details from user input 
    and format them into a structured JSON object suitable with calendar_v3.Schema$Event for create and update operations on event.

    Here is the user input: "${rawText}"
    User's IANA time zone: "${tzForPrompt}"
    Current date-time in user's time zone: "${nowForPrompt}"
    
    Extract the following details if avaliable as a JSON object:
   {
      "summary": string,
      "location": string,
      "description": string,
      "start": {
      "dateTime": string (YYYY-MM-DDTHH:mm:ss, interpreted in timeZone),
      "timeZone": string (MUST be the provided user's IANA time zone)
        },
        "end": {
        "dateTime": string (YYYY-MM-DDTHH:mm:ss, interpreted in timeZone),
        "timeZone": string (MUST be the provided user's IANA time zone)
        },
        "recurrence": string[],
        "attendees": [{"email": string}],
        "reminders": {
        "useDefault": boolean,
        "overrides": [{"method": string, "minutes": number}][]
        }
    }

    If any detail is missing or cannot be determined from the input, use sensible defaults or leave them empty.
    CRITICAL RULES:
    - All times MUST be interpreted in the user's time zone above, not UTC.
    - Do NOT append a trailing 'Z' to dateTime. Provide local wall-clock time and set timeZone accordingly.
    - If input includes words like "today", "tomorrow", "evening", resolve them using the user's time zone.
    
    Output only the JSON object without any additional text, explanation, or code fences.`

    try {   

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleaned = sanitizePotentialJson(text);
        try {
            const parsed = JSON.parse(cleaned);

            // Helpers for robust parsing/normalization
            const hasOffset = (s: string) => /[zZ]|[+-]\d\d:?\d\d$/.test(s);
            const parseParts = (s: string) => {
                const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
                if (!m) return null;
                return {
                    y: Number(m[1]),
                    mo: Number(m[2]),
                    d: Number(m[3]),
                    h: Number(m[4]),
                    mi: Number(m[5]),
                    s: Number(m[6] || 0),
                };
            };
            const fromUtcLocalString = (localIsoNoOffset: string): Date | null => {
                const p = parseParts(localIsoNoOffset);
                if (!p) return null;
                return new Date(Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s));
            };

            // Normalize to user's time zone if provided
            if (userTimeZone && parsed) {
                if (parsed.start?.dateTime) {
                    const dt: string = parsed.start.dateTime;
                    const srcTz: string | undefined = parsed.start.timeZone;
                    let instant: Date | null = null;
                    if (hasOffset(dt)) {
                        instant = new Date(dt);
                    } else if (srcTz === 'UTC') {
                        // Interpret naive string as UTC
                        instant = fromUtcLocalString(dt);
                    }

                    if (instant) {
                        parsed.start.dateTime = formatDateTimeInZone(instant, userTimeZone);
                        parsed.start.timeZone = userTimeZone;
                    } else {
                        // Fallback: keep wall-clock time but ensure timeZone is user's TZ
                        parsed.start.timeZone = userTimeZone;
                    }
                }
                if (parsed.end?.dateTime) {
                    const dt: string = parsed.end.dateTime;
                    const srcTz: string | undefined = parsed.end.timeZone;
                    let instant: Date | null = null;
                    if (hasOffset(dt)) {
                        instant = new Date(dt);
                    } else if (srcTz === 'UTC') {
                        instant = fromUtcLocalString(dt);
                    }
                    if (instant) {
                        parsed.end.dateTime = formatDateTimeInZone(instant, userTimeZone);
                        parsed.end.timeZone = userTimeZone;
                    } else {
                        parsed.end.timeZone = userTimeZone;
                    }
                }
            }

            return parsed;
        } catch {
            throw new InvalidAIJsonError(cleaned);
        }
        
    } catch (error) {

        console.error('Error generating content:', error);
        throw new Error('Failed to generate content from AI model');
    }

}