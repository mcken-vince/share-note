import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { Note } from '@/types';
import { deserializeNotes, serializeNotes } from '@/lib/dateUtils';
import { safeSerializeNotes } from '@/lib/safeSerialize';
import { createSampleNotes } from '@/lib/sampleData';
import { getUserFromRequest } from '@/lib/auth';
import { generateId } from '@/lib/generateId';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'notes.json');

/**
 * Ensures the data directory and file exist
 */
async function ensureDataFile(): Promise<void> {
  const dataDir = path.dirname(DATA_FILE_PATH);
  
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }

  try {
    await fs.access(DATA_FILE_PATH);
  } catch {
    // File doesn't exist, create with empty array (user-specific data)
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify([], null, 2));
  }
}

/**
 * Reads notes from the JSON file for the specified user
 */
async function readNotesFromFile(userId: string): Promise<Note[]> {
  await ensureDataFile();
  
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const allNotes = JSON.parse(fileContent);
    
    // Filter notes by user ID and deserialize
    const userNotes = allNotes
      .filter((note: any) => note.userId === userId)
      .map((note: any) => deserializeNotes([note])[0]);
      
    return userNotes as Note[];
  } catch (error) {
    console.error('Error reading notes file:', error);
    // Return empty array for this user
    return [];
  }
}

/**
 * Writes notes to the JSON file
 */
async function writeNotesToFile(notes: Note[], userId: string): Promise<void> {
  await ensureDataFile();
  
  try {
    // Read all existing notes
    let allNotes: any[] = [];
    try {
      const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      allNotes = JSON.parse(fileContent);
    } catch {
      // File doesn't exist or is empty
    }

    // Remove existing notes for this user
    allNotes = allNotes.filter((note: any) => note.userId !== userId);
    
    // Add new notes for this user
    const serializedUserNotes = safeSerializeNotes(notes).map(note => ({
      ...note,
      userId
    }));
    
    allNotes.push(...serializedUserNotes);
    
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(allNotes, null, 2));
  } catch (error) {
    console.error('Error writing notes file:', error);
    throw new Error('Failed to save notes');
  }
}

/**
 * GET /api/notes - Retrieve all notes for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const notes = await readNotesFromFile(user.id);
    return NextResponse.json(notes);
  } catch (error) {
    console.error('GET /api/notes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notes - Save all notes for the authenticated user
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
    const { notes } = body;

    if (!Array.isArray(notes)) {
      return NextResponse.json(
        { error: 'Invalid notes data' },
        { status: 400 }
      );
    }

    await writeNotesToFile(notes, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/notes error:', error);
    return NextResponse.json(
      { error: 'Failed to save notes' },
      { status: 500 }
    );
  }
}