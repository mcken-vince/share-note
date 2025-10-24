import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { Note } from '@/types';
import { deserializeNotes, serializeNotes } from '@/lib/dateUtils';
import { safeSerializeNotes } from '@/lib/safeSerialize';
import { createSampleNotes } from '@/lib/sampleData';

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
    // File doesn't exist, create with sample data
    const sampleNotes = createSampleNotes();
    const serializedNotes = serializeNotes(sampleNotes);
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(serializedNotes, null, 2));
  }
}

/**
 * Reads notes from the JSON file
 */
async function readNotesFromFile(): Promise<Note[]> {
  await ensureDataFile();
  
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const serializedNotes = JSON.parse(fileContent);
    return deserializeNotes(serializedNotes) as Note[];
  } catch (error) {
    console.error('Error reading notes file:', error);
    // Return sample data if there's an error
    return createSampleNotes();
  }
}

/**
 * Writes notes to the JSON file
 */
async function writeNotesToFile(notes: Note[]): Promise<void> {
  await ensureDataFile();
  
  try {
    const serializedNotes = safeSerializeNotes(notes);
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(serializedNotes, null, 2));
  } catch (error) {
    console.error('Error writing notes file:', error);
    throw new Error('Failed to save notes');
  }
}

/**
 * GET /api/notes - Retrieve all notes
 */
export async function GET() {
  try {
    const notes = await readNotesFromFile();
    return NextResponse.json({ notes });
  } catch (error) {
    console.error('GET /api/notes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notes - Save all notes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notes } = body;

    if (!Array.isArray(notes)) {
      return NextResponse.json(
        { error: 'Invalid notes data' },
        { status: 400 }
      );
    }

    await writeNotesToFile(notes);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/notes error:', error);
    return NextResponse.json(
      { error: 'Failed to save notes' },
      { status: 500 }
    );
  }
}
