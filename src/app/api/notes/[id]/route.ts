import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { Note } from '@/types';
import { deserializeNotes } from '@/lib/dateUtils';
import { safeSerializeNotes } from '@/lib/safeSerialize';
import { getUserFromRequest } from '@/lib/auth';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'notes.json');

/**
 * PATCH /api/notes/[id] - Update a specific note
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const noteId = params.id;
    const body = await request.json();

    // Read existing notes
    let allNotes: any[] = [];
    try {
      const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      allNotes = JSON.parse(fileContent);
    } catch {
      return NextResponse.json(
        { error: 'Notes file not found' },
        { status: 404 }
      );
    }

    // Find the note to update (must belong to the user)
    const noteIndex = allNotes.findIndex(
      (note: any) => note.id === noteId && note.userId === user.id
    );

    if (noteIndex === -1) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Update the note
    const existingNote = allNotes[noteIndex];
    const updatedNote = {
      ...existingNote,
      ...body,
      id: noteId, // Ensure ID doesn't change
      userId: user.id, // Ensure userId doesn't change
      modifiedAt: new Date().toISOString(),
    };

    allNotes[noteIndex] = updatedNote;

    // Save back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(allNotes, null, 2));

    // Deserialize the note for response
    const deserializedNote = deserializeNotes([updatedNote])[0] as Note;

    return NextResponse.json({ note: deserializedNote });
  } catch (error) {
    console.error('PATCH /api/notes/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notes/[id] - Delete a specific note
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const noteId = params.id;

    // Read existing notes
    let allNotes: any[] = [];
    try {
      const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      allNotes = JSON.parse(fileContent);
    } catch {
      return NextResponse.json(
        { error: 'Notes file not found' },
        { status: 404 }
      );
    }

    // Find and remove the note (must belong to the user)
    const originalLength = allNotes.length;
    allNotes = allNotes.filter(
      (note: any) => !(note.id === noteId && note.userId === user.id)
    );

    if (allNotes.length === originalLength) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Save back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(allNotes, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/notes/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}