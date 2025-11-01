// parse prompts from user and return parsed events

import { NextRequest, NextResponse } from 'next/server';
import { parseEventFromPrompt } from '@/app/service/ai.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
    
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
        const response = await parseEventFromPrompt( await request.text());
        return NextResponse.json({
            success: true,
              response
        }, {
            status: 200
        });

    }catch (error) {
        console.error('Error parsing prompts:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to parse prompts'
        }, {
            status: 500
        });
    }
}