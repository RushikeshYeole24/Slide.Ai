'use client';

import React from 'react';
import { PresentationProvider, usePresentation } from '@/app/contexts/PresentationContext';
import { Header } from '@/app/components/Header';
import { SlideThumbnails } from '@/app/components/SlideThumbnails';
import { SlideEditor } from '@/app/components/SlideEditor';
import { DesignTools } from '@/app/components/DesignTools';
import { NavigationControls } from '@/app/components/NavigationControls';
import { PresentationMode } from '@/app/components/PresentationMode';
import { WelcomeScreen } from '@/app/components/WelcomeScreen';
import { TemplateGallery } from '@/app/components/TemplateGallery';

function AppContent() {
  const { presentation, isPresentationMode } = usePresentation();

  // Show welcome screen if no presentation
  if (!presentation) {
    return <WelcomeScreen />;
  }

  // Show presentation mode
  if (isPresentationMode) {
    return <PresentationMode />;
  }

  // Main editor interface
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Slide Thumbnails */}
        <div className="hidden lg:block">
          <SlideThumbnails />
        </div>
        
        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {/* Editor Actions */}
          <div className="border-b border-gray-200 bg-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TemplateGallery />
            </div>
            
            <div className="text-sm text-gray-500">
              Double-click to add text • Drag to move • Select to edit
            </div>
          </div>
          
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 min-w-0 overflow-hidden">
              <SlideEditor />
            </div>
            
            {/* Right Sidebar - Design Tools */}
            <div className="hidden lg:block w-80 flex-shrink-0 border-l border-gray-200">
              <DesignTools />
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <NavigationControls />
    </div>
  );
}

export default function Home() {
  return (
    <PresentationProvider>
      <AppContent />
    </PresentationProvider>
  );
}