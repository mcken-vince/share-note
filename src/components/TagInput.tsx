'use client';

import { useState, KeyboardEvent } from 'react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { X as XIcon, Plus as PlusIcon } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Component for managing tags with add/remove functionality
 */
export const TagInput = ({ 
  tags, 
  onChange, 
  placeholder = "Add a tag...",
  className,
  disabled = false
}: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onChange([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove the last tag if backspace is pressed with empty input
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className={className}>
      {/* Display existing tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              {!disabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTag(tag)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  title={`Remove ${tag} tag`}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
        </div>
      )}
      
      {/* Input for adding new tags */}
      {!disabled && (
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button
            onClick={addTag}
            disabled={!inputValue.trim() || tags.includes(inputValue.trim())}
            size="sm"
            variant="outline"
            title="Add tag"
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
