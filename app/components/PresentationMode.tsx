'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { usePresentation } from '@/app/contexts/PresentationContext';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PresentationMode() {
  const {
    presentation,
    getCurrentSlide,
    nextSlide,
    previousSlide,
    dispatch,
    isPresentationMode,
  } = usePresentation();

  const currentSlide = getCurrentSlide();

  useEffect(() => {
    if (isPresentationMode) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [isPresentationMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresentationMode) return;
      
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          previousSlide();
          break;
        case 'Escape':
          dispatch({ type: 'SET_PRESENTATION_MODE', payload: false });
          break;
        case 'Home':
          e.preventDefault();
          dispatch({ type: 'SET_CURRENT_SLIDE', payload: 0 });
          break;
        case 'End':
          e.preventDefault();
          if (presentation) {
            dispatch({ type: 'SET_CURRENT_SLIDE', payload: presentation.slides.length - 1 });
          }
          break;
      }
    };

    if (isPresentationMode) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode, nextSlide, previousSlide, dispatch, presentation]);

  if (!isPresentationMode || !currentSlide || !presentation) return null;

  const exitPresentationMode = () => {
    dispatch({ type: 'SET_PRESENTATION_MODE', payload: false });
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Slide Container */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          className="relative w-full h-full max-w-6xl max-h-[80vh] shadow-2xl"
          style={{ 
            ...(currentSlide.background.type === 'gradient' && currentSlide.background.gradient
              ? { background: `linear-gradient(${currentSlide.background.gradient.direction}, ${currentSlide.background.gradient.colors.join(', ')})` }
              : { backgroundColor: currentSlide.background.color }
            ),
            aspectRatio: '16/9',
          }}
        >
          {currentSlide.elements.map((element) => (
            <div
              key={element.id}
              className="absolute whitespace-pre-wrap break-words"
              style={{
                left: `${(element.position.x / 1000) * 100}%`,
                top: `${(element.position.y / 600) * 100}%`,
                width: `${(element.size.width / 1000) * 100}%`,
                height: `${(element.size.height / 600) * 100}%`,
                fontSize: `${element.style.fontSize * 0.8}px`,
                color: element.style.color,
                fontWeight: element.style.fontWeight,
                textAlign: element.style.textAlign,
                fontFamily: element.style.fontFamily,
                lineHeight: element.style.lineHeight,
                display: 'flex',
                alignItems: element.type === 'title' ? 'center' : 'flex-start',
                justifyContent: element.style.textAlign === 'center' ? 'center' : 
                               element.style.textAlign === 'right' ? 'flex-end' : 'flex-start',
              }}
            >
              {element.content}
            </div>
          ))}
        </div>
      </div>

      {/* Controls Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-6">
        <div className="flex items-center justify-between text-white">
          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={previousSlide}
              disabled={presentation.currentSlideIndex === 0}
              className="text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <span className="text-sm">
              {presentation.currentSlideIndex + 1} / {presentation.slides.length}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={nextSlide}
              disabled={presentation.currentSlideIndex === presentation.slides.length - 1}
              className="text-white hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Exit Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={exitPresentationMode}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4 mr-2" />
            Exit (Esc)
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 text-white/70 text-sm">
        Use arrow keys or spacebar to navigate • Esc to exit
      </div>
    </div>
  );
}