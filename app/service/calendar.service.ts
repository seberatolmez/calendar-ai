// calendar service to commit events, update events, delete events, etc.

import { time } from 'console';
import { google, calendar_v3 } from 'googleapis';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;


function getCalendarClient(accessToken: string) {
    const client = new google.auth.OAuth2(
        CLIENT_ID!,
        CLIENT_SECRET!,
    );

    client.setCredentials({
        access_token: accessToken,
    })

    return google.calendar({version: 'v3', auth: client});
}



// List upcoming events 
export async function listEvents(accessToken: string,maxResults: number, timeMax?: string, timeMin?: string) {

    const calendarClient = getCalendarClient(accessToken);
     try {
        const response = await calendarClient.events.list({
            calendarId: 'primary',
            timeMin: timeMin || (new Date()).toISOString(),
            maxResults: maxResults || 10,
            singleEvents: true,
            orderBy: 'startTime',
            timeMax: timeMax // for filtering events up to a range
        });

        return response.data.items || [];
     }catch(error){
        console.error('Error listing events:', error);
        throw new Error('Failed to list events');
     }
}

export async function createEvent(accessToken: string, event: calendar_v3.Schema$Event){

    const calendarClient = getCalendarClient(accessToken);

    try {
        const response = await calendarClient.events.insert({
            calendarId: 'primary',
            requestBody: event,
        })

        return { //TODO: may be able to define a proper return type
            message: 'Event created successfully',
            event: response.data
        }; 

    } catch(error){
        console.error('Error creating event:', error);
        throw new Error('Failed to create event');
    }
}

export async function updateEvent(accessToken: string, eventId: string, updatedEvent: calendar_v3.Schema$Event){
    
    const calendarClient = getCalendarClient(accessToken);

    //TODO: impelement checks for event existence and input validation 

    try {
        const response = await calendarClient.events.update({
            calendarId: 'primary',
            eventId: eventId,
            requestBody: updatedEvent,
        });
        return {
            message: 'Event updated successfully',
            event:response.data
        };

    } catch (error) {
        console.error('Error updating event:', error);
        throw new Error('Failed to update event');
    }
}

export async function deleteEvent(accessToken: string, eventId: string){

    const calendarClient = getCalendarClient(accessToken);

    try {
        
        await calendarClient.events.delete({
            calendarId: 'primary',
            eventId: eventId,
        });

        return {
            message: 'Event deleted successfully',
        };
        
    } catch (error) {
        console.error('Error deleting event:', error); // log the eror
        throw new Error('Failed to delete event');
    }
}

export async function getEventById(accessToken: string, eventId: string){
    const calendarClient = getCalendarClient(accessToken);

    try {
        const response = await calendarClient.events.get({
            calendarId: 'primary',
            eventId: eventId,
        });

        return response.data;

    } catch (error) {
        console.error('Error fetching event with ID: ',eventId);
        throw new Error('Failed to fetch event');
    }

}

function startOfDay(date: string) {
    const d = new Date(date + 'T00:00:00');
    return d.toISOString();
}

function endOfDay(date: string) {
    const d = new Date(date + 'T23:59:59');
    return d.toISOString();
}

export async function findEventsByQuery(
    accessToken: string,
    options: {
        q?: string;
        date?: string;
        maxLookAheadDays?: number;
    }
) {

    const calendarClient = getCalendarClient(accessToken);
    const now = new Date();
    const lookAhead = new Date(now);
    lookAhead.setDate(lookAhead.getDate() + (options.maxLookAheadDays ?? 30));
    
    const timeMin = options.date ? startOfDay(options.date) : now.toISOString();
    const timeMax = options.date ? endOfDay(options.date) : lookAhead.toISOString();
  
    const response = await calendarClient.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 50,
        q: options.q,
    });

    return response.data.items || [];
}







