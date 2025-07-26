import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

interface PresentationOutlineRequest {
  topic: string;
  audience?: string;
  duration?: number; // in minutes
  tone?: 'professional' | 'casual' | 'academic' | 'creative';
  keyPoints?: string[];
}

interface PresentationOutline {
  title: string;
  slides: {
    type: string;
    title: string;
    description: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const body: PresentationOutlineRequest = await request.json();
    const { topic, audience, duration = 15, tone = 'professional', keyPoints = [] } = body;

    // Validate required fields
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
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
    let prompt = `Create a comprehensive presentation outline for the topic: "${topic}"`;
    
    if (audience) prompt += `\nTarget audience: ${audience}`;
    if (duration) prompt += `\nPresentation duration: ${duration} minutes`;
    if (tone) prompt += `\nTone: ${tone}`;
    if (keyPoints && keyPoints.length > 0) {
      prompt += `\nKey points to cover: ${keyPoints.join(', ')}`;
    }

    prompt += `\n\nPlease provide the response in the following JSON format:
{
  "title": "Presentation Title",
  "slides": [
    {
      "type": "title",
      "title": "Slide Title",
      "description": "Brief description of slide content"
    }
  ]
}

Create a logical flow with:
1. Title slide
2. Agenda/Overview (if appropriate)
3. Main content slides (3-7 slides depending on duration)
4. Conclusion/Next Steps
5. Thank you/Q&A slide

Each slide should have a clear purpose and contribute to the overall narrative.`;

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
            content: 'You are a professional presentation strategist. Create comprehensive presentation outlines that are logical, engaging, and well-structured. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', response.status, errorData);
      return NextResponse.json(
        { error: 'Failed to generate presentation outline from AI service' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json(
        { error: 'No outline generated from AI service' },
        { status: 500 }
      );
    }

    // Parse the AI response
    let parsedContent: PresentationOutline;
    try {
      parsedContent = JSON.parse(content);
    } catch (error) {
      // Fallback: create a basic outline
      parsedContent = {
        title: `Presentation: ${topic}`,
        slides: [
          { type: 'title', title: 'Title Slide', description: 'Introduction to the topic' },
          { type: 'content', title: 'Main Content', description: 'Key points and information' },
          { type: 'conclusion', title: 'Conclusion', description: 'Summary and next steps' },
        ],
      };
    }

    // Ensure the response has the correct structure
    const result: PresentationOutline = {
      title: parsedContent.title || `Presentation: ${topic}`,
      slides: Array.isArray(parsedContent.slides) ? parsedContent.slides : [],
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in generate-presentation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}