"use client";

import React, { useState, useEffect } from 'react';
import { BackgroundElement } from '@/app/types/presentation';
import { cn } from '@/lib/utils';

interface BackgroundElementProps {
  element: BackgroundElement;
  zoom: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (updates: Partial<BackgroundElement>) => void;
  slideId?: string;
}

export function BackgroundElementRenderer({ 
  element, 
  zoom, 
  isSelected = false, 
  onSelect, 
  onUpdate,
  slideId 
}: BackgroundElementProps) {
  const { type, position, size, style, zIndex } = element;
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const elementStyle = {
    position: 'absolute' as const,
    left: position.x * zoom,
    top: position.y * zoom,
    width: size.width * zoom,
    height: size.height * zoom,
    zIndex: isSelected ? 100 : zIndex, // Bring selected elements to front
    opacity: style.opacity,
    transform: style.rotation ? `rotate(${style.rotation}deg)` : undefined,
    pointerEvents: onSelect ? 'auto' as const : 'none' as const,
    cursor: onSelect ? (isDragging ? 'grabbing' : 'grab') : 'default',
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onSelect || !onUpdate) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    onSelect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x * zoom,
      y: e.clientY - position.y * zoom,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !onUpdate) return;

      const newX = Math.max(
        0,
        Math.min(1000 - size.width, (e.clientX - dragStart.x) / zoom)
      );
      const newY = Math.max(
        0,
        Math.min(600 - size.height, (e.clientY - dragStart.y) / zoom)
      );

      onUpdate({
        position: { x: newX, y: newY },
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, element, onUpdate, zoom, size.width, size.height]);

  const renderElement = () => {
    const selectionStyle = isSelected ? {
      outline: `2px solid #3b82f6`,
      outlineOffset: '2px',
    } : {};

    switch (type) {
      case 'circle':
        return (
          <div
            style={{
              ...elementStyle,
              borderRadius: '50%',
              backgroundColor: style.fill ? style.color : 'transparent',
              border: !style.fill ? `${style.strokeWidth || 2}px solid ${style.color}` : 'none',
              ...selectionStyle,
            }}
            onMouseDown={handleMouseDown}
            className={cn(
              isSelected && 'ring-2 ring-blue-500 ring-offset-2',
              onSelect && 'hover:ring-1 hover:ring-blue-300 hover:ring-offset-1'
            )}
          />
        );

      case 'rectangle':
        return (
          <div
            style={{
              ...elementStyle,
              backgroundColor: style.fill ? style.color : 'transparent',
              border: !style.fill ? `${style.strokeWidth || 2}px solid ${style.color}` : 'none',
              ...selectionStyle,
            }}
            onMouseDown={handleMouseDown}
            className={cn(
              isSelected && 'ring-2 ring-blue-500 ring-offset-2',
              onSelect && 'hover:ring-1 hover:ring-blue-300 hover:ring-offset-1'
            )}
          />
        );

      case 'triangle':
        return (
          <div
            style={{
              position: 'absolute' as const,
              left: position.x * zoom,
              top: position.y * zoom,
              zIndex: isSelected ? 100 : zIndex,
              opacity: style.opacity,
              transform: style.rotation ? `rotate(${style.rotation}deg)` : undefined,
              pointerEvents: onSelect ? 'auto' as const : 'none' as const,
              cursor: onSelect ? (isDragging ? 'grabbing' : 'grab') : 'default',
              width: 0,
              height: 0,
              borderLeft: `${(size.width * zoom) / 2}px solid transparent`,
              borderRight: `${(size.width * zoom) / 2}px solid transparent`,
              borderBottom: `${size.height * zoom}px solid ${style.color}`,
              backgroundColor: 'transparent',
              ...selectionStyle,
            }}
            onMouseDown={handleMouseDown}
            className={cn(
              isSelected && 'ring-2 ring-blue-500 ring-offset-2',
              onSelect && 'hover:ring-1 hover:ring-blue-300 hover:ring-offset-1'
            )}
          />
        );

      case 'line':
        return (
          <div
            style={{
              position: 'absolute' as const,
              left: position.x * zoom,
              top: position.y * zoom,
              zIndex: isSelected ? 100 : zIndex,
              opacity: style.opacity,
              transform: style.rotation ? `rotate(${style.rotation}deg)` : undefined,
              pointerEvents: onSelect ? 'auto' as const : 'none' as const,
              cursor: onSelect ? (isDragging ? 'grabbing' : 'grab') : 'default',
              backgroundColor: style.color,
              width: (style.strokeWidth || 2) * zoom,
              height: size.height * zoom,
              ...selectionStyle,
            }}
            onMouseDown={handleMouseDown}
            className={cn(
              isSelected && 'ring-2 ring-blue-500 ring-offset-2',
              onSelect && 'hover:ring-1 hover:ring-blue-300 hover:ring-offset-1'
            )}
          />
        );

      case 'dots':
        const dotSize = 4 * zoom;
        const spacing = 12 * zoom;
        const dotsX = Math.max(1, Math.floor((size.width * zoom) / spacing));
        const dotsY = Math.max(1, Math.floor((size.height * zoom) / spacing));
        
        return (
          <div
            style={{
              position: 'absolute' as const,
              left: position.x * zoom,
              top: position.y * zoom,
              width: size.width * zoom,
              height: size.height * zoom,
              zIndex: isSelected ? 100 : zIndex,
              opacity: style.opacity,
              transform: style.rotation ? `rotate(${style.rotation}deg)` : undefined,
              pointerEvents: onSelect ? 'auto' as const : 'none' as const,
              cursor: onSelect ? (isDragging ? 'grabbing' : 'grab') : 'default',
              ...selectionStyle,
            }}
            onMouseDown={handleMouseDown}
            className={cn(
              isSelected && 'ring-2 ring-blue-500 ring-offset-2',
              onSelect && 'hover:ring-1 hover:ring-blue-300 hover:ring-offset-1'
            )}
          >
            {Array.from({ length: dotsY }, (_, y) =>
              Array.from({ length: dotsX }, (_, x) => (
                <div
                  key={`${x}-${y}`}
                  style={{
                    position: 'absolute',
                    left: x * spacing,
                    top: y * spacing,
                    width: dotSize,
                    height: dotSize,
                    borderRadius: '50%',
                    backgroundColor: style.color,
                  }}
                />
              ))
            )}
          </div>
        );

      case 'wave':
        return (
          <svg
            style={{
              position: 'absolute' as const,
              left: position.x * zoom,
              top: position.y * zoom,
              width: size.width * zoom,
              height: size.height * zoom,
              zIndex: isSelected ? 100 : zIndex,
              opacity: style.opacity,
              transform: style.rotation ? `rotate(${style.rotation}deg)` : undefined,
              pointerEvents: onSelect ? 'auto' as const : 'none' as const,
              cursor: onSelect ? (isDragging ? 'grabbing' : 'grab') : 'default',
              ...selectionStyle,
            }}
            viewBox={`0 0 ${size.width} ${size.height}`}
            fill="none"
            onMouseDown={handleMouseDown}
            className={cn(
              isSelected && 'ring-2 ring-blue-500 ring-offset-2',
              onSelect && 'hover:ring-1 hover:ring-blue-300 hover:ring-offset-1'
            )}
          >
            <path
              d={`M0,${size.height / 2} Q${size.width / 4},${size.height / 4} ${size.width / 2},${size.height / 2} T${size.width},${size.height / 2}`}
              stroke={style.color}
              strokeWidth={style.strokeWidth || 2}
              fill="none"
            />
          </svg>
        );

      case 'arrow':
        return (
          <svg
            style={{
              position: 'absolute' as const,
              left: position.x * zoom,
              top: position.y * zoom,
              width: size.width * zoom,
              height: size.height * zoom,
              zIndex: isSelected ? 100 : zIndex,
              opacity: style.opacity,
              transform: style.rotation ? `rotate(${style.rotation}deg)` : undefined,
              pointerEvents: onSelect ? 'auto' as const : 'none' as const,
              cursor: onSelect ? (isDragging ? 'grabbing' : 'grab') : 'default',
              ...selectionStyle,
            }}
            viewBox={`0 0 ${size.width} ${size.height}`}
            fill={style.fill ? style.color : 'none'}
            stroke={!style.fill ? style.color : 'none'}
            strokeWidth={style.strokeWidth || 2}
            onMouseDown={handleMouseDown}
            className={cn(
              isSelected && 'ring-2 ring-blue-500 ring-offset-2',
              onSelect && 'hover:ring-1 hover:ring-blue-300 hover:ring-offset-1'
            )}
          >
            <path
              d={`M10,${size.height / 2} L${size.width - 20},${size.height / 2} M${size.width - 30},${size.height / 2 - 10} L${size.width - 10},${size.height / 2} L${size.width - 30},${size.height / 2 + 10}`}
            />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderElement()}
      {/* Selection handles */}
      {isSelected && onSelect && (
        <>
          {/* Resize handles */}
          <div
            className="absolute bg-blue-500 border border-white cursor-se-resize"
            style={{
              left: (position.x + size.width - 3) * zoom,
              top: (position.y + size.height - 3) * zoom,
              width: 6 * zoom,
              height: 6 * zoom,
              zIndex: 101,
            }}
          />
          <div
            className="absolute bg-blue-500 border border-white cursor-ne-resize"
            style={{
              left: (position.x + size.width - 3) * zoom,
              top: (position.y - 3) * zoom,
              width: 6 * zoom,
              height: 6 * zoom,
              zIndex: 101,
            }}
          />
          <div
            className="absolute bg-blue-500 border border-white cursor-sw-resize"
            style={{
              left: (position.x - 3) * zoom,
              top: (position.y + size.height - 3) * zoom,
              width: 6 * zoom,
              height: 6 * zoom,
              zIndex: 101,
            }}
          />
          <div
            className="absolute bg-blue-500 border border-white cursor-nw-resize"
            style={{
              left: (position.x - 3) * zoom,
              top: (position.y - 3) * zoom,
              width: 6 * zoom,
              height: 6 * zoom,
              zIndex: 101,
            }}
          />
        </>
      )}
    </>
  );
}