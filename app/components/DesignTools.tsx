"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePresentation } from "@/app/contexts/PresentationContext";
import { themes } from "@/app/data/templates";
import { ColorPalettePicker } from "@/app/components/ColorPalettePicker";
import {
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Paintbrush,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const colorPalette = [
  "#000000",
  "#374151",
  "#6b7280",
  "#9ca3af",
  "#d1d5db",
  "#f3f4f6",
  "#ffffff",
  "#dc2626",
  "#ea580c",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

const gradientPresets = [
  {
    name: "Sunset",
    gradient: {
      type: "linear" as const,
      direction: "45deg",
      colors: ["#f97316", "#fb923c", "#fbbf24"],
    },
  },
  {
    name: "Ocean",
    gradient: {
      type: "linear" as const,
      direction: "135deg",
      colors: ["#0ea5e9", "#38bdf8", "#06b6d4"],
    },
  },
  {
    name: "Purple Dream",
    gradient: {
      type: "linear" as const,
      direction: "45deg",
      colors: ["#7c3aed", "#a855f7", "#c084fc"],
    },
  },
  {
    name: "Forest",
    gradient: {
      type: "linear" as const,
      direction: "135deg",
      colors: ["#16a34a", "#22c55e", "#84cc16"],
    },
  },
  {
    name: "Fire",
    gradient: {
      type: "linear" as const,
      direction: "45deg",
      colors: ["#dc2626", "#ef4444", "#f97316"],
    },
  },
  {
    name: "Midnight",
    gradient: {
      type: "linear" as const,
      direction: "135deg",
      colors: ["#1e293b", "#334155", "#475569"],
    },
  },
];

const fontFamilies = [
  "Inter",
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
  "Impact",
  "Comic Sans MS",
];

export function DesignTools() {
  const { getCurrentSlide, selectedElementId, dispatch, zoom } =
    usePresentation();

  const [showColorPicker, setShowColorPicker] = useState<
    "text" | "background" | null
  >(null);
  const [showGradients, setShowGradients] = useState(false);
  const [backgroundType, setBackgroundType] = useState<"solid" | "gradient">(
    "solid"
  );

  const currentSlide = getCurrentSlide();
  const selectedElement = currentSlide?.elements.find(
    (el) => el.id === selectedElementId
  );

  const handleBackgroundColorChange = (color: string) => {
    if (!currentSlide) return;
    dispatch({
      type: "UPDATE_SLIDE",
      payload: {
        id: currentSlide.id,
        updates: {
          background: { ...currentSlide.background, color },
        },
      },
    });
  };

  const handleElementStyleChange = (updates: any) => {
    if (!currentSlide || !selectedElement) return;
    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        slideId: currentSlide.id,
        elementId: selectedElement.id,
        updates: {
          style: { ...selectedElement.style, ...updates },
        },
      },
    });
  };

  const handleFontSizeChange = (value: number[]) => {
    handleElementStyleChange({ fontSize: value[0] });
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    handleElementStyleChange({ fontFamily });
  };

  const handleTextAlignChange = (textAlign: string) => {
    handleElementStyleChange({ textAlign });
  };

  const handleFontWeightToggle = () => {
    const newWeight =
      selectedElement?.style.fontWeight === "bold" ? "normal" : "bold";
    handleElementStyleChange({ fontWeight: newWeight });
  };

  const handleZoomChange = (delta: number) => {
    dispatch({ type: "SET_ZOOM", payload: zoom + delta });
  };

  const handleThemeChange = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (!theme || !currentSlide) return;

    dispatch({
      type: "UPDATE_SLIDE",
      payload: {
        id: currentSlide.id,
        updates: {
          background: {
            type: "solid",
            color: theme.colors.background,
          },
        },
      },
    });

    // Update all text elements to use theme colors
    currentSlide.elements.forEach((element) => {
      const newColor =
        element.type === "title" ? theme.colors.primary : theme.colors.text;
      dispatch({
        type: "UPDATE_ELEMENT",
        payload: {
          slideId: currentSlide.id,
          elementId: element.id,
          updates: {
            style: {
              ...element.style,
              color: newColor,
              fontFamily:
                element.type === "title"
                  ? theme.fonts.heading
                  : theme.fonts.body,
            },
          },
        },
      });
    });
  };

  const handleGradientChange = (gradient: any) => {
    if (!currentSlide) return;
    dispatch({
      type: "UPDATE_SLIDE",
      payload: {
        id: currentSlide.id,
        updates: {
          background: {
            type: "gradient",
            color: gradient.colors[0],
            gradient,
          },
        },
      },
    });
    setShowGradients(false);
  };

  const handleBackgroundTypeChange = (type: "solid" | "gradient") => {
    setBackgroundType(type);
    if (type === "solid" && currentSlide) {
      dispatch({
        type: "UPDATE_SLIDE",
        payload: {
          id: currentSlide.id,
          updates: {
            background: {
              type: "solid",
              color: currentSlide.background.color,
            },
          },
        },
      });
    }
  };

  return (
    <div className="w-full bg-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900 flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          Design Tools
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Zoom Controls */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Zoom</Label>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleZoomChange(-0.25)}
              disabled={zoom <= 0.25}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleZoomChange(0.25)}
              disabled={zoom >= 2}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => dispatch({ type: "SET_ZOOM", payload: 1 })}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* AI Color Palette Picker */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center">
            <Paintbrush className="h-4 w-4 mr-2" />
            AI Color Palettes
          </Label>
          <ColorPalettePicker />
        </div>

        {/* Theme Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Predefined Themes</Label>
          <Select onValueChange={handleThemeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a theme" />
            </SelectTrigger>
            <SelectContent>
              {themes.map((theme) => (
                <SelectItem key={theme.id} value={theme.id}>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <div
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: theme.colors.secondary }}
                      />
                      <div
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                    </div>
                    <span>{theme.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Slide Background */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center">
            <Layers className="h-4 w-4 mr-2" />
            Slide Background
          </Label>

          {/* Background Type Toggle */}
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant={backgroundType === "solid" ? "default" : "outline"}
              onClick={() => handleBackgroundTypeChange("solid")}
              className="flex-1"
            >
              Solid
            </Button>
            <Button
              size="sm"
              variant={backgroundType === "gradient" ? "default" : "outline"}
              onClick={() => handleBackgroundTypeChange("gradient")}
              className="flex-1"
            >
              Gradient
            </Button>
          </div>

          {/* Solid Color Picker */}
          {backgroundType === "solid" && (
            <div className="relative">
              <Button
                variant="outline"
                className="w-full h-10 p-1"
                onClick={() =>
                  setShowColorPicker(
                    showColorPicker === "background" ? null : "background"
                  )
                }
              >
                <div
                  className="w-full h-full rounded border"
                  style={{
                    backgroundColor:
                      currentSlide?.background.color || "#ffffff",
                  }}
                />
              </Button>

              {showColorPicker === "background" && (
                <div className="absolute top-12 left-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                  <div className="grid grid-cols-7 gap-2">
                    {colorPalette.map((color) => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          handleBackgroundColorChange(color);
                          setShowColorPicker(null);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gradient Picker */}
          {backgroundType === "gradient" && (
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowGradients(!showGradients)}
              >
                Choose Gradient
              </Button>

              {showGradients && (
                <div className="space-y-2">
                  {gradientPresets.map((preset) => (
                    <button
                      key={preset.name}
                      className="w-full h-8 rounded border border-gray-300 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center text-white text-xs font-medium"
                      style={{
                        background: `linear-gradient(${
                          preset.gradient.direction
                        }, ${preset.gradient.colors.join(", ")})`,
                      }}
                      onClick={() => handleGradientChange(preset.gradient)}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Text Formatting */}
        {selectedElement && (
          <>
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center">
                <Type className="h-4 w-4 mr-2" />
                Text Formatting
              </Label>

              {/* Font Family */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Font Family</Label>
                <Select
                  value={selectedElement.style.fontFamily}
                  onValueChange={handleFontFamilyChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>{font}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">
                  Font Size: {selectedElement.style.fontSize}px
                </Label>
                <Slider
                  value={[selectedElement.style.fontSize]}
                  onValueChange={handleFontSizeChange}
                  min={8}
                  max={72}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Text Color */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Text Color</Label>
                <div className="relative">
                  <Button
                    variant="outline"
                    className="w-full h-8 p-1"
                    onClick={() =>
                      setShowColorPicker(
                        showColorPicker === "text" ? null : "text"
                      )
                    }
                  >
                    <div
                      className="w-full h-full rounded border"
                      style={{ backgroundColor: selectedElement.style.color }}
                    />
                  </Button>

                  {showColorPicker === "text" && (
                    <div className="absolute top-10 left-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                      <div className="grid grid-cols-7 gap-2">
                        {colorPalette.map((color) => (
                          <button
                            key={color}
                            className="w-6 h-6 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              handleElementStyleChange({ color });
                              setShowColorPicker(null);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Text Alignment */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Text Alignment</Label>
                <div className="flex space-x-1">
                  {[
                    { value: "left", icon: AlignLeft },
                    { value: "center", icon: AlignCenter },
                    { value: "right", icon: AlignRight },
                  ].map(({ value, icon: Icon }) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={
                        selectedElement.style.textAlign === value
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handleTextAlignChange(value)}
                      className="flex-1"
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </div>

              {/* Font Weight */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Font Style</Label>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant={
                      selectedElement.style.fontWeight === "bold"
                        ? "default"
                        : "outline"
                    }
                    onClick={handleFontWeightToggle}
                    className="flex-1"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {!selectedElement && (
          <div className="text-center text-gray-500 text-sm py-8">
            Select a text element to edit its properties
          </div>
        )}
      </div>
    </div>
  );
}
