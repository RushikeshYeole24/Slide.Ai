"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePresentation } from "@/app/contexts/PresentationContext";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  savePresentation,
  autoSavePresentation,
} from "@/app/services/firestore";
import { exportToPDF, exportToHTML } from "@/app/utils/exportUtils";
import { UserProfile } from "@/app/components/UserProfile";
import {
  Save,
  Download,
  Upload,
  Play,
  FileText,
  Menu,
  X,
  Presentation,
  ArrowLeft,
  Cloud,
  Check,
} from "lucide-react";
import { AIContentGenerator } from "@/app/components/AIContentGenerator";
import { AIPresentationGenerator } from "@/app/components/AIPresentationGenerator";

interface HeaderProps {
  onBackToLibrary?: () => void;
}

export function Header({ onBackToLibrary }: HeaderProps) {
  const { presentation, createNewPresentation, dispatch, isPresentationMode } =
    usePresentation();

  const { user } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [title, setTitle] = useState(presentation?.title || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "saved" | "saving" | "error" | null
  >(null);

  // Auto-save when presentation changes (only for existing presentations)
  useEffect(() => {
    if (presentation && user && presentation.id && presentation.id !== "new") {
      console.log('Setting up auto-save for presentation:', presentation.id);
      const timeoutId = setTimeout(async () => {
        try {
          console.log('Auto-saving presentation:', presentation.id);
          setSaveStatus("saving");
          const savedId = await autoSavePresentation(user.uid, presentation);
          
          // Update presentation ID if it changed (shouldn't happen for existing presentations)
          if (savedId !== presentation.id) {
            console.log('Presentation ID changed during auto-save:', presentation.id, '->', savedId);
            dispatch({
              type: "SET_PRESENTATION",
              payload: { ...presentation, id: savedId },
            });
          }
          
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus(null), 2000);
        } catch (error) {
          console.error("Auto-save failed:", error);
          setSaveStatus("error");
          setTimeout(() => setSaveStatus(null), 3000);
        }
      }, 2000);

      return () => {
        console.log('Clearing auto-save timeout for presentation:', presentation.id);
        clearTimeout(timeoutId);
      };
    }
  }, [presentation, user, dispatch]);

  const handleSave = async () => {
    if (!presentation || !user) {
      console.error('Cannot save: missing presentation or user', { presentation: !!presentation, user: !!user });
      return;
    }

    console.log('Manual save triggered for user:', user.uid, 'presentation:', presentation.id);
    setIsSaving(true);
    setSaveStatus("saving");

    try {
      const savedId = await savePresentation(user.uid, presentation);
      console.log('Manual save completed. Original ID:', presentation.id, 'Saved ID:', savedId);

      // Update presentation ID if it was a new presentation or changed
      if (presentation.id === "new" || presentation.id !== savedId) {
        console.log('Updating presentation ID from', presentation.id, 'to', savedId);
        dispatch({
          type: "SET_PRESENTATION",
          payload: { ...presentation, id: savedId },
        });
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
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
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {onBackToLibrary && presentation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToLibrary}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}

            <div
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={
                onBackToLibrary ||
                (() => dispatch({ type: "SET_PRESENTATION", payload: null }))
              }
              title="Go to Library"
            >
              <Presentation className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Slide.Ai</span>
            </div>
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

              {/* Save Status */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Cloud className="h-4 w-4 mr-2 animate-pulse" />
                  ) : saveStatus === "saved" ? (
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? "Saving..." : "Save"}
                </Button>

                {saveStatus && (
                  <span
                    className={`text-xs ${
                      saveStatus === "saved"
                        ? "text-green-600"
                        : saveStatus === "saving"
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {saveStatus === "saved"
                      ? "Saved"
                      : saveStatus === "saving"
                      ? "Saving..."
                      : "Save failed"}
                  </span>
                )}
              </div>

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

          {/* User Profile */}
          <UserProfile />
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
