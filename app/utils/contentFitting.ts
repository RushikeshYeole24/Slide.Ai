import { Template, TextElement } from '@/app/types/presentation';

export interface ContentFittingOptions {
  maxLines?: number;
  autoResize?: boolean;
  preserveAspectRatio?: boolean;
  minFontSize?: number;
  maxFontSize?: number;
}

export interface FittedContent {
  content: string;
  fontSize: number;
  lineHeight: number;
  truncated: boolean;
}

/**
 * Smart content fitting utility that adapts content to different template layouts
 */
export class ContentFitter {
  private static readonly DEFAULT_MIN_FONT_SIZE = 12;
  private static readonly DEFAULT_MAX_FONT_SIZE = 72;
  private static readonly DEFAULT_LINE_HEIGHT = 1.4;

  /**
   * Fit content to a template's content area
   */
  static fitContentToTemplate(
    template: Template,
    contentAreaId: string,
    newContent: string,
    options: ContentFittingOptions = {}
  ): FittedContent {
    const contentArea = template.contentAreas.find(area => area.id === contentAreaId);
    const element = template.elements.find(el => 
      el.type === contentArea?.type || 
      (contentArea?.type === 'title' && el.type === 'title') ||
      (contentArea?.type === 'subtitle' && el.type === 'subtitle') ||
      (contentArea?.type === 'body' && (el.type === 'body' || el.type === 'bullet'))
    );

    if (!contentArea || !element) {
      return {
        content: newContent,
        fontSize: 16,
        lineHeight: this.DEFAULT_LINE_HEIGHT,
        truncated: false
      };
    }

    const {
      maxLines = contentArea.maxLines,
      autoResize = contentArea.autoResize,
      minFontSize = this.DEFAULT_MIN_FONT_SIZE,
      maxFontSize = this.DEFAULT_MAX_FONT_SIZE
    } = options;

    let fittedContent = newContent;
    let fontSize = element.style.fontSize;
    let lineHeight = element.style.lineHeight;
    let truncated = false;

    // Handle line limits
    if (maxLines && contentArea.flexible) {
      const lines = newContent.split('\n');
      if (lines.length > maxLines) {
        fittedContent = lines.slice(0, maxLines).join('\n');
        truncated = true;
      }
    }

    // Handle auto-resizing
    if (autoResize && contentArea.flexible) {
      const estimatedLines = this.estimateLineCount(fittedContent, element.size.width, fontSize);
      const availableHeight = element.size.height;
      const maxAllowedLines = Math.floor(availableHeight / (fontSize * lineHeight));

      if (estimatedLines > maxAllowedLines) {
        // Try to reduce font size to fit content
        const targetFontSize = Math.max(
          minFontSize,
          Math.min(fontSize, availableHeight / (estimatedLines * lineHeight))
        );
        
        if (targetFontSize >= minFontSize) {
          fontSize = targetFontSize;
        } else {
          // If we can't fit with minimum font size, truncate content
          const maxLinesWithMinFont = Math.floor(availableHeight / (minFontSize * lineHeight));
          const lines = fittedContent.split('\n');
          if (lines.length > maxLinesWithMinFont) {
            fittedContent = lines.slice(0, maxLinesWithMinFont).join('\n');
            truncated = true;
          }
          fontSize = minFontSize;
        }
      }
    }

    return {
      content: fittedContent,
      fontSize: Math.round(fontSize),
      lineHeight,
      truncated
    };
  }

  /**
   * Adapt template layout based on content length and type
   */
  static adaptTemplateLayout(template: Template, contentMap: Record<string, string>): Template {
    const adaptedTemplate = JSON.parse(JSON.stringify(template)); // Deep clone

    // Analyze content to determine optimal layout adjustments
    const contentAnalysis = this.analyzeContent(contentMap);

    // Adjust element positions and sizes based on content
    adaptedTemplate.elements = adaptedTemplate.elements.map((element: any) => {
      const contentArea = template.contentAreas.find(area => 
        area.type === element.type || 
        (area.type === 'body' && element.type === 'bullet')
      );

      if (!contentArea || !contentArea.flexible) {
        return element;
      }

      const content = contentMap[contentArea.id] || element.content;
      const analysis = contentAnalysis[contentArea.id];

      if (analysis) {
        // Adjust height based on content length
        if (analysis.lineCount > 3 && element.size.height < 200) {
          element.size.height = Math.min(300, analysis.lineCount * element.style.fontSize * element.style.lineHeight);
        }

        // Adjust font size for very long or very short content
        if (analysis.wordCount < 10 && element.style.fontSize < 32) {
          element.style.fontSize = Math.min(48, element.style.fontSize * 1.5);
        } else if (analysis.wordCount > 100 && element.style.fontSize > 16) {
          element.style.fontSize = Math.max(14, element.style.fontSize * 0.8);
        }
      }

      return element;
    });

    return adaptedTemplate;
  }

  /**
   * Get optimal template suggestions based on content
   */
  static suggestTemplatesForContent(content: Record<string, string>): string[] {
    const analysis = this.analyzeContent(content);
    const suggestions: string[] = [];

    // Analyze content characteristics
    const totalWords = Object.values(analysis).reduce((sum, a) => sum + a.wordCount, 0);
    const hasLongContent = Object.values(analysis).some(a => a.lineCount > 5);
    const hasShortContent = Object.values(analysis).every(a => a.lineCount <= 2);
    const hasMultipleItems = Object.keys(content).length > 2;

    // Suggest templates based on content characteristics
    if (hasShortContent && !hasMultipleItems) {
      suggestions.push('quote-slide', 'section-header', 'thank-you');
    }

    if (hasLongContent) {
      suggestions.push('content-slide', 'learning-objectives', 'agenda-slide');
    }

    if (hasMultipleItems) {
      suggestions.push('two-column', 'swot-analysis', 'feature-comparison', 'business-metrics');
    }

    if (totalWords > 200) {
      suggestions.push('content-slide', 'problem-solution');
    }

    return suggestions;
  }

  /**
   * Estimate line count for given text and constraints
   */
  private static estimateLineCount(text: string, width: number, fontSize: number): number {
    const avgCharWidth = fontSize * 0.6; // Rough estimate for average character width
    const charsPerLine = Math.floor(width / avgCharWidth);
    
    const lines = text.split('\n');
    let totalLines = 0;

    lines.forEach(line => {
      if (line.length === 0) {
        totalLines += 1;
      } else {
        totalLines += Math.ceil(line.length / charsPerLine);
      }
    });

    return totalLines;
  }

  /**
   * Analyze content characteristics
   */
  private static analyzeContent(contentMap: Record<string, string>): Record<string, {
    wordCount: number;
    lineCount: number;
    avgWordsPerLine: number;
    hasLists: boolean;
  }> {
    const analysis: Record<string, any> = {};

    Object.entries(contentMap).forEach(([key, content]) => {
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      const words = content.split(/\s+/).filter(word => word.length > 0);
      const hasLists = /^[\s]*[•\-\*\d+\.]/m.test(content);

      analysis[key] = {
        wordCount: words.length,
        lineCount: lines.length,
        avgWordsPerLine: lines.length > 0 ? words.length / lines.length : 0,
        hasLists
      };
    });

    return analysis;
  }

  /**
   * Auto-format content based on template type
   */
  static autoFormatContent(content: string, templateType: string, elementType: string): string {
    let formatted = content.trim();

    // Auto-format based on template and element type
    if (elementType === 'bullet' && !formatted.match(/^[\s]*[•\-\*]/m)) {
      // Convert plain text to bullet points
      const lines = formatted.split('\n').filter(line => line.trim().length > 0);
      formatted = lines.map(line => `• ${line.trim()}`).join('\n');
    }

    if (templateType === 'quote' && elementType === 'body') {
      // Ensure quotes are properly formatted
      if (!formatted.startsWith('"') && !formatted.startsWith('"')) {
        formatted = `"${formatted}"`;
      }
    }

    if (templateType === 'title' && elementType === 'title') {
      // Title case formatting
      formatted = formatted.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    }

    return formatted;
  }
}

/**
 * Hook for using content fitting in React components
 */
export function useContentFitting() {
  const fitContent = (
    template: Template,
    contentAreaId: string,
    content: string,
    options?: ContentFittingOptions
  ) => {
    return ContentFitter.fitContentToTemplate(template, contentAreaId, content, options);
  };

  const adaptLayout = (template: Template, contentMap: Record<string, string>) => {
    return ContentFitter.adaptTemplateLayout(template, contentMap);
  };

  const suggestTemplates = (content: Record<string, string>) => {
    return ContentFitter.suggestTemplatesForContent(content);
  };

  const formatContent = (content: string, templateType: string, elementType: string) => {
    return ContentFitter.autoFormatContent(content, templateType, elementType);
  };

  return {
    fitContent,
    adaptLayout,
    suggestTemplates,
    formatContent
  };
}