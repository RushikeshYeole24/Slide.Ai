import { useState, useCallback } from "react";
import { getBackendOpenAIService } from "@/app/utils/openai";
import { usePresentation } from "@/app/contexts/PresentationContext";
import { templates } from "@/app/data/templates";

interface UseOpenAIOptions {
  // No longer needed - backend handles API key
}

interface GenerateSlideOptions {
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

interface GeneratePresentationOptions {
  topic: string;
  audience?: string;
  duration?: number;
  tone?: "professional" | "casual" | "academic" | "creative";
  keyPoints?: string[];
}

export function useOpenAI(options: UseOpenAIOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { dispatch, presentation } = usePresentation();

  const isConfigured = true; // Always configured with backend service

  /**
   * Generate content for a single slide
   */
  const generateSlideContent = useCallback(
    async (options: GenerateSlideOptions) => {
      setIsLoading(true);
      setError(null);

      try {
        const service = getBackendOpenAIService();
        const result = await service.generateSlideContent(options);

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to generate slide content";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Generate a complete presentation outline
   */
  const generatePresentationOutline = useCallback(
    async (options: GeneratePresentationOptions) => {
      setIsLoading(true);
      setError(null);

      try {
        const service = getBackendOpenAIService();
        const result = await service.generatePresentationOutline(options);

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to generate presentation outline";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Create a new slide with AI-generated content
   */
  const createAISlide = useCallback(
    async (options: GenerateSlideOptions) => {
      if (!presentation) {
        throw new Error("No presentation available");
      }

      const generatedContent = await generateSlideContent(options);

      // Find appropriate template based on slide type
      let templateId = "content-slide";
      switch (options.slideType) {
        case "title":
          templateId = "executive-title";
          break;
        case "agenda":
          templateId = "agenda-slide";
          break;
        case "conclusion":
          templateId = "thank-you";
          break;
        case "bullet-points":
          templateId = "content-slide";
          break;
        case "overview":
          templateId = "content-slide";
          break;
      }

      const template =
        templates.find((t) => t.id === templateId) || templates[0];

      // Create slide with generated content
      const newSlide = {
        id: `slide-${Date.now()}`,
        type: template.type,
        background: template.background,
        template: templateId,
        elements: template.elements.map((el, i) => {
          let content = el.content;

          // Map generated content to template elements
          if (el.type === "title") {
            content = generatedContent.title;
          } else if (el.type === "subtitle") {
            content = generatedContent.subtitle || el.content;
          } else if (el.type === "body" || el.type === "bullet") {
            if (generatedContent.content.length > 0) {
              content = generatedContent.content
                .map((item) => `• ${item}`)
                .join("\n");
            }
          }

          return {
            ...el,
            id: `element-${Date.now()}-${i}`,
            content,
          };
        }),
      };

      dispatch({ type: "ADD_SLIDE", payload: { slide: newSlide } });
      return newSlide;
    },
    [generateSlideContent, presentation, dispatch]
  );

  /**
   * Create a complete AI-generated presentation
   */
  const createAIPresentation = useCallback(
    async (options: GeneratePresentationOptions) => {
      const outline = await generatePresentationOutline(options);

      // Create new presentation
      const newPresentation = {
        id: "new", // Use "new" for new presentations
        title: outline.title,
        slides: [],
        theme: {
          id: "professional-blue",
          name: "Professional Blue",
          colors: {
            primary: "#2563eb",
            secondary: "#64748b",
            accent: "#ea580c",
            background: "#ffffff",
            text: "#1e293b",
          },
          fonts: {
            heading: "Inter",
            body: "Inter",
          },
        },
        currentSlideIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({ type: "SET_PRESENTATION", payload: newPresentation });

      // Generate slides based on outline - create slides directly instead of using createAISlide
      for (const slideInfo of outline.slides) {
        try {
          // Generate content for this slide
          const generatedContent = await generateSlideContent({
            topic: slideInfo.title,
            slideType: slideInfo.type as any,
            context: slideInfo.description,
            audience: options.audience,
            tone: options.tone,
          });

          // Find appropriate template based on slide type
          let templateId = "content-slide";
          switch (slideInfo.type) {
            case "title":
              templateId = "executive-title";
              break;
            case "agenda":
              templateId = "agenda-slide";
              break;
            case "conclusion":
              templateId = "thank-you";
              break;
            case "bullet-points":
              templateId = "content-slide";
              break;
            case "overview":
              templateId = "content-slide";
              break;
            default:
              templateId = "content-slide";
          }

          const template =
            templates.find((t) => t.id === templateId) || templates[0];

          // Create slide with generated content
          const newSlide = {
            id: `slide-${Date.now()}-${Math.random()}`,
            type: template.type,
            background: template.background,
            template: templateId,
            elements: template.elements.map((el, i) => {
              let content = el.content;

              // Map generated content to template elements
              if (el.type === "title") {
                content = generatedContent.title;
              } else if (el.type === "subtitle") {
                content = generatedContent.subtitle || el.content;
              } else if (el.type === "body" || el.type === "bullet") {
                if (generatedContent.content.length > 0) {
                  content = generatedContent.content
                    .map((item) => `• ${item}`)
                    .join("\n");
                }
              }

              return {
                ...el,
                id: `element-${Date.now()}-${i}-${Math.random()}`,
                content,
              };
            }),
          };

          dispatch({ type: "ADD_SLIDE", payload: { slide: newSlide } });
        } catch (error) {
          console.error(`Failed to generate slide: ${slideInfo.title}`, error);
        }
      }

      return outline;
    },
    [generatePresentationOutline, generateSlideContent, dispatch]
  );

  /**
   * Improve existing slide content
   */
  const improveSlideContent = useCallback(
    async (currentContent: string, improvements: string[]) => {
      setIsLoading(true);
      setError(null);

      try {
        const service = getBackendOpenAIService();
        const result = await service.improveSlideContent(
          currentContent,
          improvements
        );

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to improve slide content";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Generate content suggestions for current slide
   */
  const generateContentSuggestions = useCallback(
    async (topic: string) => {
      const suggestions = await generateSlideContent({
        topic,
        slideType: "bullet-points",
        length: "medium",
      });

      return suggestions.content;
    },
    [generateSlideContent]
  );

  return {
    // State
    isLoading,
    error,
    isConfigured,

    // Actions
    generateSlideContent,
    generatePresentationOutline,
    createAISlide,
    createAIPresentation,
    improveSlideContent,
    generateContentSuggestions,

    // Utilities
    clearError: () => setError(null),
  };
}
