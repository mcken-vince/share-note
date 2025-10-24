'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { X as XIcon, Search as SearchIcon } from 'lucide-react';
import type { Note } from '@/types';

interface SearchInputProps {
  notes: Note[];
  onFilteredNotesChange: (filteredNotes: Note[], hasActiveFilter: boolean) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Search component that filters notes by title and tags
 */
export const SearchInput = ({ 
  notes, 
  onFilteredNotesChange, 
  placeholder = "Search notes by title or tags...",
  className 
}: SearchInputProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter notes based on search term
  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) {
      return notes;
    }

    const term = searchTerm.toLowerCase().trim();
    return notes.filter(note => {
      // Search in title
      const titleMatch = note.title.toLowerCase().includes(term);
      
      // Search in tags
      const tagMatch = note.tags.some(tag => 
        tag.toLowerCase().includes(term)
      );
      
      // Search in content/body (for regular notes)
      const bodyMatch = note.type === 'note' && note.body 
        ? note.body.toLowerCase().includes(term)
        : false;
      
      // Search in checklist items
      const itemsMatch = note.type === 'checklist' && note.items 
        ? note.items.some(item => item.body.toLowerCase().includes(term))
        : false;

      return titleMatch || tagMatch || bodyMatch || itemsMatch;
    });
  }, [notes, searchTerm]);

  // Update parent component whenever filtered notes change
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Effect to notify parent of filtered notes changes
  useEffect(() => {
    const hasActiveFilter = searchTerm.trim().length > 0;
    onFilteredNotesChange(filteredNotes, hasActiveFilter);
  }, [filteredNotes, onFilteredNotesChange, searchTerm]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const hasSearch = searchTerm.trim().length > 0;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {hasSearch && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
            title="Clear search"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {hasSearch && (
        <div className="mt-2 text-sm text-muted-foreground">
          {filteredNotes.length === 0 ? (
            <span>No notes found for "{searchTerm}"</span>
          ) : (
            <span>
              {filteredNotes.length} of {notes.length} notes shown
            </span>
          )}
        </div>
      )}
    </div>
  );
};
