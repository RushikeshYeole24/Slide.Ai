'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/app/contexts/AuthContext';
import { usePresentation } from '@/app/contexts/PresentationContext';
import { 
  getUserPresentations, 
  deletePresentation, 
  convertFirestoreToPresentation,
  type PresentationWithId 
} from '@/app/services/firestore';
import { 
  FileText, 
  MoreVertical, 
  Trash2, 
  Edit, 
  Calendar,
  Loader2,
  Plus,
  FolderOpen
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PresentationsLibraryProps {
  onCreateNew: () => void;
  onOpenPresentation: (presentation: any) => void;
}

export function PresentationsLibrary({ 
  onCreateNew, 
  onOpenPresentation 
}: PresentationsLibraryProps) {
  const { user } = useAuth();
  const [presentations, setPresentations] = useState<PresentationWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPresentations();
    }
  }, [user]);

  const loadPresentations = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userPresentations = await getUserPresentations(user.uid);
      setPresentations(userPresentations);
    } catch (err) {
      console.error('Error loading presentations:', err);
      setError('Failed to load presentations');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePresentation = async (presentationId: string) => {
    if (!user || !confirm('Are you sure you want to delete this presentation?')) {
      return;
    }

    setDeletingId(presentationId);
    
    try {
      await deletePresentation(presentationId, user.uid);
      setPresentations(prev => prev.filter(p => p.id !== presentationId));
    } catch (err) {
      console.error('Error deleting presentation:', err);
      setError('Failed to delete presentation');
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenPresentation = (firestorePresentation: PresentationWithId) => {
    const presentation = convertFirestoreToPresentation(firestorePresentation);
    onOpenPresentation(presentation);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your presentations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-700">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadPresentations}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Presentations</h2>
          <p className="text-gray-600">
            {presentations.length} presentation{presentations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Presentation
        </Button>
      </div>

      {/* Presentations Grid */}
      {presentations.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No presentations yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first presentation to get started
          </p>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Presentation
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presentations.map((presentation) => (
            <Card 
              key={presentation.id} 
              className="hover:shadow-md transition-shadow cursor-pointer group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {presentation.title}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(presentation.updatedAt.toDate(), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={deletingId === presentation.id}
                      >
                        {deletingId === presentation.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleOpenPresentation(presentation)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeletePresentation(presentation.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent 
                className="pt-0"
                onClick={() => handleOpenPresentation(presentation)}
              >
                <div className="space-y-3">
                  {/* Slide Count */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <FileText className="h-4 w-4 mr-1" />
                      {presentation.slides.length} slide{presentation.slides.length !== 1 ? 's' : ''}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {presentation.theme.name}
                    </Badge>
                  </div>
                  
                  {/* Preview */}
                  <div className="aspect-video bg-gray-100 rounded border flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Preview</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}