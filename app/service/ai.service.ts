// ai service to parsing and crud operations for calendar events

import { FunctionDeclaration, GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import *as calendarService from "./calendar.service";
import { Tool } from "ai";


const calendarTools: FunctionDeclaration[] = [   // all calendar functions 
        {
            name: 'listEvents',
            description: 'list upcoming events from user primary google calendar',
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    maxResults: {
                        type: SchemaType.INTEGER,
                        description: 'maximum number of events to retrieve'
                    }
                },
                // no required if not specified, default '10'
            }
        },
        {
            name: 'createEvent',
            description: 'create a new event in user primary google calendar',
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    event : {
                        type: SchemaType.STRING,
                        description: 'event object compatible with Google Calendar API (calendar_v3.Schema$Event)',
                    }
                },
                required: ['event']
            }
        },
        {
            name: 'updateEvent',
            description: 'update an existing event in user primary google calendar',
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    eventId: {
                        type: SchemaType.STRING,
                        description: 'ID of the event to update'
                    },
                    updatedEvent: {
                        type: SchemaType.STRING,
                        description: 'updated event object compatible with Google Calendar API (calendar_v3.Schema$Event)'
                    }
                },
                required: ['eventId', 'updatedEvent']
            }
        },
        {
            name: 'deleteEvent',
            description: 'delete an event from user primary google calendar',
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    eventId: {
                        type: SchemaType.STRING,
                        description: 'ID of the event to delete'
                    }
                },
                required: ['eventId']
            }
        }
     ];

const tools = [
    {
      functionDeclarations: calendarTools
    },
]


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash', // may use gemini pro for better results later
  tools: tools
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
    // Removes “```json” or “```” wrappers
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

export async function parseEventFromPrompt(
  rawText: string,
  userTimeZone?: string,
  userNowISO?: string
) {
  const nowForPrompt = userNowISO || new Date().toISOString();
  const tzForPrompt = userTimeZone || 'UTC';

  
  const prompt = `
You are an expert calendar assistant.
Your task is to extract event details from the user's input and return a JSON object compatible with Google Calendar API (calendar_v3.Schema$Event).

User input: "${rawText}"
User's IANA time zone: "${tzForPrompt}"
Current date-time in user's time zone: "${nowForPrompt}"

Return JSON in this format:
{
  "summary": string,
  "location": string,
  "description": string,
  "start": {
    "dateTime": string (YYYY-MM-DDTHH:mm:ss, local wall time),
    "timeZone": string (MUST ALWAYS be exactly the provided user's IANA time zone, never UTC or Z)
  },
  "end": {
    "dateTime": string (YYYY-MM-DDTHH:mm:ss, local wall time),
    "timeZone": string (MUST ALWAYS be exactly the provided user's IANA time zone, never UTC or Z)
  },
  "recurrence": string[],
  "attendees": [{"email": string}],
  "reminders": {
    "useDefault": boolean,
    "overrides": [{"method": string, "minutes": number}][]
  }
}

Critical rules:
- Interpret all times in the provided user time zone (not UTC).
- Do NOT append “Z” or offsets to dateTime.
- Words like “today”, “tomorrow”, “evening” must resolve based on the user’s time zone.
- Output ONLY pure JSON, no explanation or markdown.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = sanitizePotentialJson(text);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new InvalidAIJsonError(cleaned);
    }


    if (userTimeZone) {
      if (parsed.start) parsed.start.timeZone = userTimeZone;
      if (parsed.end) parsed.end.timeZone = userTimeZone;
    }

    const normalize = (dt: string) => {
      const date = new Date(dt);
      if (isNaN(date.getTime())) return dt; 
      return formatDateTimeInZone(date, tzForPrompt);
    };

    if (parsed.start?.dateTime) {
      parsed.start.dateTime = normalize(parsed.start.dateTime);
    }
    if (parsed.end?.dateTime) {
      parsed.end.dateTime = normalize(parsed.end.dateTime);
    }

    return parsed;
  } catch (error) {
    console.error('Error generating or parsing event:', error);
    throw new Error('Failed to parse event from AI response.');
  }
}
