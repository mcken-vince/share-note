import type { Note } from '@/types';
import { generateId } from './generateId';
import { generateUUID } from './uuid';

/**
 * Creates sample notes for initial app state
 * Function to avoid duplicate IDs when called multiple times
 */
export function createSampleNotes(): Note[] {
  const now = Date.now();
  const sampleUserId = generateUUID(); // Generate a proper UUID for sample user
  
  return [
    {
      id: generateId(),
      userId: sampleUserId,
      title: 'Welcome to Share Note!',
      type: 'note' as const,
      body: 'This is your first note! You can:\n\n• Edit this note by clicking the Edit button\n• Create new notes using the "New Note" button\n• Add tags to organize your notes\n• Create checklists for tasks\n• All your notes are automatically saved\n\nStart by editing this note or creating a new one!',
      tags: ['welcome', 'getting-started'],
      createdAt: new Date(now - 86400000), // 1 day ago
      modifiedAt: new Date(now - 3600000), // 1 hour ago
    },
    {
      id: generateId(),
      userId: sampleUserId,
      title: 'Sample Shopping List',
      type: 'checklist' as const,
      items: [
        { checked: true, body: 'Buy groceries' },
        { checked: false, body: 'Pick up dry cleaning' },
        { checked: false, body: 'Call dentist for appointment' },
        { checked: false, body: 'Buy birthday gift' },
      ],
      tags: ['shopping', 'todo'],
      createdAt: new Date(now - 172800000), // 2 days ago
      modifiedAt: new Date(now - 7200000), // 2 hours ago
    },
    {
      id: generateId(),
      userId: sampleUserId,
      title: 'Meeting Notes - Q1 Planning',
      type: 'note' as const,
      body: 'Key points from today\'s Q1 planning meeting:\n\n• Focus on user experience improvements\n• Launch new feature by March\n• Hire 2 additional developers\n• Review budget allocation for marketing\n\nAction items:\n- Schedule follow-up meeting with design team\n- Prepare budget proposal\n- Update project timeline',
      tags: ['work', 'meeting', 'planning', 'q1'],
      createdAt: new Date(now - 259200000), // 3 days ago
      modifiedAt: new Date(now - 259200000), // 3 days ago
    },
  ];
}

/**
 * Checks if the app needs to be populated with sample data
 */
export function shouldLoadSampleData(existingNotes: Note[]): boolean {
  return existingNotes.length === 0;
}
