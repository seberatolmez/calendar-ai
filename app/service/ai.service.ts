// ai service to parsing and crud operations for calendar events

import { FunctionDeclaration, GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import *as calendarService from "./calendar.service";


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
                    q: {
                        type: SchemaType.STRING,
                        description: 'free-text search to find the event when ID is unknown (summary, description, location, attendees)'
                    },
                    date: {
                        type: SchemaType.STRING,
                        description: 'date of the event (YYYY-MM-DD) to narrow the search'
                    },
                    updatedEvent: {
                        type: SchemaType.STRING,
                        description: 'updated event object compatible with Google Calendar API (calendar_v3.Schema$Event)'
                    }
                },
                required: ['updatedEvent']
            }
        },
        {
            name: 'deleteEvent',
            description: 'delete an event from user primary google calendar',
            parameters:  {
              type: SchemaType.OBJECT,
              properties: {
                eventId: {
                  type: SchemaType.STRING,
                  description: 'ID of the event to delete'
                },
                q: {
                  type: SchemaType.STRING,
                  description: 'free-text search to find the event when ID is unknown (summary, description, location, attendees)'
                },
                date: {
                  type: SchemaType.STRING,
                  description: 'date of the event (YYYY-MM-DD) to narrow the search'
                }
              }
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
You are Garbi, an intelligent AI assistant that helps users manage their Google Calendar through natural language.

You can call these tools to perform operations:
1. listEvents — list upcoming events (optionally limited by number).
2. createEvent — create a new event using a Google Calendar event JSON object.
3. updateEvent — update an existing event by ID or search criteria.
4. deleteEvent — delete an event by ID or search criteria.

---

### Rules for Choosing the Correct Tool

- If the user asks to **see**, **show**, or **list** events → call **listEvents**.
- If the user asks to **add**, **schedule**, or **create** an event → call **createEvent**.
- If the user asks to **move**, **reschedule**, or **change** an event → call **updateEvent**.
- If the user asks to **cancel**, **remove**, or **delete** an event → call **deleteEvent**.
- If the input does not match any of these operations, respond with plain text.

---

### Event Creation / Update Structure

When you need to pass an event object to createEvent or updateEvent, convert the user’s description into a JSON object compatible with Google Calendar API:

{
  "summary": string,
  "location": string,
  "description": string,
  "start": {
    "dateTime": string (YYYY-MM-DDTHH:mm:ss, local wall time),
    "timeZone": string (exactly the user's IANA time zone)
  },
  "end": {
    "dateTime": string (YYYY-MM-DDTHH:mm:ss, local wall time),
    "timeZone": string (exactly the user's IANA time zone)
  },
  "recurrence": string[],
  "attendees": [{"email": string}],
  "reminders": {
    "useDefault": boolean,
    "overrides": [{"method": string, "minutes": number}][]
  }
}

---

### Critical Constraints

- Interpret all times in the provided user time zone: "${tzForPrompt}".
- Current time in that zone: "${nowForPrompt}".
- NEVER use UTC or add "Z" to times.
- If the user says "today", "tomorrow", or "evening", resolve it to a specific date/time in the user's time zone.
- When unsure which event to modify/delete, use search parameters ('q', 'date') instead of assuming IDs.
- When calling a tool, output ONLY a function call — no explanation or markdown.
- When the user only greets you or makes small talk, reply with short plain text.
`;


  try {
    const result = await model.generateContent({
      contents: [
         {
            role: 'system',
            parts: [{ text: prompt }]
         },

         {
          role: 'user',
          parts: [{ text: rawText }]
         }

      ]

    });
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

export async function handleUserPrompt(prompt: string, accessToken: string) {
  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    });

    const functionCalls = result.response.functionCalls();

    if (!functionCalls || functionCalls.length === 0) {
      const text = result.response.text();
      return { type: "text", message: text };
    }

    const functionCall = functionCalls[0];
    const { name, args } = functionCall;
    const argsTyped = args as any;

    switch (name) {
      case "listEvents": {
        const maxResults = argsTyped.maxResults || 10;
        const events = await calendarService.listEvents(accessToken, maxResults);
        return { type: "events", events };
      }
      case "createEvent": {
        let eventData;
        try {
          eventData = typeof argsTyped.event === 'string' 
            ? JSON.parse(argsTyped.event) 
            : argsTyped.event;
        } catch (parseError) {
          throw new Error('Invalid event JSON format');
        }
        const result = await calendarService.createEvent(accessToken, eventData);
        return { type: "event", event: result.event, message: result.message };
      }
      case "updateEvent": {
        let updatedEventData;
        try {
          updatedEventData = typeof argsTyped.updatedEvent === 'string' 
            ? JSON.parse(argsTyped.updatedEvent) 
            : argsTyped.updatedEvent;
        } catch (parseError) {
          throw new Error('Invalid updatedEvent JSON format');
        }

        let eventId = (argsTyped.eventId as string | undefined)?.trim();
        
        if (!eventId) {
          const q = (argsTyped.q as string | undefined)?.trim();
          const date = (argsTyped.date as string | undefined)?.trim();
          
          if (!q && !date) {
            throw new Error('Either eventId or search criteria (q/date) must be provided');
          }

          const candidates = await calendarService.findEventsByQuery(accessToken, {
            q,
            date,
            maxLookAheadDays: 30
          });

          if (candidates.length === 0) {
            return {
              type: "text",
              message: "No events found matching the criteria to update."
            };
          }
          
          if (candidates.length > 1) {
            return {
              type: "disambiguation",
              message: "Multiple matching events found. Please choose which to update.",
              candidates: candidates.map(event => ({
                id: event.id,
                summary: event.summary,
                start: event.start?.dateTime,
                end: event.end?.dateTime,
              }))
            };
          }

          eventId = candidates[0].id!;
        }

        // Fetch existing event to merge changes
        const existingEvent = await calendarService.getEventById(accessToken, eventId);
        
        // Merge: updatedEventData overrides existingEvent fields
        const mergedEvent = {
          ...existingEvent,
          ...updatedEventData,
          id: existingEvent.id,
          etag: existingEvent.etag,
        };

        const result = await calendarService.updateEvent(accessToken, eventId, mergedEvent);
        return { type: "event", event: result.event, message: result.message };
      }
      case "deleteEvent": {
        const eventId = (argsTyped.eventId as string | undefined)?.trim();
        if(eventId) {
          const result = await calendarService.deleteEvent(accessToken, argsTyped.eventId);
          return { type: "success", message: result.message };
        }

        const q = (argsTyped.q as string | undefined)?.trim();
        const date = (argsTyped.date as string | undefined)?.trim();

        const candidates = await calendarService.findEventsByQuery(accessToken,
           {q,date, maxLookAheadDays: 30}
        );

        if(candidates.length === 0) {
          return {
            type: "text",
            message: "No events found matching the criteria to delete."
          };

        }
        // if only one candidate
        if(candidates.length === 1) {
          const deletedEventId = candidates[0].id!;
          const result = await calendarService.deleteEvent(accessToken,deletedEventId);
          return { type: "success", message: result.message, deletedEventId: deletedEventId };
        }

        // if multiple candidates, for now delete just one
        return {
          type: "disambiguation",
          message: "Multiple matching events found. Please choose which to delete.",
          candidates: candidates.map(event => ({ // mapping these 4 fields
            id: event.id,
            summary: event.summary,
            start: event.start?.dateTime,
            end: event.end?.dateTime,
          }))
        }

      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error('Error handling user prompt:', error);
    throw error;
  }
}
