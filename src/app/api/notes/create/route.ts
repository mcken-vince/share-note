import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { Note } from '@/types';
import { deserializeNotes } from '@/lib/dateUtils';
import { safeSerializeNotes } from '@/lib/safeSerialize';
import { getUserFromRequest } from '@/lib/auth';
import { generateId } from '@/lib/generateId';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'notes.json');

/**
 * POST /api/notes/create - Create a new note for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, type, tags = [], body: noteBody, items } = body;

    // Validate required fields
    if (!title || !type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      );
    }

    if (type !== 'note' && type !== 'checklist') {
      return NextResponse.json(
        { error: 'Type must be either "note" or "checklist"' },
        { status: 400 }
      );
    }

    // Create the new note
    const now = new Date();
    const newNote: Note = {
      id: generateId(),
      userId: user.id,
      title,
      type,
      body: noteBody,
      items,
      tags: Array.isArray(tags) ? tags : [],
      createdAt: now,
      modifiedAt: now,
    };

    // Read existing notes
    let allNotes: any[] = [];
    try {
      const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      allNotes = JSON.parse(fileContent);
    } catch {
      // File doesn't exist or is empty - create directory if needed
      const dataDir = path.dirname(DATA_FILE_PATH);
      try {
        await fs.access(dataDir);
      } catch {
        await fs.mkdir(dataDir, { recursive: true });
      }
    }

    // Add the new note with user ID
    const serializedNote = safeSerializeNotes([newNote])[0];
    allNotes.push({
      ...serializedNote,
      userId: user.id
    });

    // Save back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(allNotes, null, 2));

    return NextResponse.json({ note: newNote });
  } catch (error) {
    console.error('POST /api/notes/create error:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}