import { BackgroundElement } from "@/app/types/presentation";

export interface BackgroundElementsConfig {
  slideType: string;
  topic: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  contentBounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

// Safe zones where text typically appears
const DEFAULT_CONTENT_BOUNDS = {
  minX: 50,
  maxX: 950,
  minY: 50,
  maxY: 550,
};

// Generate background elements that complement the slide content
export function generateBackgroundElements(
  config: BackgroundElementsConfig
): BackgroundElement[] {
  const {
    slideType,
    topic,
    colors,
    contentBounds = DEFAULT_CONTENT_BOUNDS,
  } = config;
  const elements: BackgroundElement[] = [];

  // Helper function to check if position overlaps with content area
  const isInContentArea = (
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    return !(
      x + width < contentBounds.minX ||
      x > contentBounds.maxX ||
      y + height < contentBounds.minY ||
      y > contentBounds.maxY
    );
  };

  // Helper function to generate safe positions within slide bounds
  const getSafePosition = (width: number, height: number, attempts = 10) => {
    for (let i = 0; i < attempts; i++) {
      const x = Math.max(
        0,
        Math.min(1000 - width, Math.random() * (1000 - width))
      );
      const y = Math.max(
        0,
        Math.min(600 - height, Math.random() * (600 - height))
      );

      if (!isInContentArea(x, y, width, height)) {
        return { x, y };
      }
    }

    // Fallback to safe corners within slide bounds
    const corners = [
      { x: 20, y: 20 },
      { x: Math.max(20, 1000 - width - 20), y: 20 },
      { x: 20, y: Math.max(20, 600 - height - 20) },
      {
        x: Math.max(20, 1000 - width - 20),
        y: Math.max(20, 600 - height - 20),
      },
    ];

    return corners[Math.floor(Math.random() * corners.length)];
  };

  // Helper function to make colors brighter
  const brightenColor = (color: string, factor: number = 0.3) => {
    // Convert hex to RGB
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Brighten by mixing with white
    const newR = Math.min(255, Math.round(r + (255 - r) * factor));
    const newG = Math.min(255, Math.round(g + (255 - g) * factor));
    const newB = Math.min(255, Math.round(b + (255 - b) * factor));

    return `#${newR.toString(16).padStart(2, "0")}${newG
      .toString(16)
      .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  };

  // Generate elements based on slide type
  switch (slideType) {
    case "title":
      // Title slides get elegant, minimal decorative elements
      elements.push(
        // Large subtle circle in corner - ensure it stays within bounds
        {
          id: `bg-circle-${Date.now()}`,
          type: "circle",
          position: {
            x: Math.min(800, 1000 - 200),
            y: Math.min(450, 600 - 150),
          },
          size: { width: 200, height: 150 },
          style: {
            color: brightenColor(colors.primary, 0.4),
            opacity: 0.2,
            fill: true,
          },
          zIndex: -2,
        },
        // Small accent dots
        {
          id: `bg-dots-${Date.now() + 1}`,
          type: "dots",
          position: { x: 50, y: 100 },
          size: { width: 100, height: 50 },
          style: {
            color: brightenColor(colors.accent, 0.3),
            opacity: 0.4,
          },
          zIndex: -1,
        }
      );
      break;

    case "content":
    case "bullet-points":
      // Content slides get supportive geometric elements
      elements.push(
        // Subtle rectangle frame - ensure within bounds
        {
          id: `bg-rect-${Date.now()}`,
          type: "rectangle",
          position: { x: 20, y: 20 },
          size: { width: 8, height: Math.min(560, 600 - 40) },
          style: {
            color: brightenColor(colors.primary, 0.3),
            opacity: 0.3,
            fill: true,
          },
          zIndex: -2,
        },
        // Corner triangle - ensure within bounds
        {
          id: `bg-triangle-${Date.now() + 1}`,
          type: "triangle",
          position: {
            x: Math.min(850, 1000 - 120),
            y: Math.min(500, 600 - 80),
          },
          size: { width: 120, height: 80 },
          style: {
            color: brightenColor(colors.secondary, 0.4),
            opacity: 0.25,
            fill: true,
          },
          zIndex: -1,
        }
      );
      break;

    case "conclusion":
      // Conclusion slides get dynamic, forward-moving elements
      elements.push(
        // Arrow pointing forward - ensure within bounds
        {
          id: `bg-arrow-${Date.now()}`,
          type: "arrow",
          position: {
            x: Math.min(800, 1000 - 150),
            y: Math.min(500, 600 - 60),
          },
          size: { width: 150, height: 60 },
          style: {
            color: brightenColor(colors.accent, 0.3),
            opacity: 0.3,
            fill: true,
          },
          zIndex: -1,
        },
        // Wave element - ensure within bounds
        {
          id: `bg-wave-${Date.now() + 1}`,
          type: "wave",
          position: { x: 0, y: Math.min(550, 600 - 50) },
          size: { width: 300, height: 50 },
          style: {
            color: brightenColor(colors.primary, 0.2),
            opacity: 0.2,
            strokeWidth: 3,
          },
          zIndex: -2,
        }
      );
      break;

    case "agenda":
    case "overview":
      // Agenda slides get organized, structured elements
      elements.push(
        // Grid-like dots - ensure within bounds
        {
          id: `bg-dots-grid-${Date.now()}`,
          type: "dots",
          position: { x: 50, y: 50 },
          size: { width: 30, height: Math.min(500, 600 - 100) },
          style: {
            color: brightenColor(colors.secondary, 0.3),
            opacity: 0.3,
          },
          zIndex: -2,
        },
        // Clean lines - ensure within bounds
        {
          id: `bg-line-${Date.now() + 1}`,
          type: "line",
          position: { x: Math.min(900, 1000 - 80), y: 100 },
          size: { width: 80, height: Math.min(400, 600 - 200) },
          style: {
            color: brightenColor(colors.primary, 0.2),
            opacity: 0.25,
            strokeWidth: 2,
          },
          zIndex: -1,
        }
      );
      break;

    default:
      // Default elements for any other slide type
      const position1 = getSafePosition(100, 100);
      const position2 = getSafePosition(80, 80);

      elements.push(
        {
          id: `bg-circle-default-${Date.now()}`,
          type: "circle",
          position: position1,
          size: { width: 100, height: 100 },
          style: {
            color: brightenColor(colors.primary, 0.3),
            opacity: 0.2,
            fill: true,
          },
          zIndex: -2,
        },
        {
          id: `bg-rect-default-${Date.now() + 1}`,
          type: "rectangle",
          position: position2,
          size: { width: 80, height: 80 },
          style: {
            color: brightenColor(colors.accent, 0.4),
            opacity: 0.18,
            fill: true,
            rotation: 45,
          },
          zIndex: -1,
        }
      );
  }

  // Add topic-specific elements based on keywords
  const topicLower = topic.toLowerCase();

  if (
    topicLower.includes("tech") ||
    topicLower.includes("digital") ||
    topicLower.includes("innovation")
  ) {
    const position = getSafePosition(60, 60);
    elements.push({
      id: `bg-tech-${Date.now()}`,
      type: "dots",
      position,
      size: { width: 60, height: 60 },
      style: {
        color: brightenColor(colors.accent, 0.3),
        opacity: 0.35,
      },
      zIndex: -1,
    });
  }

  if (
    topicLower.includes("growth") ||
    topicLower.includes("success") ||
    topicLower.includes("progress")
  ) {
    const position = getSafePosition(100, 40);
    elements.push({
      id: `bg-growth-${Date.now()}`,
      type: "arrow",
      position,
      size: { width: 100, height: 40 },
      style: {
        color: brightenColor(colors.primary, 0.2),
        opacity: 0.25,
        fill: true,
      },
      zIndex: -1,
    });
  }

  return elements;
}

// Update content bounds based on existing text elements
export function calculateContentBounds(
  textElements: any[]
): typeof DEFAULT_CONTENT_BOUNDS {
  if (textElements.length === 0) return DEFAULT_CONTENT_BOUNDS;

  let minX = 1000,
    maxX = 0,
    minY = 600,
    maxY = 0;

  textElements.forEach((element) => {
    const { position, size } = element;
    minX = Math.min(minX, position.x - 20); // Add padding
    maxX = Math.max(maxX, position.x + size.width + 20);
    minY = Math.min(minY, position.y - 20);
    maxY = Math.max(maxY, position.y + size.height + 20);
  });

  return {
    minX: Math.max(0, minX),
    maxX: Math.min(1000, maxX),
    minY: Math.max(0, minY),
    maxY: Math.min(600, maxY),
  };
}
