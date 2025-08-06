import { NextRequest, NextResponse } from 'next/server';
import { ColorPaletteService } from '@/app/utils/colorPalette';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, mood, industry, audience, count = 3 } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const colorPaletteService = new ColorPaletteService(apiKey);
    const palettes = await colorPaletteService.generateColorPaletteOptions({
      topic,
      mood,
      industry,
      audience,
    }, Math.min(count, 5)); // Limit to max 5 palettes

    return NextResponse.json({ palettes });
  } catch (error) {
    console.error('Error in generate-color-palette-options API:', error);
    return NextResponse.json(
      { error: 'Failed to generate color palette options' },
      { status: 500 }
    );
  }
}