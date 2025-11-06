// parse prompts from user and handle function calling for calendar operations

import { NextRequest, NextResponse } from 'next/server';
import { handleUserPrompt } from '@/app/service/ai.service';
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
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Invalid body: prompt is required' },
        { status: 400 }
      );
    }

    try {
      const result = await handleUserPrompt(prompt.trim(), session.accessToken);
      return NextResponse.json(
        { success: true, ...result },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error handling prompt:', error);
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Failed to handle prompt' },
        { status: 500 }
      );
    }
}