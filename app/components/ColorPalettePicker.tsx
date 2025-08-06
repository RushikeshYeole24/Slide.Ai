'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useColorPalette } from '@/app/hooks/useColorPalette';
import { usePresentation } from '@/app/contexts/PresentationContext';
import { predefinedPalettes, type ColorPalette } from '@/app/utils/colorPalette';
import { 
  Palette, 
  Loader2, 
  Sparkles, 
  Check, 
  RefreshCw,
  Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorPalettePickerProps {
  onPaletteSelect?: (palette: ColorPalette) => void;
}

export function ColorPalettePicker({ onPaletteSelect }: ColorPalettePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [mood, setMood] = useState<'professional' | 'creative' | 'energetic' | 'calm' | 'modern' | 'classic'>('professional');
  const [industry, setIndustry] = useState('');
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(null);
  const [showPredefined, setShowPredefined] = useState(true);

  const { presentation, dispatch } = usePresentation();
  const {
    isLoading,
    error,
    generatedPalettes,
    generateColorPaletteOptions,
    clearError,
    clearPalettes,
  } = useColorPalette();

  // Auto-populate topic from presentation title
  useEffect(() => {
    if (presentation?.title && !topic) {
      setTopic(presentation.title);
    }
  }, [presentation?.title, topic]);

  const handleGeneratePalettes = async () => {
    if (!topic.trim()) return;

    clearError();
    await generateColorPaletteOptions({
      topic: topic.trim(),
      mood,
      industry: industry.trim() || undefined,
    }, 4);
    setShowPredefined(false);
  };

  const handlePaletteSelect = (palette: ColorPalette) => {
    setSelectedPalette(palette);
    
    // Apply color palette to presentation using the new comprehensive action
    if (presentation) {
      dispatch({ 
        type: 'APPLY_COLOR_PALETTE', 
        payload: {
          primary: palette.primary,
          secondary: palette.secondary,
          accent: palette.accent,
          background: palette.background,
          text: palette.text,
          name: palette.name,
        }
      });
    }

    // Call external handler if provided
    if (onPaletteSelect) {
      onPaletteSelect(palette);
    }

    setIsOpen(false);
  };

  const renderColorPalette = (palette: ColorPalette, isSelected: boolean = false) => (
    <div
      className={cn(
        "border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
        isSelected ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200 hover:border-blue-300"
      )}
      onClick={() => handlePaletteSelect(palette)}
    >
      {/* Color Swatches */}
      <div className="flex space-x-2 mb-3">
        <div
          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: palette.primary }}
          title="Primary"
        />
        <div
          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: palette.secondary }}
          title="Secondary"
        />
        <div
          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: palette.accent }}
          title="Accent"
        />
        <div
          className="w-6 h-6 rounded border border-gray-300 mt-1"
          style={{ backgroundColor: palette.background }}
          title="Background"
        />
        <div
          className="w-6 h-6 rounded border border-gray-300 mt-1"
          style={{ backgroundColor: palette.text }}
          title="Text"
        />
      </div>

      {/* Palette Info */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">{palette.name}</h4>
          {isSelected && <Check className="h-4 w-4 text-blue-500" />}
        </div>
        <p className="text-xs text-gray-500 line-clamp-2">
          {palette.description}
        </p>
      </div>

      {/* Preview */}
      <div 
        className="mt-3 p-2 rounded text-xs"
        style={{ 
          backgroundColor: palette.background,
          color: palette.text,
          border: `1px solid ${palette.secondary}20`
        }}
      >
        <div style={{ color: palette.primary }} className="font-semibold">
          Sample Title
        </div>
        <div className="mt-1">
          Sample content with{' '}
          <span style={{ color: palette.accent }} className="font-medium">
            accent color
          </span>
        </div>
      </div>
    </div>
  );

  const palettesToShow = showPredefined 
    ? Object.values(predefinedPalettes)
    : generatedPalettes;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="h-4 w-4 mr-2" />
          Color Palette
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Choose Color Palette
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-4 border-b">
          {/* Topic Input */}
          <div>
            <Label htmlFor="palette-topic" className="text-sm font-medium">
              Presentation Topic
            </Label>
            <Input
              id="palette-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Digital Marketing Strategy"
              className="mt-1"
            />
          </div>

          {/* Mood and Industry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Mood/Style</Label>
              <Select value={mood} onValueChange={(value: any) => setMood(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="energetic">Energetic</SelectItem>
                  <SelectItem value="calm">Calm</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="industry" className="text-sm font-medium">
                Industry (Optional)
              </Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Technology, Healthcare"
                className="mt-1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant={showPredefined ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setShowPredefined(true);
                  clearPalettes();
                }}
              >
                Predefined
              </Button>
              <Button
                variant={!showPredefined ? "default" : "outline"}
                size="sm"
                onClick={() => setShowPredefined(false)}
                disabled={generatedPalettes.length === 0}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                AI Generated
              </Button>
            </div>

            <Button
              onClick={handleGeneratePalettes}
              disabled={!topic.trim() || isLoading}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              {generatedPalettes.length > 0 ? 'Regenerate' : 'Generate AI Palettes'}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Palette Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {palettesToShow.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">
                  {showPredefined ? 'Predefined Palettes' : 'AI Generated Palettes'}
                </h3>
                <Badge variant="secondary">
                  {palettesToShow.length} palette{palettesToShow.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {palettesToShow.map((palette, index) => (
                  <div key={`${palette.name}-${index}`}>
                    {renderColorPalette(
                      palette,
                      selectedPalette?.name === palette.name
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Palette className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {showPredefined ? 'Choose a Predefined Palette' : 'Generate AI Palettes'}
              </h3>
              <p className="text-gray-500 mb-4">
                {showPredefined 
                  ? 'Select from our curated collection of professional color palettes'
                  : 'Enter a topic above and click "Generate AI Palettes" to create custom color schemes'
                }
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}