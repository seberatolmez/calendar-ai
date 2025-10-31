// parse prompts from user and return parsed events

import { NextRequest, NextResponse } from 'next/server';
import { parseEventFromPrompt } from '@/app/service/ai.service';

export async function POST(request: NextRequest) {
    
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