'use client';

import React, { useState } from 'react';
import { PresentationProvider, usePresentation } from '@/app/contexts/PresentationContext';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { Header } from '@/app/components/Header';
import { SlideThumbnails } from '@/app/components/SlideThumbnails';
import { SlideEditor } from '@/app/components/SlideEditor';
import { DesignTools } from '@/app/components/DesignTools';
import { NavigationControls } from '@/app/components/NavigationControls';
import { PresentationMode } from '@/app/components/PresentationMode';
import { PresentationsLibrary } from '@/app/components/PresentationsLibrary';
import { TemplateGallery } from '@/app/components/TemplateGallery';
import { Presentation } from '@/app/types/presentation';

function AppContent() {
  const { presentation, isPresentationMode, dispatch, createNewPresentation } = usePresentation();
  const [showLibrary, setShowLibrary] = useState(!presentation);

  const handleCreateNew = () => {
    const title = prompt('Enter presentation title:') || 'New Presentation';
    createNewPresentation(title);
    setShowLibrary(false);
  };

  const handleOpenPresentation = (presentationData: Presentation) => {
    dispatch({ type: 'SET_PRESENTATION', payload: presentationData });
    setShowLibrary(false);
  };

  const handleBackToLibrary = () => {
    setShowLibrary(true);
  };

  // Show presentations library
  if (showLibrary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header onBackToLibrary={handleBackToLibrary} />
        <div className="container mx-auto px-4 py-8">
          <PresentationsLibrary 
            onCreateNew={handleCreateNew}
            onOpenPresentation={handleOpenPresentation}
          />
        </div>
      </div>
    );
  }

  // Show presentation mode
  if (isPresentationMode) {
    return <PresentationMode />;
  }

  // Main editor interface
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header onBackToLibrary={handleBackToLibrary} />
      
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
    <ProtectedRoute>
      <PresentationProvider>
        <AppContent />
      </PresentationProvider>
    </ProtectedRoute>
  );
}