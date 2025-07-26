export interface TextElement {
  id: string;
  type: 'title' | 'subtitle' | 'body' | 'bullet';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: {
    fontSize: number;
    color: string;
    fontWeight: string;
    textAlign: 'left' | 'center' | 'right' | 'justify';
    fontFamily: string;
    lineHeight: number;
  };
}

export interface SlideBackground {
  type: 'solid' | 'gradient';
  color: string;
  gradient?: {
    type: 'linear' | 'radial';
    direction: string;
    colors: string[];
  };
}

export interface Slide {
  id: string;
  type: 'title' | 'content' | 'two-column' | 'image' | 'quote' | 'section' | 'thank-you' | 'blank';
  background: SlideBackground;
  elements: TextElement[];
  template: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
  theme: Theme;
  currentSlideIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id: string;
  name: string;
  type: Slide['type'];
  description: string;
  category: 'Business' | 'Education' | 'Marketing' | 'Creative' | 'Technology' | 'Medical' | 'Finance';
  tags: string[];
  elements: Omit<TextElement, 'id'>[];
  background: SlideBackground;
  layout: 'single-column' | 'two-column' | 'three-column' | 'grid' | 'centered' | 'split' | 'hero';
  contentAreas: {
    id: string;
    type: 'title' | 'subtitle' | 'body' | 'bullet' | 'image' | 'chart';
    flexible: boolean;
    maxLines?: number;
    autoResize: boolean;
  }[];
}