"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useOpenAI } from "@/app/hooks/useOpenAI";
import { useColorPalette } from "@/app/hooks/useColorPalette";
import {
  Sparkles,
  Loader2,
  FileText,
  Wand2,
  Clock,
  Users,
  Settings,
  AlertCircle,
  Plus,
  Trash2,
  Palette,
} from "lucide-react";

export function AIPresentationGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [duration, setDuration] = useState([15]);
  const [tone, setTone] = useState<
    "professional" | "casual" | "academic" | "creative"
  >("professional");
  const [keyPoints, setKeyPoints] = useState<string[]>([""]);
  const [generatedOutline, setGeneratedOutline] = useState<any>(null);
  const [autoGenerateColors, setAutoGenerateColors] = useState(true);
  const [generatedPalette, setGeneratedPalette] = useState<any>(null);

  const {
    isLoading,
    error,
    isConfigured,
    createAIPresentation,
    generatePresentationOutline,
    clearError,
  } = useOpenAI();

  const {
    isLoading: isPaletteLoading,
    generateColorPalette,
  } = useColorPalette();

  const handleGenerateOutline = async () => {
    if (!topic.trim()) return;

    clearError();
    try {
      const result = await generatePresentationOutline({
        topic: topic.trim(),
        audience: audience.trim() || undefined,
        duration: duration[0],
        tone,
        keyPoints: keyPoints
          .filter((point) => point.trim())
          .map((point) => point.trim()),
      });

      setGeneratedOutline(result);

      // Auto-generate color palette if enabled
      if (autoGenerateColors) {
        try {
          const palette = await generateColorPalette({
            topic: topic.trim(),
            mood: tone === 'professional' ? 'professional' : 
                  tone === 'creative' ? 'creative' : 
                  tone === 'academic' ? 'calm' : 'modern',
            audience: audience.trim() || undefined,
          });
          setGeneratedPalette(palette);
        } catch (paletteError) {
          console.error("Failed to generate color palette:", paletteError);
          // Don't fail the whole process if palette generation fails
        }
      }
    } catch (err) {
      console.error("Failed to generate outline:", err);
    }
  };

  const handleCreatePresentation = async () => {
    if (!generatedOutline) return;

    try {
      await createAIPresentation({
        topic: topic.trim(),
        audience: audience.trim() || undefined,
        duration: duration[0],
        tone,
        keyPoints: keyPoints
          .filter((point) => point.trim())
          .map((point) => point.trim()),
        colorPalette: generatedPalette, // Pass the generated color palette
      });

      setIsOpen(false);
      setGeneratedOutline(null);
      setGeneratedPalette(null);
      setTopic("");
      setAudience("");
      setKeyPoints([""]);
    } catch (err) {
      console.error("Failed to create presentation:", err);
    }
  };

  const addKeyPoint = () => {
    setKeyPoints([...keyPoints, ""]);
  };

  const updateKeyPoint = (index: number, value: string) => {
    const updated = [...keyPoints];
    updated[index] = value;
    setKeyPoints(updated);
  };

  const removeKeyPoint = (index: number) => {
    if (keyPoints.length > 1) {
      setKeyPoints(keyPoints.filter((_, i) => i !== index));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Wand2 className="h-4 w-4 mr-2" />
          AI Presentation
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            AI Presentation Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Topic Input */}
          <div>
            <Label htmlFor="topic" className="text-sm font-medium">
              Presentation Topic *
            </Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Digital Marketing Strategy for 2024"
              className="mt-1"
            />
          </div>

          {/* Audience and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="audience"
                className="text-sm font-medium flex items-center"
              >
                <Users className="h-4 w-4 mr-1" />
                Target Audience
              </Label>
              <Input
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g., marketing executives, students"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Duration: {duration[0]} minutes
              </Label>
              <Slider
                value={duration}
                onValueChange={setDuration}
                min={5}
                max={60}
                step={5}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 min</span>
                <span>60 min</span>
              </div>
            </div>
          </div>

          {/* Tone */}
          <div>
            <Label className="text-sm font-medium">Presentation Tone</Label>
            <Select value={tone} onValueChange={(value: any) => setTone(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Key Points */}
          <div>
            <Label className="text-sm font-medium">
              Key Points to Cover (Optional)
            </Label>
            <div className="space-y-2 mt-2">
              {keyPoints.map((point, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={point}
                    onChange={(e) => updateKeyPoint(index, e.target.value)}
                    placeholder={`Key point ${index + 1}`}
                    className="flex-1"
                  />
                  {keyPoints.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeKeyPoint(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addKeyPoint}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Key Point
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Auto-generate Colors Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="auto-colors"
              checked={autoGenerateColors}
              onChange={(e) => setAutoGenerateColors(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="auto-colors" className="text-sm flex items-center">
              <Palette className="h-4 w-4 mr-1" />
              Auto-generate color palette
            </Label>
          </div>

          {/* Generated Outline Preview */}
          {generatedOutline && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">
                Generated Presentation Outline:
              </h4>

              <div className="space-y-3">
                <div>
                  <Badge variant="default" className="mb-2">
                    Title
                  </Badge>
                  <p className="font-medium">{generatedOutline.title}</p>
                </div>

                {/* Generated Color Palette Preview */}
                {generatedPalette && (
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      <Palette className="h-3 w-3 mr-1" />
                      Color Palette: {generatedPalette.name}
                    </Badge>
                    <div className="bg-white rounded p-3 border">
                      <div className="flex items-center space-x-2 mb-2">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: generatedPalette.primary }}
                          title="Primary"
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: generatedPalette.secondary }}
                          title="Secondary"
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: generatedPalette.accent }}
                          title="Accent"
                        />
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: generatedPalette.background }}
                          title="Background"
                        />
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: generatedPalette.text }}
                          title="Text"
                        />
                      </div>
                      <p className="text-xs text-gray-600">
                        {generatedPalette.description}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <Badge variant="secondary" className="mb-2">
                    Slides ({generatedOutline.slides?.length || 0})
                  </Badge>
                  <div className="space-y-2">
                    {generatedOutline.slides?.map(
                      (slide: any, index: number) => (
                        <div
                          key={index}
                          className="bg-white rounded p-3 border"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">
                              {slide.title}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {slide.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {slide.description}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleGenerateOutline}
              disabled={!topic.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              {generatedOutline ? "Regenerate Outline" : "Generate Outline"}
            </Button>

            {generatedOutline && (
              <Button onClick={handleCreatePresentation} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                Create Presentation
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
