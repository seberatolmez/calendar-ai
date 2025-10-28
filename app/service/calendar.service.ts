// calendar service to commit events, update events, delete events, etc.

import { google, calendar_v3 } from 'googleapis';

function getCalendarClient(accessToken: string) {
    const client = new google.auth.OAuth2(
        process.env.CLIENT_ID!,
        process.env.CLIENT_SECRET!,
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

        return response.data.items || "No events found";
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

        return response.data; 
    }catch(error){
        console.error('Error creating event:', error);
        throw new Error('Failed to create event');
    }
}





