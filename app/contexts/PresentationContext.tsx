'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Presentation, Slide, TextElement, Theme, Template } from '@/app/types/presentation';
import { saveToLocalStorage, loadFromLocalStorage } from '@/app/utils/localStorage';

interface PresentationState {
  presentation: Presentation | null;
  isLoading: boolean;
  isEditing: boolean;
  selectedElementId: string | null;
  isPresentationMode: boolean;
  zoom: number;
}

type PresentationAction =
  | { type: 'SET_PRESENTATION'; payload: Presentation | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_SLIDE'; payload: { slide: Slide; index?: number } }
  | { type: 'DELETE_SLIDE'; payload: string }
  | { type: 'UPDATE_SLIDE'; payload: { id: string; updates: Partial<Slide> } }
  | { type: 'REORDER_SLIDES'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'SET_CURRENT_SLIDE'; payload: number }
  | { type: 'ADD_ELEMENT'; payload: { slideId: string; element: TextElement } }
  | { type: 'UPDATE_ELEMENT'; payload: { slideId: string; elementId: string; updates: Partial<TextElement> } }
  | { type: 'DELETE_ELEMENT'; payload: { slideId: string; elementId: string } }
  | { type: 'SET_SELECTED_ELEMENT'; payload: string | null }
  | { type: 'SET_EDITING'; payload: boolean }
  | { type: 'SET_PRESENTATION_MODE'; payload: boolean }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'UPDATE_THEME'; payload: Theme };

const initialState: PresentationState = {
  presentation: null,
  isLoading: false,
  isEditing: false,
  selectedElementId: null,
  isPresentationMode: false,
  zoom: 1,
};

const defaultTheme: Theme = {
  id: 'professional-blue',
  name: 'Professional Blue',
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#ea580c',
    background: '#ffffff',
    text: '#1e293b',
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
};

function presentationReducer(state: PresentationState, action: PresentationAction): PresentationState {
  switch (action.type) {
    case 'SET_PRESENTATION':
      return { ...state, presentation: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'ADD_SLIDE':
      if (!state.presentation) return state;
      const newSlides = [...state.presentation.slides];
      const insertIndex = action.payload.index ?? newSlides.length;
      newSlides.splice(insertIndex, 0, action.payload.slide);
      return {
        ...state,
        presentation: {
          ...state.presentation,
          slides: newSlides,
          updatedAt: new Date(),
        },
      };
    
    case 'DELETE_SLIDE':
      if (!state.presentation) return state;
      const filteredSlides = state.presentation.slides.filter(slide => slide.id !== action.payload);
      const newCurrentIndex = Math.min(state.presentation.currentSlideIndex, filteredSlides.length - 1);
      return {
        ...state,
        presentation: {
          ...state.presentation,
          slides: filteredSlides,
          currentSlideIndex: Math.max(0, newCurrentIndex),
          updatedAt: new Date(),
        },
      };
    
    case 'UPDATE_SLIDE':
      if (!state.presentation) return state;
      return {
        ...state,
        presentation: {
          ...state.presentation,
          slides: state.presentation.slides.map(slide =>
            slide.id === action.payload.id
              ? { ...slide, ...action.payload.updates }
              : slide
          ),
          updatedAt: new Date(),
        },
      };
    
    case 'REORDER_SLIDES':
      if (!state.presentation) return state;
      const slides = [...state.presentation.slides];
      const [movedSlide] = slides.splice(action.payload.fromIndex, 1);
      slides.splice(action.payload.toIndex, 0, movedSlide);
      return {
        ...state,
        presentation: {
          ...state.presentation,
          slides,
          updatedAt: new Date(),
        },
      };
    
    case 'SET_CURRENT_SLIDE':
      if (!state.presentation) return state;
      const validIndex = Math.max(0, Math.min(action.payload, state.presentation.slides.length - 1));
      return {
        ...state,
        presentation: {
          ...state.presentation,
          currentSlideIndex: validIndex,
        },
      };
    
    case 'ADD_ELEMENT':
      if (!state.presentation) return state;
      return {
        ...state,
        presentation: {
          ...state.presentation,
          slides: state.presentation.slides.map(slide =>
            slide.id === action.payload.slideId
              ? { ...slide, elements: [...slide.elements, action.payload.element] }
              : slide
          ),
          updatedAt: new Date(),
        },
      };
    
    case 'UPDATE_ELEMENT':
      if (!state.presentation) return state;
      return {
        ...state,
        presentation: {
          ...state.presentation,
          slides: state.presentation.slides.map(slide =>
            slide.id === action.payload.slideId
              ? {
                  ...slide,
                  elements: slide.elements.map(element =>
                    element.id === action.payload.elementId
                      ? { ...element, ...action.payload.updates }
                      : element
                  ),
                }
              : slide
          ),
          updatedAt: new Date(),
        },
      };
    
    case 'DELETE_ELEMENT':
      if (!state.presentation) return state;
      return {
        ...state,
        presentation: {
          ...state.presentation,
          slides: state.presentation.slides.map(slide =>
            slide.id === action.payload.slideId
              ? {
                  ...slide,
                  elements: slide.elements.filter(element => element.id !== action.payload.elementId),
                }
              : slide
          ),
          updatedAt: new Date(),
        },
      };
    
    case 'SET_SELECTED_ELEMENT':
      return { ...state, selectedElementId: action.payload };
    
    case 'SET_EDITING':
      return { ...state, isEditing: action.payload };
    
    case 'SET_PRESENTATION_MODE':
      return { ...state, isPresentationMode: action.payload };
    
    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.25, Math.min(2, action.payload)) };
    
    case 'UPDATE_THEME':
      if (!state.presentation) return state;
      return {
        ...state,
        presentation: {
          ...state.presentation,
          theme: action.payload,
          updatedAt: new Date(),
        },
      };
    
    default:
      return state;
  }
}

interface PresentationContextType extends PresentationState {
  dispatch: React.Dispatch<PresentationAction>;
  createNewPresentation: (title: string) => void;
  savePresentation: () => void;
  loadPresentation: (id: string) => void;
  getCurrentSlide: () => Slide | null;
  nextSlide: () => void;
  previousSlide: () => void;
  duplicateSlide: (slideId: string) => void;
  addSlideFromTemplate: (template: Template, index?: number) => void;
}

const PresentationContext = createContext<PresentationContextType | undefined>(undefined);

export function PresentationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(presentationReducer, initialState);

  // Auto-save functionality
  useEffect(() => {
    if (state.presentation) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage('current-presentation', state.presentation);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [state.presentation]);

  // Load presentation on mount
  useEffect(() => {
    const saved = loadFromLocalStorage<Presentation>('current-presentation');
    if (saved) {
      dispatch({ type: 'SET_PRESENTATION', payload: saved });
    }
  }, []);

  const createNewPresentation = (title: string) => {
    const newPresentation: Presentation = {
      id: Date.now().toString(),
      title,
      slides: [],
      theme: defaultTheme,
      currentSlideIndex: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'SET_PRESENTATION', payload: newPresentation });
  };

  const savePresentation = () => {
    if (state.presentation) {
      saveToLocalStorage('current-presentation', state.presentation);
      // Also save to presentations list
      const presentations = loadFromLocalStorage<Presentation[]>('presentations') || [];
      const existingIndex = presentations.findIndex(p => p.id === state.presentation!.id);
      if (existingIndex >= 0) {
        presentations[existingIndex] = state.presentation;
      } else {
        presentations.push(state.presentation);
      }
      saveToLocalStorage('presentations', presentations);
    }
  };

  const loadPresentation = (id: string) => {
    const presentations = loadFromLocalStorage<Presentation[]>('presentations') || [];
    const presentation = presentations.find(p => p.id === id);
    if (presentation) {
      dispatch({ type: 'SET_PRESENTATION', payload: presentation });
    }
  };

  const getCurrentSlide = (): Slide | null => {
    if (!state.presentation || state.presentation.slides.length === 0) return null;
    return state.presentation.slides[state.presentation.currentSlideIndex] || null;
  };

  const nextSlide = () => {
    if (state.presentation && state.presentation.currentSlideIndex < state.presentation.slides.length - 1) {
      dispatch({ type: 'SET_CURRENT_SLIDE', payload: state.presentation.currentSlideIndex + 1 });
    }
  };

  const previousSlide = () => {
    if (state.presentation && state.presentation.currentSlideIndex > 0) {
      dispatch({ type: 'SET_CURRENT_SLIDE', payload: state.presentation.currentSlideIndex - 1 });
    }
  };

  const duplicateSlide = (slideId: string) => {
    if (!state.presentation) return;
    const slide = state.presentation.slides.find(s => s.id === slideId);
    if (slide) {
      const duplicatedSlide: Slide = {
        ...slide,
        id: `${slide.id}-copy-${Date.now()}`,
        elements: slide.elements.map(el => ({
          ...el,
          id: `${el.id}-copy-${Date.now()}`,
        })),
      };
      const slideIndex = state.presentation.slides.findIndex(s => s.id === slideId);
      dispatch({ type: 'ADD_SLIDE', payload: { slide: duplicatedSlide, index: slideIndex + 1 } });
    }
  };

  const addSlideFromTemplate = (template: Template, index?: number) => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      type: template.type,
      background: template.background,
      template: template.id,
      elements: template.elements.map((el, i) => ({
        ...el,
        id: `element-${Date.now()}-${i}`,
      })),
    };
    dispatch({ type: 'ADD_SLIDE', payload: { slide: newSlide, index } });
  };

  const value: PresentationContextType = {
    ...state,
    dispatch,
    createNewPresentation,
    savePresentation,
    loadPresentation,
    getCurrentSlide,
    nextSlide,
    previousSlide,
    duplicateSlide,
    addSlideFromTemplate,
  };

  return (
    <PresentationContext.Provider value={value}>
      {children}
    </PresentationContext.Provider>
  );
}

export function usePresentation() {
  const context = useContext(PresentationContext);
  if (context === undefined) {
    throw new Error('usePresentation must be used within a PresentationProvider');
  }
  return context;
}