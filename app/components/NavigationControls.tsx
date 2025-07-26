'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { usePresentation } from '@/app/contexts/PresentationContext';
import { ChevronLeft, ChevronRight, Play, Square, Home, ListEnd as End, SkipBack, SkipForward } from 'lucide-react';

export function NavigationControls() {
  const {
    presentation,
    nextSlide,
    previousSlide,
    dispatch,
    isPresentationMode,
  } = usePresentation();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!presentation) return;
      
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
        case 'Home':
          e.preventDefault();
          dispatch({ type: 'SET_CURRENT_SLIDE', payload: 0 });
          break;
        case 'End':
          e.preventDefault();
          dispatch({ type: 'SET_CURRENT_SLIDE', payload: presentation.slides.length - 1 });
          break;
        case 'Escape':
          if (isPresentationMode) {
            dispatch({ type: 'SET_PRESENTATION_MODE', payload: false });
          }
          break;
        case 'F5':
          e.preventDefault();
          dispatch({ type: 'SET_PRESENTATION_MODE', payload: true });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presentation, nextSlide, previousSlide, dispatch, isPresentationMode]);

  if (!presentation || isPresentationMode) return null;

  const currentSlide = presentation.currentSlideIndex + 1;
  const totalSlides = presentation.slides.length;
  const isFirstSlide = presentation.currentSlideIndex === 0;
  const isLastSlide = presentation.currentSlideIndex === presentation.slides.length - 1;

  const handlePresentationMode = () => {
    dispatch({ type: 'SET_PRESENTATION_MODE', payload: true });
  };

  const goToFirstSlide = () => {
    dispatch({ type: 'SET_CURRENT_SLIDE', payload: 0 });
  };

  const goToLastSlide = () => {
    dispatch({ type: 'SET_CURRENT_SLIDE', payload: presentation.slides.length - 1 });
  };

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Navigation Controls */}
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={goToFirstSlide}
            disabled={isFirstSlide}
            title="Go to first slide (Home)"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={previousSlide}
            disabled={isFirstSlide}
            title="Previous slide (←)"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={nextSlide}
            disabled={isLastSlide}
            title="Next slide (→ or Space)"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={goToLastSlide}
            disabled={isLastSlide}
            title="Go to last slide (End)"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Slide Counter */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {currentSlide} of {totalSlides}
          </span>
          
          {/* Present Button */}
          <Button size="sm" onClick={handlePresentationMode} title="Start presentation (F5)">
            <Play className="h-4 w-4 mr-2" />
            Present
          </Button>
        </div>
      </div>
      
      {/* Keyboard Shortcuts Info */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        Use ← → arrow keys or spacebar to navigate • F5 to present • Esc to exit
      </div>
    </div>
  );
}