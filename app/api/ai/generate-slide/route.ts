import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

interface SlideContentRequest {
  topic: string;
  slideType:
    | "title"
    | "content"
    | "bullet-points"
    | "conclusion"
    | "agenda"
    | "overview";
  context?: string;
  audience?: string;
  tone?: "professional" | "casual" | "academic" | "creative";
  length?: "short" | "medium" | "long";
}

interface GeneratedSlideContent {
  title: string;
  content: string[];
  subtitle?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SlideContentRequest = await request.json();
    const {
      topic,
      slideType,
      context,
      audience,
      tone = "professional",
      length = "medium",
    } = body;

    // Validate required fields
    if (!topic || !slideType) {
      return NextResponse.json(
        { error: "Topic and slideType are required" },
        { status: 400 }
      );
    }

    // Check for OpenRouter API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured on server" },
        { status: 500 }
      );
    }

    // Build the prompt
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
      case "title":
        prompt +=
          "\n\nFor a title slide, focus on creating an engaging main title and compelling subtitle.";
        break;
      case "content":
        prompt +=
          "\n\nFor a content slide, provide 3-5 clear, concise bullet points that cover the main aspects of the topic.";
        break;
      case "bullet-points":
        prompt +=
          "\n\nProvide 4-6 actionable bullet points that are specific and valuable.";
        break;
      case "conclusion":
        prompt +=
          "\n\nFor a conclusion slide, summarize key takeaways and provide a strong closing message.";
        break;
      case "agenda":
        prompt +=
          "\n\nFor an agenda slide, break down the presentation into logical sections.";
        break;
      case "overview":
        prompt +=
          "\n\nFor an overview slide, provide a high-level summary of the main topics to be covered.";
        break;
    }

    // Make request to OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "SlideMaker AI",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a professional presentation assistant. Generate clear, engaging slide content that is well-structured and appropriate for the given context. Always respond with valid JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", response.status, errorData);
      return NextResponse.json(
        { error: "Failed to generate content from AI service" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No content generated from AI service" },
        { status: 500 }
      );
    }

    // Parse the AI response
    let parsedContent: GeneratedSlideContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (error) {
      // Fallback: parse as plain text
      const lines = content.split("\n").filter((line: string) => line.trim());
      const title = lines[0] || "Generated Title";
      const contentLines = lines.slice(1).filter((line: string) => line.trim());

      parsedContent = {
        title,
        content: contentLines.length > 0 ? contentLines : ["Generated content"],
      };
    }

    // Ensure content is properly formatted
    const result: GeneratedSlideContent = {
      title: parsedContent.title || "Generated Title",
      content: Array.isArray(parsedContent.content)
        ? parsedContent.content
        : [parsedContent.content || "Generated content"],
      subtitle: parsedContent.subtitle,
      notes: parsedContent.notes,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in generate-slide API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
