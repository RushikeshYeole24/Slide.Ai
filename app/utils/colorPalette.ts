export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  name: string;
  description: string;
}

interface ColorPaletteRequest {
  topic: string;
  mood?: 'professional' | 'creative' | 'energetic' | 'calm' | 'modern' | 'classic';
  industry?: string;
  audience?: string;
}

export class ColorPaletteService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate a color palette based on topic and context using OpenRouter API
   */
  async generateColorPalette(request: ColorPaletteRequest): Promise<ColorPalette> {
    const prompt = this.buildColorPalettePrompt(request);
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional color theory expert and brand designer. Generate harmonious color palettes that are appropriate for presentations and consider accessibility, readability, and visual appeal. Always respond with valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No color palette generated');
      }

      return this.parseColorPalette(content);
    } catch (error) {
      console.error('Error generating color palette:', error);
      throw new Error('Failed to generate color palette. Please try again.');
    }
  }

  /**
   * Generate multiple color palette options
   */
  async generateColorPaletteOptions(request: ColorPaletteRequest, count: number = 3): Promise<ColorPalette[]> {
    const promises = Array.from({ length: count }, () => this.generateColorPalette(request));
    
    try {
      const results = await Promise.allSettled(promises);
      const palettes = results
        .filter((result): result is PromiseFulfilledResult<ColorPalette> => result.status === 'fulfilled')
        .map(result => result.value);
      
      if (palettes.length === 0) {
        throw new Error('Failed to generate any color palettes');
      }
      
      return palettes;
    } catch (error) {
      console.error('Error generating color palette options:', error);
      throw new Error('Failed to generate color palette options. Please try again.');
    }
  }

  private buildColorPalettePrompt(request: ColorPaletteRequest): string {
    const { topic, mood, industry, audience } = request;
    
    let prompt = `Generate a professional color palette for a presentation about: "${topic}"`;
    
    if (mood) prompt += `\nDesired mood/style: ${mood}`;
    if (industry) prompt += `\nIndustry context: ${industry}`;
    if (audience) prompt += `\nTarget audience: ${audience}`;

    prompt += `\n\nPlease provide the response in the following JSON format:
{
  "primary": "#hexcolor",
  "secondary": "#hexcolor", 
  "accent": "#hexcolor",
  "background": "#hexcolor",
  "text": "#hexcolor",
  "name": "Palette Name",
  "description": "Brief description of the palette and why it works for this topic"
}

Requirements:
- Use hex color codes (e.g., #1a2b3c)
- Ensure high contrast between text and background colors for accessibility
- Primary color should be the main brand/theme color
- Secondary color should complement the primary
- Accent color should be used for highlights and call-to-actions
- Background should be light enough for readability
- Text color should provide excellent contrast against the background
- Colors should be appropriate for professional presentations
- Consider color psychology and how colors relate to the topic`;

    return prompt;
  }

  private parseColorPalette(content: string): ColorPalette {
    try {
      const parsed = JSON.parse(content);
      
      // Validate that all required colors are present and are valid hex codes
      const requiredFields = ['primary', 'secondary', 'accent', 'background', 'text'];
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      
      for (const field of requiredFields) {
        if (!parsed[field] || !hexColorRegex.test(parsed[field])) {
          throw new Error(`Invalid or missing ${field} color`);
        }
      }
      
      return {
        primary: parsed.primary,
        secondary: parsed.secondary,
        accent: parsed.accent,
        background: parsed.background,
        text: parsed.text,
        name: parsed.name || 'Generated Palette',
        description: parsed.description || 'AI-generated color palette',
      };
    } catch (error) {
      console.error('Error parsing color palette:', error);
      
      // Fallback: return a default professional palette
      return {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#ea580c',
        background: '#ffffff',
        text: '#1e293b',
        name: 'Professional Blue',
        description: 'A clean, professional color palette suitable for business presentations',
      };
    }
  }
}

/**
 * Backend-powered color palette service
 */
export class BackendColorPaletteService {
  /**
   * Generate color palette using backend API
   */
  async generateColorPalette(request: ColorPaletteRequest): Promise<ColorPalette> {
    try {
      const response = await fetch('/api/ai/generate-color-palette', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error generating color palette:', error);
      throw new Error('Failed to generate color palette. Please try again.');
    }
  }

  /**
   * Generate multiple color palette options using backend API
   */
  async generateColorPaletteOptions(request: ColorPaletteRequest, count: number = 3): Promise<ColorPalette[]> {
    try {
      const response = await fetch('/api/ai/generate-color-palette-options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...request, count }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const result = await response.json();
      return result.palettes;
    } catch (error) {
      console.error('Error generating color palette options:', error);
      throw new Error('Failed to generate color palette options. Please try again.');
    }
  }
}

// Singleton instance for backend service
let backendColorPaletteService: BackendColorPaletteService | null = null;

export function getBackendColorPaletteService(): BackendColorPaletteService {
  if (!backendColorPaletteService) {
    backendColorPaletteService = new BackendColorPaletteService();
  }
  return backendColorPaletteService;
}

// Predefined color palettes for common topics/industries
export const predefinedPalettes: Record<string, ColorPalette> = {
  technology: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#06b6d4',
    background: '#ffffff',
    text: '#1e293b',
    name: 'Tech Blue',
    description: 'Modern and innovative palette perfect for technology presentations',
  },
  finance: {
    primary: '#059669',
    secondary: '#6b7280',
    accent: '#dc2626',
    background: '#ffffff',
    text: '#111827',
    name: 'Financial Green',
    description: 'Professional and trustworthy palette for financial presentations',
  },
  healthcare: {
    primary: '#0ea5e9',
    secondary: '#64748b',
    accent: '#ef4444',
    background: '#ffffff',
    text: '#1e293b',
    name: 'Healthcare Blue',
    description: 'Clean and trustworthy palette for healthcare presentations',
  },
  education: {
    primary: '#7c3aed',
    secondary: '#64748b',
    accent: '#f59e0b',
    background: '#ffffff',
    text: '#1e293b',
    name: 'Education Purple',
    description: 'Inspiring and academic palette for educational content',
  },
  marketing: {
    primary: '#ec4899',
    secondary: '#64748b',
    accent: '#f97316',
    background: '#ffffff',
    text: '#1e293b',
    name: 'Marketing Pink',
    description: 'Vibrant and engaging palette for marketing presentations',
  },
  creative: {
    primary: '#8b5cf6',
    secondary: '#64748b',
    accent: '#06b6d4',
    background: '#ffffff',
    text: '#1e293b',
    name: 'Creative Purple',
    description: 'Artistic and inspiring palette for creative presentations',
  },
};

/**
 * Get a predefined palette based on topic keywords
 */
export function getPredefinedPalette(topic: string): ColorPalette | null {
  const topicLower = topic.toLowerCase();
  
  for (const [key, palette] of Object.entries(predefinedPalettes)) {
    if (topicLower.includes(key)) {
      return palette;
    }
  }
  
  return null;
}