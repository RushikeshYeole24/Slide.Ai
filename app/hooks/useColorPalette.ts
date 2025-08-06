import { useState, useCallback } from 'react';
import { getBackendColorPaletteService, getPredefinedPalette, type ColorPalette } from '@/app/utils/colorPalette';

interface ColorPaletteRequest {
  topic: string;
  mood?: 'professional' | 'creative' | 'energetic' | 'calm' | 'modern' | 'classic';
  industry?: string;
  audience?: string;
}

export function useColorPalette() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPalettes, setGeneratedPalettes] = useState<ColorPalette[]>([]);

  const colorPaletteService = getBackendColorPaletteService();

  const generateColorPalette = useCallback(async (request: ColorPaletteRequest): Promise<ColorPalette | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // First try to get a predefined palette for common topics
      const predefinedPalette = getPredefinedPalette(request.topic);
      if (predefinedPalette) {
        setIsLoading(false);
        return predefinedPalette;
      }

      // Generate using AI if no predefined palette found
      const palette = await colorPaletteService.generateColorPalette(request);
      setIsLoading(false);
      return palette;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate color palette';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, [colorPaletteService]);

  const generateColorPaletteOptions = useCallback(async (
    request: ColorPaletteRequest, 
    count: number = 3
  ): Promise<ColorPalette[]> => {
    setIsLoading(true);
    setError(null);
    setGeneratedPalettes([]);

    try {
      const palettes = await colorPaletteService.generateColorPaletteOptions(request, count);
      setGeneratedPalettes(palettes);
      setIsLoading(false);
      return palettes;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate color palette options';
      setError(errorMessage);
      setIsLoading(false);
      return [];
    }
  }, [colorPaletteService]);

  const generatePaletteForSlide = useCallback(async (
    slideContent: string,
    slideType?: string,
    presentationTopic?: string
  ): Promise<ColorPalette | null> => {
    // Extract topic from slide content or use presentation topic
    const topic = presentationTopic || slideContent.substring(0, 100);
    
    // Determine mood based on slide type
    let mood: ColorPaletteRequest['mood'] = 'professional';
    if (slideType === 'title') mood = 'modern';
    else if (slideType === 'creative') mood = 'creative';
    else if (slideType === 'marketing') mood = 'energetic';

    return generateColorPalette({ topic, mood });
  }, [generateColorPalette]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearPalettes = useCallback(() => {
    setGeneratedPalettes([]);
  }, []);

  return {
    isLoading,
    error,
    generatedPalettes,
    generateColorPalette,
    generateColorPaletteOptions,
    generatePaletteForSlide,
    clearError,
    clearPalettes,
  };
}