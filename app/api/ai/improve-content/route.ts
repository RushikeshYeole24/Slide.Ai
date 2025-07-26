import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

interface ImproveContentRequest {
  currentContent: string;
  improvements: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ImproveContentRequest = await request.json();
    const { currentContent, improvements } = body;

    // Validate required fields
    if (!currentContent || !improvements || improvements.length === 0) {
      return NextResponse.json(
        { error: 'Current content and improvements are required' },
        { status: 400 }
      );
    }

    // Check for OpenRouter API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured on server' },
        { status: 500 }
      );
    }

    // Build the prompt
    const prompt = `
Please improve the following slide content based on these specific requirements:
${improvements.map(imp => `- ${imp}`).join('\n')}

Current content:
"${currentContent}"

Please provide improved content that addresses the requirements while maintaining clarity and engagement.
`;

    // Make request to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'SlideMaker AI',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional presentation editor. Improve slide content while maintaining its core message and making it more engaging and clear.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', response.status, errorData);
      return NextResponse.json(
        { error: 'Failed to improve content from AI service' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const improvedContent = data.choices[0]?.message?.content;
    
    if (!improvedContent) {
      return NextResponse.json(
        { error: 'No improved content generated from AI service' },
        { status: 500 }
      );
    }

    return NextResponse.json({ improvedContent });

  } catch (error) {
    console.error('Error in improve-content API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}