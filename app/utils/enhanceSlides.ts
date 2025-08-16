import { Slide } from '@/app/types/presentation';
import { generateBackgroundElements, calculateContentBounds } from './backgroundElements';

export function enhanceSlideWithBackgroundElements(
  slide: Slide,
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  }
): Slide {
  // Skip if slide already has background elements
  if (slide.backgroundElements && slide.backgroundElements.length > 0) {
    return slide;
  }

  // Calculate content bounds based on existing text elements
  const contentBounds = calculateContentBounds(slide.elements);

  // Generate background elements based on slide type and content
  const backgroundElements = generateBackgroundElements({
    slideType: slide.type,
    topic: slide.elements.find(el => el.type === 'title')?.content || 'Slide Content',
    colors,
    contentBounds,
  });

  return {
    ...slide,
    backgroundElements,
  };
}

export function enhanceAllSlidesWithBackgroundElements(
  slides: Slide[],
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  }
): Slide[] {
  return slides.map(slide => enhanceSlideWithBackgroundElements(slide, colors));
}