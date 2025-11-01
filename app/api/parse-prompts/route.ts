// parse prompts from user and return parsed events

import { NextRequest, NextResponse } from 'next/server';
import { parseEventFromPrompt, InvalidAIJsonError } from '@/app/service/ai.service';
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

    if ((session as any).error) {
      return NextResponse.json(
        { error: 'Authentication expired, please sign in again' },
        { status: 401 }
      );
    }

    let body: any = null;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const prompt: string | undefined = body?.prompt;
    const userTimeZone: string | undefined = body?.userTimeZone;
    const userNowISO: string | undefined = body?.userNowISO;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Invalid body: prompt is required' },
        { status: 400 }
      );
    }

    try {
      const event = await parseEventFromPrompt(prompt.trim(), userTimeZone, userNowISO);
      return NextResponse.json(
        { success: true, event },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error parsing prompts:', error);
      if (error instanceof InvalidAIJsonError) {
        return NextResponse.json(
          { success: false, error: 'AI returned invalid JSON', raw: error.raw },
          { status: 422 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Failed to parse prompts' },
        { status: 500 }
      );
    }
}