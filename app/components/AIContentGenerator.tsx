'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useOpenAI } from '@/app/hooks/useOpenAI';
import { usePresentation } from '@/app/contexts/PresentationContext';
import { 
  Sparkles, 
  Loader2, 
  Plus, 
  Wand2, 
  FileText,
  Lightbulb,
  Settings,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIContentGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [slideType, setSlideType] = useState<'title' | 'content' | 'bullet-points' | 'conclusion' | 'agenda' | 'overview'>('content');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState<'professional' | 'casual' | 'academic' | 'creative'>('professional');
  const [context, setContext] = useState('');
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const { presentation } = usePresentation();
  const {
    isLoading,
    error,
    isConfigured,
    generateSlideContent,
    createAISlide,
    clearError
  } = useOpenAI();

  const handleGenerateContent = async () => {
    if (!topic.trim()) return;

    clearError();
    try {
      const result = await generateSlideContent({
        topic: topic.trim(),
        slideType,
        audience: audience.trim() || undefined,
        tone,
        context: context.trim() || undefined,
        length: 'medium'
      });
      
      setGeneratedContent(result);
    } catch (err) {
      console.error('Failed to generate content:', err);
    }
  };

  const handleCreateSlide = async () => {
    if (!generatedContent || !presentation) return;

    try {
      await createAISlide({
        topic: topic.trim(),
        slideType,
        audience: audience.trim() || undefined,
        tone,
        context: context.trim() || undefined,
      });
      
      setIsOpen(false);
      setGeneratedContent(null);
      setTopic('');
      setContext('');
    } catch (err) {
      console.error('Failed to create slide:', err);
    }
  };

  const handleRegenerateContent = () => {
    setGeneratedContent(null);
    handleGenerateContent();
  };

  if (!presentation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          AI Generate
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wand2 className="h-5 w-5 mr-2" />
            AI Content Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Topic Input */}
          <div>
            <Label htmlFor="topic" className="text-sm font-medium">
              Topic or Subject *
            </Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Digital Marketing Strategy, Climate Change, Product Launch"
              className="mt-1"
            />
          </div>

          {/* Slide Type */}
          <div>
            <Label className="text-sm font-medium">Slide Type</Label>
            <Select value={slideType} onValueChange={(value: any) => setSlideType(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title Slide</SelectItem>
                <SelectItem value="content">Content Slide</SelectItem>
                <SelectItem value="bullet-points">Bullet Points</SelectItem>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="agenda">Agenda</SelectItem>
                <SelectItem value="conclusion">Conclusion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tone and Audience */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Tone</Label>
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

            <div>
              <Label htmlFor="audience" className="text-sm font-medium">
                Audience (Optional)
              </Label>
              <Input
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g., executives, students, developers"
                className="mt-1"
              />
            </div>
          </div>

          {/* Context */}
          <div>
            <Label htmlFor="context" className="text-sm font-medium">
              Additional Context (Optional)
            </Label>
            <Textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Provide any additional context, key points, or specific requirements..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Generated Content Preview */}
          {generatedContent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Generated Content:</h4>
              
              <div className="space-y-2">
                <div>
                  <Badge variant="secondary" className="text-xs mb-1">Title</Badge>
                  <p className="text-sm font-medium">{generatedContent.title}</p>
                </div>
                
                {generatedContent.subtitle && (
                  <div>
                    <Badge variant="secondary" className="text-xs mb-1">Subtitle</Badge>
                    <p className="text-sm text-gray-600">{generatedContent.subtitle}</p>
                  </div>
                )}
                
                {generatedContent.content && generatedContent.content.length > 0 && (
                  <div>
                    <Badge variant="secondary" className="text-xs mb-1">Content</Badge>
                    <ul className="text-sm space-y-1">
                      {generatedContent.content.map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {generatedContent.notes && (
                  <div>
                    <Badge variant="secondary" className="text-xs mb-1">Speaker Notes</Badge>
                    <p className="text-sm text-gray-600">{generatedContent.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleGenerateContent}
                disabled={!topic.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Lightbulb className="h-4 w-4 mr-2" />
                )}
                {generatedContent ? 'Regenerate' : 'Generate Content'}
              </Button>
              
              {generatedContent && (
                <Button
                  onClick={handleRegenerateContent}
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>

            {generatedContent && (
              <Button
                onClick={handleCreateSlide}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Slide
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}