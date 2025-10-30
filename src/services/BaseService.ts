/**
 * Base service class that provides common API functionality for all services
 */
export abstract class BaseService {
  protected static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  /**
   * Builds the full API endpoint URL with proper normalization to prevent duplicate slashes
   * and handle various input formats safely
   * @param endpoint - The service-specific endpoint (e.g., '/auth', 'auth', '/notes/', 'notes')
   * @param path - Optional additional path (e.g., '/login', 'create', '/:id', 'users/:id/')
   * @returns Complete API URL with normalized path separators
   */
  protected static buildUrl(endpoint: string, path: string = ''): string {
    // Get the current API_BASE_URL (allows for dynamic env var changes in tests)
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    
    // Normalize base URL - remove trailing slash if present
    const baseUrl = apiBaseUrl.replace(/\/$/, '');
    
    // Clean up endpoint - remove leading/trailing slashes and multiple slashes
    const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');
    
    // Clean up path - remove leading/trailing slashes and multiple slashes
    const cleanPath = path.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');
    
    // Build the URL parts
    const parts = [baseUrl];
    
    if (cleanEndpoint) {
      parts.push(cleanEndpoint);
    }
    
    if (cleanPath) {
      parts.push(cleanPath);
    }
    
    // Join with single slashes
    return parts.join('/');
  }
}
