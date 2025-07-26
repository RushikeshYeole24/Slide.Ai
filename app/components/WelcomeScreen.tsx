'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { usePresentation } from '@/app/contexts/PresentationContext';
import { templates } from '@/app/data/templates';
import { FileText, Plus, Presentation, Sparkles } from 'lucide-react';
import { AIPresentationGenerator } from '@/app/components/AIPresentationGenerator';

export function WelcomeScreen() {
  const { createNewPresentation, addSlideFromTemplate } = usePresentation();
  const [presentationTitle, setPresentationTitle] = useState('');

  const handleCreatePresentation = (templateId?: string) => {
    const title = presentationTitle || 'New Presentation';
    createNewPresentation(title);
    
    // Add initial slide from template
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setTimeout(() => {
          addSlideFromTemplate(template);
        }, 100);
      }
    }
  };

  const quickStartTemplates = templates.slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Presentation className="h-12 w-12 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Slide.Ai</h1>
          </div>
          <p className="text-xl text-gray-600">Create presentations with ease</p>
        </div>

        {/* New Presentation Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Create New Presentation
            </CardTitle>
            <CardDescription>
              Start with a blank presentation or choose from our templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Input
                placeholder="Enter presentation title..."
                value={presentationTitle}
                onChange={(e) => setPresentationTitle(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreatePresentation();
                  }
                }}
              />
              <Button onClick={() => handleCreatePresentation()}>
                <FileText className="h-4 w-4 mr-2" />
                Create Blank
              </Button>
            </div>
            
            {/* AI Presentation Generator */}
            <div className="flex items-center justify-center pt-4 border-t">
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                  Or let AI create your presentation:
                </div>
                <AIPresentationGenerator />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start Templates</CardTitle>
            <CardDescription>
              Get started quickly with these popular templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStartTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors cursor-pointer group"
                  onClick={() => handleCreatePresentation(template.id)}
                >
                  {/* Template Preview */}
                  <div
                    className="aspect-video relative"
                    style={{ backgroundColor: template.background.color }}
                  >
                    <div className="absolute inset-0 p-2 text-xs">
                      {template.elements.slice(0, 2).map((element, index) => (
                        <div
                          key={index}
                          className="absolute truncate"
                          style={{
                            left: `${(element.position.x / 1000) * 100}%`,
                            top: `${(element.position.y / 600) * 100}%`,
                            width: `${(element.size.width / 1000) * 100}%`,
                            fontSize: `${Math.max(6, element.style.fontSize * 0.08)}px`,
                            color: element.style.color,
                            fontWeight: element.style.fontWeight,
                          }}
                        >
                          {element.content.split('\n')[0]}
                        </div>
                      ))}
                    </div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="h-6 w-6 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Template Info */}
                  <div className="p-3">
                    <h4 className="font-medium text-sm text-gray-900">{template.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>No account required • Works offline • Export to PDF or HTML</p>
        </div>
      </div>
    </div>
  );
}