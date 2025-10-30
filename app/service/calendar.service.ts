// calendar service to commit events, update events, delete events, etc.

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
export async function listEvents(accessToken: string,maxResults: number){

    const calendarClient = getCalendarClient(accessToken);
     try {
        const response = await calendarClient.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: maxResults,
            singleEvents: true,
            orderBy: 'startTime',
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






