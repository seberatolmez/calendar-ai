import { calendar_v3 } from 'googleapis';
import { CalendarEvent } from '@/app/components/EventCard';

/**
 * Transforms a Google Calendar event (calendar_v3.Schema$Event) to CalendarEvent format
 * used by the UI components.
 */
export function transformGoogleEventToCalendarEvent(
  googleEvent: calendar_v3.Schema$Event
): CalendarEvent | null {
  if (!googleEvent.id || !googleEvent.summary) {
    return null;
  }

  // Check if it's an all-day event (has 'date' instead of 'dateTime')
  const isAllDay = !!googleEvent.start?.date && !googleEvent.start?.dateTime;
  
  // Extract start and end times
  const startDateTime = googleEvent.start?.dateTime || googleEvent.start?.date;
  const endDateTime = googleEvent.end?.dateTime || googleEvent.end?.date;

  if (!startDateTime || !endDateTime) {
    return null;
  }

  // Parse dates
  const startDate = new Date(startDateTime);
  const endDate = new Date(endDateTime);

  // For all-day events, use 00:00 as the time
  // For timed events, format the actual time
  const startTime = isAllDay ? '00:00' : formatTime(startDate);
  const endTime = isAllDay ? '23:59' : formatTime(endDate);

  // Extract date as YYYY-MM-DD
  // For all-day events, use the date directly (it's already in YYYY-MM-DD format)
  const date = isAllDay && googleEvent.start?.date 
    ? googleEvent.start.date 
    : formatDate(startDate);

  // Get color ID (default to "1" if not provided)
  const color = googleEvent.colorId || '1';

  return {
    id: googleEvent.id,
    title: googleEvent.summary || 'Untitled Event',
    startTime,
    endTime,
    date,
    color,
    description: googleEvent.description || undefined,
  };
}

/**
 * Formats a Date object to HH:mm time string
 */
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Formats a Date object to YYYY-MM-DD date string
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Transforms an array of Google Calendar events to CalendarEvent array
 */
export function transformGoogleEventsToCalendarEvents(
  googleEvents: calendar_v3.Schema$Event[]
): CalendarEvent[] {
  return googleEvents
    .map(transformGoogleEventToCalendarEvent)
    .filter((event): event is CalendarEvent => event !== null);
}

