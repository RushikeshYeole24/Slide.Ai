interface OpenAIConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface SlideContentRequest {
  topic: string;
  slideType: 'title' | 'content' | 'bullet-points' | 'conclusion' | 'agenda' | 'overview';
  context?: string;
  audience?: string;
  tone?: 'professional' | 'casual' | 'academic' | 'creative';
  length?: 'short' | 'medium' | 'long';
}

interface GeneratedSlideContent {
  title: string;
  content: string[];
  subtitle?: string;
  notes?: string;
}

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

export class OpenAIService {
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = {
      model: 'gpt-3.5-turbo',
      maxTokens: 1000,
      temperature: 0.7,
      ...config,
    };
  }

  /**
   * Generate slide content based on topic and type
   */
  async generateSlideContent(request: SlideContentRequest): Promise<GeneratedSlideContent> {
    const prompt = this.buildSlideContentPrompt(request);
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a professional presentation assistant. Generate clear, engaging slide content that is well-structured and appropriate for the given context. Always respond with valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content generated from OpenAI');
      }

      return this.parseSlideContent(content);
    } catch (error) {
      console.error('Error generating slide content:', error);
      throw new Error('Failed to generate slide content. Please try again.');
    }
  }

  /**
   * Generate a complete presentation outline
   */
  async generatePresentationOutline(request: PresentationOutlineRequest): Promise<PresentationOutline> {
    const prompt = this.buildOutlinePrompt(request);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
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
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No outline generated from OpenAI');
      }

      return this.parseOutlineContent(content);
    } catch (error) {
      console.error('Error generating presentation outline:', error);
      throw new Error('Failed to generate presentation outline. Please try again.');
    }
  }

  /**
   * Improve existing slide content
   */
  async improveSlideContent(currentContent: string, improvements: string[]): Promise<string> {
    const prompt = `
Please improve the following slide content based on these specific requirements:
${improvements.map(imp => `- ${imp}`).join('\n')}

Current content:
"${currentContent}"

Please provide improved content that addresses the requirements while maintaining clarity and engagement.
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
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
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || currentContent;
    } catch (error) {
      console.error('Error improving slide content:', error);
      throw new Error('Failed to improve slide content. Please try again.');
    }
  }

  private buildSlideContentPrompt(request: SlideContentRequest): string {
    const { topic, slideType, context, audience, tone, length } = request;
    
    let prompt = `Generate ${slideType} slide content for the topic: "${topic}"`;
    
    if (audience) prompt += `\nTarget audience: ${audience}`;
    if (tone) prompt += `\nTone: ${tone}`;
    if (length) prompt += `\nLength: ${length}`;
    if (context) prompt += `\nAdditional context: ${context}`;

    prompt += `\n\nPlease provide the response in the following JSON format:
{
  "title": "Slide title",
  "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
  "subtitle": "Optional subtitle",
  "notes": "Optional speaker notes"
}`;

    switch (slideType) {
      case 'title':
        prompt += '\n\nFor a title slide, focus on creating an engaging main title and compelling subtitle.';
        break;
      case 'content':
        prompt += '\n\nFor a content slide, provide 3-5 clear, concise bullet points that cover the main aspects of the topic.';
        break;
      case 'bullet-points':
        prompt += '\n\nProvide 4-6 actionable bullet points that are specific and valuable.';
        break;
      case 'conclusion':
        prompt += '\n\nFor a conclusion slide, summarize key takeaways and provide a strong closing message.';
        break;
      case 'agenda':
        prompt += '\n\nFor an agenda slide, break down the presentation into logical sections.';
        break;
      case 'overview':
        prompt += '\n\nFor an overview slide, provide a high-level summary of the main topics to be covered.';
        break;
    }

    return prompt;
  }

  private buildOutlinePrompt(request: PresentationOutlineRequest): string {
    const { topic, audience, duration, tone, keyPoints } = request;
    
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

    return prompt;
  }

  private parseSlideContent(content: string): GeneratedSlideContent {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      return {
        title: parsed.title || 'Generated Title',
        content: Array.isArray(parsed.content) ? parsed.content : [parsed.content || 'Generated content'],
        subtitle: parsed.subtitle,
        notes: parsed.notes,
      };
    } catch (error) {
      // Fallback: parse as plain text
      const lines = content.split('\n').filter(line => line.trim());
      const title = lines[0] || 'Generated Title';
      const contentLines = lines.slice(1).filter(line => line.trim());
      
      return {
        title,
        content: contentLines.length > 0 ? contentLines : ['Generated content'],
      };
    }
  }

  private parseOutlineContent(content: string): PresentationOutline {
    try {
      const parsed = JSON.parse(content);
      return {
        title: parsed.title || 'Generated Presentation',
        slides: Array.isArray(parsed.slides) ? parsed.slides : [],
      };
    } catch (error) {
      // Fallback: create a basic outline
      return {
        title: 'Generated Presentation',
        slides: [
          { type: 'title', title: 'Title Slide', description: 'Introduction to the topic' },
          { type: 'content', title: 'Main Content', description: 'Key points and information' },
          { type: 'conclusion', title: 'Conclusion', description: 'Summary and next steps' },
        ],
      };
    }
  }
}

/**
 * Backend-powered OpenAI service that uses our API routes
 * No API key required from users - handled by backend
 */
export class BackendOpenAIService {
  /**
   * Generate slide content using backend API
   */
  async generateSlideContent(request: SlideContentRequest): Promise<GeneratedSlideContent> {
    try {
      const response = await fetch('/api/ai/generate-slide', {
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
      console.error('Error generating slide content:', error);
      throw new Error('Failed to generate slide content. Please try again.');
    }
  }

  /**
   * Generate presentation outline using backend API
   */
  async generatePresentationOutline(request: PresentationOutlineRequest): Promise<PresentationOutline> {
    try {
      const response = await fetch('/api/ai/generate-presentation', {
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
      console.error('Error generating presentation outline:', error);
      throw new Error('Failed to generate presentation outline. Please try again.');
    }
  }

  /**
   * Improve existing slide content using backend API
   */
  async improveSlideContent(currentContent: string, improvements: string[]): Promise<string> {
    try {
      const response = await fetch('/api/ai/improve-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentContent,
          improvements,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const result = await response.json();
      return result.improvedContent;
    } catch (error) {
      console.error('Error improving slide content:', error);
      throw new Error('Failed to improve slide content. Please try again.');
    }
  }
}

// Singleton instance for backend service
let backendOpenAIService: BackendOpenAIService | null = null;

export function getBackendOpenAIService(): BackendOpenAIService {
  if (!backendOpenAIService) {
    backendOpenAIService = new BackendOpenAIService();
  }
  return backendOpenAIService;
}

// Legacy functions for backward compatibility
export function getOpenAIService(apiKey?: string): OpenAIService {
  if (!openAIService && apiKey) {
    openAIService = new OpenAIService({ apiKey });
  }
  
  if (!openAIService) {
    throw new Error('OpenAI service not initialized. Please provide an API key.');
  }
  
  return openAIService;
}

export function initializeOpenAI(apiKey: string): void {
  openAIService = new OpenAIService({ apiKey });
}

// Helper function to check if OpenAI is configured (always true for backend service)
export function isOpenAIConfigured(): boolean {
  return true; // Backend service is always available
}

// Singleton instance for legacy service
let openAIService: OpenAIService | null = null;