import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { generateId } from './generateId';
export { serializeNote, deserializeNote, serializeNotes, deserializeNotes } from './dateUtils';
export { createSampleNotes, shouldLoadSampleData } from './sampleData';
