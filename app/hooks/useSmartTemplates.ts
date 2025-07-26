import { useCallback } from "react";
import { usePresentation } from "@/app/contexts/PresentationContext";
import { templates } from "@/app/data/templates";
import { ContentFitter } from "@/app/utils/contentFitting";
import { Template } from "@/app/types/presentation";

export function useSmartTemplates() {
  const { presentation, dispatch, getCurrentSlide } = usePresentation();

  /**
   * Add a slide with smart content fitting
   */
  const addSmartSlide = useCallback(
    (templateId: string, contentMap?: Record<string, string>) => {
      const template = templates.find((t) => t.id === templateId);
      if (!template || !presentation) return;

      let adaptedTemplate = template;

      // If content is provided, adapt the template layout
      if (contentMap) {
        adaptedTemplate = ContentFitter.adaptTemplateLayout(
          template,
          contentMap
        );
      }

      // Create slide elements with fitted content
      const elements = adaptedTemplate.elements.map((element, index) => {
        const contentArea = adaptedTemplate.contentAreas.find(
          (area) =>
            area.type === element.type ||
            (area.type === "body" && element.type === "bullet")
        );

        let content = element.content;
        let style = { ...element.style };

        // Apply content fitting if content is provided
        if (contentMap && contentArea) {
          const newContent = contentMap[contentArea.id] || element.content;
          const fittedContent = ContentFitter.fitContentToTemplate(
            adaptedTemplate,
            contentArea.id,
            newContent
          );

          content = fittedContent.content;
          style.fontSize = fittedContent.fontSize;
          style.lineHeight = fittedContent.lineHeight;

          // Auto-format content based on template type
          content = ContentFitter.autoFormatContent(
            content,
            template.type,
            element.type
          );
        }

        return {
          id: `element-${Date.now()}-${index}`,
          type: element.type,
          content,
          position: element.position,
          size: element.size,
          style,
        };
      });

      const newSlide = {
        id: `slide-${Date.now()}`,
        type: adaptedTemplate.type,
        background: adaptedTemplate.background,
        elements,
        template: templateId,
      };

      dispatch({ type: "ADD_SLIDE", payload: { slide: newSlide } });
      return newSlide;
    },
    [presentation, dispatch]
  );

  /**
   * Get template suggestions based on current slide content
   */
  const getTemplateSuggestions = useCallback(() => {
    const currentSlide = getCurrentSlide();
    if (!currentSlide) return [];

    // Extract content from current slide
    const contentMap: Record<string, string> = {};
    currentSlide.elements.forEach((element, index) => {
      contentMap[`content-${index}`] = element.content;
    });

    return ContentFitter.suggestTemplatesForContent(contentMap);
  }, [getCurrentSlide]);

  /**
   * Apply smart content fitting to current slide
   */
  const applySmartFitting = useCallback(
    (templateId?: string) => {
      const currentSlide = getCurrentSlide();
      if (!currentSlide) return;

      const targetTemplateId = templateId || currentSlide.template;
      const template = templates.find((t) => t.id === targetTemplateId);
      if (!template) return;

      // Extract current content
      const contentMap: Record<string, string> = {};
      currentSlide.elements.forEach((element, index) => {
        const contentArea = template.contentAreas[index];
        if (contentArea) {
          contentMap[contentArea.id] = element.content;
        }
      });

      // Adapt template and apply fitting
      const adaptedTemplate = ContentFitter.adaptTemplateLayout(
        template,
        contentMap
      );

      // Update slide elements with fitted content
      currentSlide.elements.forEach((element, index) => {
        const contentArea = adaptedTemplate.contentAreas[index];
        if (!contentArea) return;

        const fittedContent = ContentFitter.fitContentToTemplate(
          adaptedTemplate,
          contentArea.id,
          element.content
        );

        const updatedElement = {
          ...element,
          content: fittedContent.content,
          style: {
            ...element.style,
            fontSize: fittedContent.fontSize,
            lineHeight: fittedContent.lineHeight,
          },
          position:
            adaptedTemplate.elements[index]?.position || element.position,
          size: adaptedTemplate.elements[index]?.size || element.size,
        };

        dispatch({
          type: "UPDATE_ELEMENT",
          payload: {
            slideId: currentSlide.id,
            elementId: element.id,
            updates: updatedElement,
          },
        });
      });

      // Update slide background if template changed
      if (templateId && templateId !== currentSlide.template) {
        dispatch({
          type: "UPDATE_SLIDE",
          payload: {
            id: currentSlide.id,
            updates: {
              background: adaptedTemplate.background,
              template: templateId,
            },
          },
        });
      }
    },
    [getCurrentSlide, dispatch]
  );

  /**
   * Auto-optimize current slide content
   */
  const optimizeSlideContent = useCallback(() => {
    const currentSlide = getCurrentSlide();
    if (!currentSlide) return;

    currentSlide.elements.forEach((element) => {
      // Auto-format content
      const formattedContent = ContentFitter.autoFormatContent(
        element.content,
        currentSlide.type,
        element.type
      );

      if (formattedContent !== element.content) {
        dispatch({
          type: "UPDATE_ELEMENT",
          payload: {
            slideId: currentSlide.id,
            elementId: element.id,
            updates: {
              content: formattedContent,
            },
          },
        });
      }
    });
  }, [getCurrentSlide, dispatch]);

  /**
   * Get templates filtered by category with smart scoring
   */
  const getSmartTemplateRecommendations = useCallback(
    (category?: string) => {
      const currentSlide = getCurrentSlide();
      let filteredTemplates = templates;

      // Filter by category if provided
      if (category && category !== "All") {
        filteredTemplates = templates.filter((t) => t.category === category);
      }

      // If we have a current slide, score templates based on content compatibility
      if (currentSlide) {
        const contentMap: Record<string, string> = {};
        currentSlide.elements.forEach((element, index) => {
          contentMap[`content-${index}`] = element.content;
        });

        const suggestions =
          ContentFitter.suggestTemplatesForContent(contentMap);

        // Sort templates by relevance score
        return filteredTemplates.sort((a, b) => {
          const aScore = suggestions.includes(a.id) ? 1 : 0;
          const bScore = suggestions.includes(b.id) ? 1 : 0;
          return bScore - aScore;
        });
      }

      return filteredTemplates;
    },
    [getCurrentSlide]
  );

  return {
    addSmartSlide,
    getTemplateSuggestions,
    applySmartFitting,
    optimizeSlideContent,
    getSmartTemplateRecommendations,
  };
}
