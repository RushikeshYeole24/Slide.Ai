'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePresentation } from '@/app/contexts/PresentationContext';
import { useSmartTemplates } from '@/app/hooks/useSmartTemplates';
import { templates, templateCategories, type TemplateCategory } from '@/app/data/templates';
import { Plus, Layout, Search, Filter, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TemplateGallery() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { addSlideFromTemplate, presentation } = usePresentation();
  const { getTemplateSuggestions, getSmartTemplateRecommendations, addSmartSlide } = useSmartTemplates();

  // Get all unique tags from templates
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    templates.forEach(template => {
      template.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, []);

  // Get smart template recommendations
  const smartRecommendations = useMemo(() => {
    return getSmartTemplateRecommendations(selectedCategory === 'All' ? undefined : selectedCategory);
  }, [selectedCategory, getSmartTemplateRecommendations]);

  // Get template suggestions based on current slide
  const templateSuggestions = useMemo(() => {
    return getTemplateSuggestions();
  }, [getTemplateSuggestions]);

  // Filter templates based on search, category, and tags
  const filteredTemplates = useMemo(() => {
    const baseTemplates = showSuggestions ? smartRecommendations : templates;
    
    return baseTemplates.filter(template => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;

      // Tags filter
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => template.tags.includes(tag));

      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [searchQuery, selectedCategory, selectedTags, showSuggestions, smartRecommendations]);

  const handleTemplateSelect = (template: any) => {
    addSlideFromTemplate(template);
    setIsOpen(false);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedTags([]);
  };

  const renderTemplatePreview = (template: any) => {
    const backgroundStyle = template.background.gradient 
      ? {
          background: `linear-gradient(${template.background.gradient.direction}, ${template.background.gradient.colors.join(', ')})`
        }
      : { backgroundColor: template.background.color };

    return (
      <div
        className="aspect-video relative overflow-hidden"
        style={backgroundStyle}
      >
        <div className="absolute inset-0 p-2 text-xs">
          {template.elements.slice(0, 3).map((element: any, index: number) => (
            <div
              key={index}
              className="absolute overflow-hidden"
              style={{
                left: `${(element.position.x / 1000) * 100}%`,
                top: `${(element.position.y / 600) * 100}%`,
                width: `${(element.size.width / 1000) * 100}%`,
                height: `${(element.size.height / 600) * 100}%`,
                fontSize: `${Math.max(6, element.style.fontSize * 0.08)}px`,
                color: element.style.color,
                fontWeight: element.style.fontWeight,
                textAlign: element.style.textAlign,
                lineHeight: element.style.lineHeight,
              }}
            >
              {element.content.split('\n')[0]}
            </div>
          ))}
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus className="h-8 w-8 text-white drop-shadow-lg" />
          </div>
        </div>
      </div>
    );
  };

  if (!presentation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Layout className="h-4 w-4 mr-2" />
          Templates
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>
        
        {/* Search and Filters */}
        <div className="space-y-4 p-4 border-b">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Smart Suggestions Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {templateCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs"
                >
                  {category}
                </Button>
              ))}
            </div>
            
            {templateSuggestions.length > 0 && (
              <Button
                variant={showSuggestions ? "default" : "outline"}
                size="sm"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="text-xs"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Smart Suggestions
              </Button>
            )}
          </div>

          {/* Tag Filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Tags:</span>
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs h-6 px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-500">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </div>
        </div>
        
        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTemplates.map((template) => {
              const isRecommended = templateSuggestions.includes(template.id);
              
              return (
                <div
                  key={template.id}
                  className={cn(
                    "border rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer group relative",
                    isRecommended 
                      ? "border-blue-400 ring-2 ring-blue-100" 
                      : "border-gray-200 hover:border-blue-300"
                  )}
                  onClick={() => handleTemplateSelect(template)}
                >
                  {/* Recommendation Badge */}
                  {isRecommended && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge variant="default" className="text-xs bg-blue-500">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                    </div>
                  )}

                  {/* Template Preview */}
                  {renderTemplatePreview(template)}
                  
                  {/* Template Info */}
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm text-gray-900 truncate flex-1">
                        {template.name}
                      </h4>
                      <Badge variant="secondary" className="text-xs ml-2 shrink-0">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* No results message */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Layout className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filters to find what youre looking for.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}