'use client';

import { useState } from 'react';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../dialog';

interface NoteOption {
  type: 'note' | 'checklist';
  label: string;
  description: string;
}

interface NewNoteData {
  title: string;
  type: 'note' | 'checklist';
  tags: string[];
}

interface NewNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNote: (noteData: NewNoteData) => void;
}

/**
 * A multi-step modal component for creating new notes with type selection,
 * title input, and tag management
 */
export const NewNoteModal = ({
  isOpen,
  onClose,
  onCreateNote,
}: NewNoteModalProps) => {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [selectedType, setSelectedType] = useState<'note' | 'checklist' | null>(null);
  const [title, setTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const noteOptions: NoteOption[] = [
    {
      type: 'note',
      label: 'Note',
      description: 'Create a simple text note',
    },
    {
      type: 'checklist',
      label: 'Checklist',
      description: 'Create a checklist with checkable items',
    },
  ];

  const handleSelectType = (type: 'note' | 'checklist') => {
    setSelectedType(type);
    setStep('details');
  };

  const handleBack = () => {
    setStep('type');
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags(prev => [...prev, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleCreate = () => {
    if (selectedType && title.trim()) {
      onCreateNote({
        title: title.trim(),
        type: selectedType,
        tags,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    // Reset form state
    setStep('type');
    setSelectedType(null);
    setTitle('');
    setTagInput('');
    setTags([]);
    onClose();
  };

  const renderTypeSelection = () => (
    <>
      <DialogHeader>
        <DialogTitle>Create New Note</DialogTitle>
        <DialogDescription>
          Choose the type of note you want to create.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {noteOptions.map((option) => (
          <Button
            key={option.type}
            variant="outline"
            className="h-auto p-4 flex-col items-start text-left"
            onClick={() => handleSelectType(option.type)}
          >
            <div className="font-medium">{option.label}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {option.description}
            </div>
          </Button>
        ))}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
      </DialogFooter>
    </>
  );

  const renderDetailsForm = () => (
    <>
      <DialogHeader>
        <DialogTitle>
          {noteOptions.find(opt => opt.type === selectedType)?.label} Details
        </DialogTitle>
        <DialogDescription>
          Enter the details for your new {selectedType}.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Enter ${selectedType} title`}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a tag and press Enter"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddTag}
              disabled={!tagInput.trim()}
            >
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                >
                  <span>{tag}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button 
          onClick={handleCreate}
          disabled={!title.trim()}
        >
          Create {selectedType === 'checklist' ? 'Checklist' : 'Note'}
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        {step === 'type' ? renderTypeSelection() : renderDetailsForm()}
      </DialogContent>
    </Dialog>
  );
};
