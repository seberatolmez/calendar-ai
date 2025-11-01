// commit events to calendar using google calendar api

import { NextRequest,NextResponse } from "next/server";   
import { createEvent } from "@/app/service/calendar.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function Post( request: NextRequest) {

    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
        );
    }

    if (session.error) {
    return NextResponse.json(
      { error: 'Authentication expired, please sign in again' },
      { status: 401 }
        );
    }

    try {

    const response = await createEvent(session.accessToken, await request.json()); // request body should be aligned with calendar_v3.Schema$Event
            // todo: add validation for request body after creating proper type for event
    return NextResponse.json( {
        success: true,
        response: response,
        message: 'Event created successfully'
    }, {
        status: 200
    });

    } catch (error) {
        console.error('Error committing event:', error);
        return NextResponse.json({
        success: false,
        error: 'Failed to commit event',
        }, 
        { status: 500
        });
    }
}

export { Post as POST };