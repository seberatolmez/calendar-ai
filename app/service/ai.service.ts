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
                    summary: {
                        type: SchemaType.STRING,
                        description: 'Event title/summary'
                    },
                    description: {
                        type: SchemaType.STRING,
                        description: 'Event description'
                    },
                    location: {
                        type: SchemaType.STRING,
                        description: 'Event location'
                    },
                    startDateTime: {
                        type: SchemaType.STRING,
                        description: 'Start date and time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss)'
                    },
                    endDateTime: {
                        type: SchemaType.STRING,
                        description: 'End date and time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss)'
                    },
                    timeZone: {
                        type: SchemaType.STRING,
                        description: 'IANA time zone identifier (e.g., America/New_York, Europe/London)'
                    }
                },
                required: ['summary', 'startDateTime', 'endDateTime', 'timeZone']
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
                    summary: {
                        type: SchemaType.STRING,
                        description: 'Updated event title/summary'
                    },
                    description: {
                        type: SchemaType.STRING,
                        description: 'Updated event description'
                    },
                    location: {
                        type: SchemaType.STRING,
                        description: 'Updated event location'
                    },
                    startDateTime: {
                        type: SchemaType.STRING,
                        description: 'Updated start date and time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss)'
                    },
                    endDateTime: {
                        type: SchemaType.STRING,
                        description: 'Updated end date and time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss)'
                    },
                    timeZone: {
                        type: SchemaType.STRING,
                        description: 'IANA time zone identifier (e.g., America/New_York, Europe/London)'
                    }
                }
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

export async function handleUserPrompt(prompt: string, accessToken: string, userTimeZone?: string) {
  try {
    // Use provided timezone or default to UTC
    const timeZone = userTimeZone || 'UTC';
    console.log('User timezone:', timeZone);
    
    const now = new Date();
    
    // Get current date and time in user's timezone
    const currentDateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);
    
    const currentTimeParts = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(now);
    
    const getPart = (parts: Intl.DateTimeFormatPart[], type: string) => 
      parts.find(p => p.type === type)?.value || '';
    
    const currentYear = getPart(currentDateParts, 'year');
    const currentMonth = getPart(currentDateParts, 'month');
    const currentDay = getPart(currentDateParts, 'day');
    const currentHour = getPart(currentTimeParts, 'hour');
    const currentMinute = getPart(currentTimeParts, 'minute');
    
    const currentDate = `${currentYear}-${currentMonth}-${currentDay}`;
    const currentTime = `${currentHour}:${currentMinute}`;
    const currentDateTime = `${currentDate}T${currentTime}:00`;
    
    // Calculate tomorrow's date
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(tomorrow);
    const tomorrowDate = `${getPart(tomorrowDateParts, 'year')}-${getPart(tomorrowDateParts, 'month')}-${getPart(tomorrowDateParts, 'day')}`;
    
    console.log('Current date in user timezone:', currentDate);
    console.log('Current datetime in user timezone:', currentDateTime);
    console.log('Tomorrow date in user timezone:', tomorrowDate);
    console.log('Current year:', currentYear);

    const systemInstruction = `
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

When calling createEvent or updateEvent, provide the following parameters:
- summary: Event title (required for createEvent)
- description: Event description (optional)
- location: Event location (optional)
- startDateTime: Start time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss) - REQUIRED
- endDateTime: End time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss) - REQUIRED
- timeZone: IANA time zone identifier (e.g., "America/New_York", "Europe/London") - REQUIRED for createEvent

Example: If user says "schedule tennis tomorrow at 8am for 1.5 hours" (and today is ${currentDate}):
- summary: "Tennis"
- startDateTime: "${tomorrowDate}T08:00:00" (use EXACT date ${tomorrowDate} for tomorrow)
- endDateTime: "${tomorrowDate}T09:30:00" (1.5 hours later, same date ${tomorrowDate})
- timeZone: "${timeZone}" (MUST use this exact timezone)

---

### Critical Constraints

- User's time zone: **${timeZone}**
- CURRENT DATE (today): **${currentDate}**
- CURRENT DATE AND TIME: **${currentDateTime}**
- TOMORROW'S DATE: **${tomorrowDate}**

**IMPORTANT DATE RESOLUTION RULES:**
- When user says "today" → use date: **${currentDate}**
- When user says "tomorrow" → use date: **${tomorrowDate}** (THIS IS THE EXACT DATE TO USE)
- When user says "next week" → calculate from ${currentDate}, add 7 days
- ALWAYS use the CURRENT YEAR (${currentYear}) when resolving dates
- ALWAYS use the timezone "${timeZone}" when creating or updating events.
- Interpret all times in the user's local time zone: **${timeZone}**. NEVER guess or use a different timezone.
- NEVER use UTC or add "Z" to times unless explicitly requested by the user.
- NEVER use dates from the past or wrong year. Today is ${currentDate}, so "tomorrow" MUST be ${tomorrowDate}.
- When creating events, use the EXACT date ${tomorrowDate} for "tomorrow", not any other date.
- When unsure which event to modify/delete, use search parameters ('q', 'date') instead of assuming IDs.
- When the user only greets you or makes small talk, reply with short plain text without calling any tools.
`;

    // Create model instance with system instruction for this request
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      tools: tools,
      systemInstruction: systemInstruction
    });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    });

    const functionCalls = result.response.functionCalls();

    console.log('Function calls received:', JSON.stringify(functionCalls, null, 2));

    if (!functionCalls || functionCalls.length === 0) {
      const text = result.response.text();
      console.log('No function calls, returning text response:', text);
      return { type: "text", message: text };
    }

    const functionCall = functionCalls[0];
    const { name, args } = functionCall;
    const argsTyped = args as any;
    
    console.log(`Calling function: ${name}`, 'with args:', JSON.stringify(argsTyped, null, 2));

    switch (name) {
      case "listEvents": {
        const maxResults = argsTyped.maxResults || 10;
        const events = await calendarService.listEvents(accessToken, maxResults);
        return { type: "events", events };
      }
      case "createEvent": {
        try {
          // Use user's timezone if AI didn't provide one
          const eventTimeZone = argsTyped.timeZone || userTimeZone || 'UTC';
          
          // Build event object from function arguments
          const eventData = {
            summary: argsTyped.summary || 'Untitled Event',
            description: argsTyped.description || '',
            location: argsTyped.location || '',
            start: {
              dateTime: argsTyped.startDateTime,
              timeZone: eventTimeZone
            },
            end: {
              dateTime: argsTyped.endDateTime,
              timeZone: eventTimeZone
            }
          };

          console.log('Creating event with data:', JSON.stringify(eventData, null, 2));

          if (!eventData.start.dateTime || !eventData.end.dateTime) {
            throw new Error('Missing required fields: startDateTime and endDateTime are required');
          }

          const result = await calendarService.createEvent(accessToken, eventData);
          console.log('Event created successfully:', result.event?.id);
          return { type: "event", event: result.event, message: result.message };
        } catch (error) {
          console.error('Error in createEvent case:', error);
          throw error;
        }
      }
      case "updateEvent": {
        try {
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

          if (!eventId) {
            throw new Error('Event ID is required to update event');
          }

          // Fetch existing event to merge changes
          const existingEvent = await calendarService.getEventById(accessToken, eventId);
          
          // Build updated event data from function arguments
          const updatedEventData: any = {};
          
          if (argsTyped.summary !== undefined) updatedEventData.summary = argsTyped.summary;
          if (argsTyped.description !== undefined) updatedEventData.description = argsTyped.description;
          if (argsTyped.location !== undefined) updatedEventData.location = argsTyped.location;
          if (argsTyped.startDateTime) {
            updatedEventData.start = {
              dateTime: argsTyped.startDateTime,
              timeZone: argsTyped.timeZone || userTimeZone || existingEvent.start?.timeZone || 'UTC'
            };
          }
          if (argsTyped.endDateTime) {
            updatedEventData.end = {
              dateTime: argsTyped.endDateTime,
              timeZone: argsTyped.timeZone || userTimeZone || existingEvent.end?.timeZone || 'UTC'
            };
          }
          
          // Merge: updatedEventData overrides existingEvent fields
          const mergedEvent = {
            ...existingEvent,
            ...updatedEventData,
            id: existingEvent.id,
            etag: existingEvent.etag,
          };

          console.log('Updating event with data:', JSON.stringify(mergedEvent, null, 2));

          const result = await calendarService.updateEvent(accessToken, eventId, mergedEvent);
          console.log('Event updated successfully:', result.event?.id);
          return { type: "event", event: result.event, message: result.message };
        } catch (error) {
          console.error('Error in updateEvent case:', error);
          throw error;
        }
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
