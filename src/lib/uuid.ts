import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

/**
 * Generates a new UUID v4
 */
export function generateUUID(): string {
  return uuidv4();
}

/**
 * Validates if a string is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  return uuidValidate(uuid);
}

/**
 * Generates a UUID for system/sample data
 */
export function getSystemUUID(): string {
  // Use a consistent UUID for system/sample data so it can be easily identified
  return '00000000-0000-0000-0000-000000000000';
}

/**
 * Checks if a UUID belongs to system/sample data
 */
export function isSystemUUID(uuid: string): boolean {
  return uuid === '00000000-0000-0000-0000-000000000000';
}
