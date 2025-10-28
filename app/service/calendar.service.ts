// calendar service to commit events, update events, delete events, etc.

import { google } from 'googleapis';
import { getSession } from 'next-auth/react';
import {GET as authHandler} from '../api/auth/[...nextauth]/route';
import { Http2ServerRequest } from 'node:http2';

export async function listEvents() {
    const session = getSession();
    if (!session || session === null) {
        throw new Error('Unauthorized');
    }

    const auth = authHandler();
    let response;

    try {
        response = await google.calendar({version: 'v3', auth: auth}).events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });
    } catch (error) {
        console.error('Error listing events:', error);
        throw new Error('Failed to list events');
    }
     
}



