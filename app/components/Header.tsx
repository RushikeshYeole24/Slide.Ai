"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePresentation } from "@/app/contexts/PresentationContext";
import { exportToPDF, exportToHTML } from "@/app/utils/exportUtils";
import {
  Save,
  Download,
  Upload,
  Play,
  FileText,
  Menu,
  X,
  Presentation,
} from "lucide-react";
import { AIContentGenerator } from "@/app/components/AIContentGenerator";
import { AIPresentationGenerator } from "@/app/components/AIPresentationGenerator";

export function Header() {
  const {
    presentation,
    savePresentation,
    createNewPresentation,
    dispatch,
    isPresentationMode,
  } = usePresentation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [title, setTitle] = useState(presentation?.title || "");

  const handleSave = () => {
    if (presentation && title !== presentation.title) {
      dispatch({
        type: "UPDATE_THEME",
        payload: { ...presentation.theme },
      });
    }
    savePresentation();
  };

  const handleNewPresentation = () => {
    const newTitle = prompt("Enter presentation title:") || "New Presentation";
    createNewPresentation(newTitle);
    setTitle(newTitle);
  };

  const handleExportPDF = () => {
    if (presentation) {
      exportToPDF(presentation);
    }
  };

  const handleExportHTML = () => {
    if (presentation) {
      exportToHTML(presentation);
    }
  };

  const handlePresentationMode = () => {
    dispatch({ type: "SET_PRESENTATION_MODE", payload: true });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (presentation) {
      // Update presentation title in context
      const updatedPresentation = { ...presentation, title: e.target.value };
      dispatch({ type: "SET_PRESENTATION", payload: updatedPresentation });
    }
  };

  if (isPresentationMode) return null;

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() =>
              dispatch({ type: "SET_PRESENTATION", payload: null })
            }
            title="Go to Home"
          >
            <Presentation className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Slide.Ai</span>
          </div>

          {presentation && (
            <div className="hidden md:block">
              <Input
                value={title}
                onChange={handleTitleChange}
                className="min-w-[200px] border-0 bg-transparent text-lg font-medium focus:bg-gray-50"
                placeholder="Presentation Title"
              />
            </div>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleNewPresentation}>
            <FileText className="h-4 w-4 mr-2" />
            New
          </Button>
          
          <AIPresentationGenerator />

          {presentation && (
            <>
              <AIContentGenerator />
              
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>

              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>

              <Button variant="outline" size="sm" onClick={handleExportHTML}>
                <Upload className="h-4 w-4 mr-2" />
                Export HTML
              </Button>

              <Button size="sm" onClick={handlePresentationMode}>
                <Play className="h-4 w-4 mr-2" />
                Present
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
          {presentation && (
            <div className="mb-4">
              <Input
                value={title}
                onChange={handleTitleChange}
                className="w-full"
                placeholder="Presentation Title"
              />
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Button variant="outline" size="sm" onClick={handleNewPresentation}>
              <FileText className="h-4 w-4 mr-2" />
              New Presentation
            </Button>
            
            <AIPresentationGenerator />

            {presentation && (
              <>
                <AIContentGenerator />
                
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>

                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>

                <Button variant="outline" size="sm" onClick={handleExportHTML}>
                  <Upload className="h-4 w-4 mr-2" />
                  Export HTML
                </Button>

                <Button size="sm" onClick={handlePresentationMode}>
                  <Play className="h-4 w-4 mr-2" />
                  Present
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
