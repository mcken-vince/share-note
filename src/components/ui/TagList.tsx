'use client';

import { Badge } from './badge';

interface TagListProps {
  tags: string[];
  maxDisplay?: number;
  className?: string;
}

/**
 * A component for displaying a list of tags with badges,
 * with optional limit on displayed tags
 */
export const TagList = ({ 
  tags, 
  maxDisplay = 3, 
  className = '' 
}: TagListProps) => {
  if (tags.length === 0) {
    return <span className="text-muted-foreground text-sm">No tags</span>;
  }

  const displayTags = tags.slice(0, maxDisplay);
  const remainingCount = tags.length - maxDisplay;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayTags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
};
