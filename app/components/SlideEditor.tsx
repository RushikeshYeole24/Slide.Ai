"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePresentation } from "@/app/contexts/PresentationContext";
import { TextElement } from "@/app/types/presentation";
import { cn } from "@/lib/utils";

interface EditableElementProps {
  element: TextElement;
  slideId: string;
  isSelected: boolean;
  onSelect: () => void;
  zoom: number;
}

function EditableElement({
  element,
  slideId,
  isSelected,
  onSelect,
  zoom,
}: EditableElementProps) {
  const { dispatch } = usePresentation();
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }, 0);
  };

  const handleContentChange = (content: string) => {
    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        slideId,
        elementId: element.id,
        updates: { content },
      },
    });
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
    }
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;

    onSelect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.position.x * zoom,
      y: e.clientY - element.position.y * zoom,
    });

    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = Math.max(
        0,
        Math.min(1000 - element.size.width, (e.clientX - dragStart.x) / zoom)
      );
      const newY = Math.max(
        0,
        Math.min(600 - element.size.height, (e.clientY - dragStart.y) / zoom)
      );

      dispatch({
        type: "UPDATE_ELEMENT",
        payload: {
          slideId,
          elementId: element.id,
          updates: {
            position: { x: newX, y: newY },
          },
        },
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, element, slideId, dispatch, zoom]);

  const elementStyle = {
    left: element.position.x * zoom,
    top: element.position.y * zoom,
    width: element.size.width * zoom,
    height: element.size.height * zoom,
    fontSize: element.style.fontSize * zoom,
    color: element.style.color,
    fontWeight: element.style.fontWeight,
    textAlign: element.style.textAlign,
    fontFamily: element.style.fontFamily,
    lineHeight: element.style.lineHeight,
  };

  return (
    <div
      className={cn(
        "absolute cursor-move border-2 transition-all",
        isSelected
          ? "border-blue-500"
          : "border-transparent hover:border-gray-300",
        isDragging && "cursor-grabbing"
      )}
      style={elementStyle}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={element.content}
          onChange={(e) => handleContentChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full h-full bg-transparent border-none outline-none resize-none"
          style={{
            fontSize: element.style.fontSize * zoom,
            color: element.style.color,
            fontWeight: element.style.fontWeight,
            textAlign: element.style.textAlign,
            fontFamily: element.style.fontFamily,
            lineHeight: element.style.lineHeight,
          }}
        />
      ) : (
        <div
          className="w-full h-full overflow-hidden whitespace-pre-wrap break-words p-1"
          style={{
            fontSize: element.style.fontSize * zoom,
            color: element.style.color,
            fontWeight: element.style.fontWeight,
            textAlign: element.style.textAlign,
            fontFamily: element.style.fontFamily,
            lineHeight: element.style.lineHeight,
          }}
        >
          {element.content}
        </div>
      )}

      {isSelected && !isEditing && (
        <>
          {/* Resize handles */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-se-resize" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-ne-resize" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-sw-resize" />
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nw-resize" />
        </>
      )}
    </div>
  );
}

export function SlideEditor() {
  const { getCurrentSlide, presentation, selectedElementId, dispatch, zoom } =
    usePresentation();

  const currentSlide = getCurrentSlide();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Monitor container width to ensure slide fits
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current?.parentElement) {
        const parentWidth = containerRef.current.parentElement.clientWidth;
        setContainerWidth(parentWidth - 32); // Account for padding (p-4 = 16px each side)
      }
    };

    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);

    // Use ResizeObserver for more accurate container size tracking
    const resizeObserver = new ResizeObserver(updateContainerWidth);
    if (containerRef.current?.parentElement) {
      resizeObserver.observe(containerRef.current.parentElement);
    }

    return () => {
      window.removeEventListener("resize", updateContainerWidth);
      resizeObserver.disconnect();
    };
  }, []);

  // Handle keyboard events for element deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle delete if an element is selected and we're not editing
      if (
        selectedElementId &&
        currentSlide &&
        (e.key === "Delete" || e.key === "Backspace")
      ) {
        // Check if we're not currently editing text (no active input/textarea)
        const activeElement = document.activeElement;
        const isEditingText =
          activeElement?.tagName === "TEXTAREA" ||
          activeElement?.tagName === "INPUT" ||
          (activeElement as HTMLElement)?.contentEditable === "true";

        if (!isEditingText) {
          e.preventDefault();
          dispatch({
            type: "DELETE_ELEMENT",
            payload: {
              slideId: currentSlide.id,
              elementId: selectedElementId,
            },
          });
          // Clear selection after deletion
          dispatch({ type: "SET_SELECTED_ELEMENT", payload: null });
        }
      }
    };

    // Add event listener to document to capture keyboard events globally
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedElementId, currentSlide, dispatch]);

  const handleSlideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      dispatch({ type: "SET_SELECTED_ELEMENT", payload: null });
    }
  };

  const addTextElement = (e: React.MouseEvent) => {
    if (!currentSlide) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const newElement: TextElement = {
      id: `element-${Date.now()}`,
      type: "body",
      content: "Click to edit text",
      position: { x, y },
      size: { width: 300, height: 50 },
      style: {
        fontSize: 18,
        color: "#1e293b",
        fontWeight: "normal",
        textAlign: "left",
        fontFamily: "Inter",
        lineHeight: 1.4,
      },
    };

    dispatch({
      type: "ADD_ELEMENT",
      payload: {
        slideId: currentSlide.id,
        element: newElement,
      },
    });

    dispatch({ type: "SET_SELECTED_ELEMENT", payload: newElement.id });
  };

  if (!currentSlide) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">No slides yet</p>
          <p className="text-sm">Create a new presentation to get started</p>
        </div>
      </div>
    );
  }

  // Calculate effective zoom to ensure slide fits in available space
  const maxSlideWidth = containerWidth > 0 ? containerWidth : 1000;
  const effectiveZoom = Math.min(zoom, maxSlideWidth / 1000);

  // Handle both solid colors and gradients
  const getBackgroundStyle = () => {
    if (currentSlide.background.type === 'gradient' && currentSlide.background.gradient) {
      const { gradient } = currentSlide.background;
      return {
        background: `linear-gradient(${gradient.direction}, ${gradient.colors.join(', ')})`,
      };
    } else {
      return {
        backgroundColor: currentSlide.background.color,
      };
    }
  };

  const slideStyle = {
    ...getBackgroundStyle(),
    transform: `scale(${effectiveZoom})`,
    transformOrigin: "top left",
  };



  return (
    <div className="w-full h-full overflow-auto bg-gray-100 p-4">
      <div className="flex justify-center min-h-full">
        <div
          ref={containerRef}
          className="relative shadow-lg cursor-pointer mx-auto"
          style={{
            width: 1000 * effectiveZoom,
            height: 600 * effectiveZoom,
            ...slideStyle,
          }}
          onClick={handleSlideClick}
          onDoubleClick={addTextElement}
        >
          {currentSlide.elements.map((element) => (
            <EditableElement
              key={element.id}
              element={element}
              slideId={currentSlide.id}
              isSelected={selectedElementId === element.id}
              onSelect={() =>
                dispatch({ type: "SET_SELECTED_ELEMENT", payload: element.id })
              }
              zoom={zoom}
            />
          ))}

          {/* Slide guidelines */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-200 opacity-50" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-200 opacity-50" />
          </div>
        </div>
      </div>

      {/* Slide Info */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Slide {(presentation?.currentSlideIndex ?? 0) + 1} of{" "}
        {presentation?.slides.length}
        {" • "}
        Double-click to add text • Drag to move elements
      </div>
    </div>
  );
}
