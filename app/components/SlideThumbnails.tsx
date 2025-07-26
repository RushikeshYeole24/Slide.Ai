'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { usePresentation } from '@/app/contexts/PresentationContext';
import { Plus, Trash2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SlideThumbnails() {
  const {
    presentation,
    dispatch,
    duplicateSlide,
  } = usePresentation();

  if (!presentation) return null;

  const handleSlideClick = (index: number) => {
    dispatch({ type: 'SET_CURRENT_SLIDE', payload: index });
  };

  const handleDeleteSlide = (slideId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (presentation.slides.length > 1) {
      dispatch({ type: 'DELETE_SLIDE', payload: slideId });
    }
  };

  const handleDuplicateSlide = (slideId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateSlide(slideId);
  };

  const addBlankSlide = () => {
    const newSlide = {
      id: `slide-${Date.now()}`,
      type: 'blank' as const,
      background: { type: 'solid' as const, color: '#ffffff' },
      template: 'blank',
      elements: [],
    };
    dispatch({ type: 'ADD_SLIDE', payload: { slide: newSlide } });
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Slides</h3>
          <span className="text-sm text-gray-500">
            {presentation.slides.length} slide{presentation.slides.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Slide List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {presentation.slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              'relative group cursor-pointer rounded-lg border-2 transition-all',
              index === presentation.currentSlideIndex
                ? 'border-blue-500 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            )}
            onClick={() => handleSlideClick(index)}
          >
            {/* Slide Thumbnail */}
            <div
              className="aspect-video w-full rounded-md overflow-hidden"
              style={{ backgroundColor: slide.background.color }}
            >
              <div className="relative h-full p-2 text-xs">
                {slide.elements.slice(0, 3).map((element, i) => (
                  <div
                    key={element.id}
                    className="absolute truncate"
                    style={{
                      left: `${(element.position.x / 1000) * 100}%`,
                      top: `${(element.position.y / 600) * 100}%`,
                      width: `${(element.size.width / 1000) * 100}%`,
                      fontSize: `${Math.max(6, element.style.fontSize * 0.12)}px`,
                      color: element.style.color,
                      fontWeight: element.style.fontWeight,
                    }}
                  >
                    {element.content.split('\n')[0]}
                  </div>
                ))}
              </div>
            </div>

            {/* Slide Number */}
            <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
              {index + 1}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
              <Button
                size="sm"
                variant="secondary"
                className="h-6 w-6 p-0"
                onClick={(e) => handleDuplicateSlide(slide.id, e)}
                title="Duplicate slide"
              >
                <Copy className="h-3 w-3" />
              </Button>
              
              {presentation.slides.length > 1 && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-6 w-6 p-0"
                  onClick={(e) => handleDeleteSlide(slide.id, e)}
                  title="Delete slide"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Slide Type Badge */}
            <div className="absolute bottom-1 left-1 bg-white bg-opacity-90 text-xs px-1 rounded capitalize">
              {slide.type}
            </div>
          </div>
        ))}
      </div>

      {/* Add Slide Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={addBlankSlide}
          variant="outline"
          className="w-full"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Slide
        </Button>
      </div>
    </div>
  );
}