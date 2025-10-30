import { BaseService } from './BaseService';

// Create a concrete test implementation of BaseService since it's abstract
class TestService extends BaseService {
  static testBuildUrl(endpoint: string, path?: string): string {
    return this.buildUrl(endpoint, path);
  }
  
  static get testApiBaseUrl(): string {
    return this.API_BASE_URL;
  }
}

describe('BaseService', () => {
  // Store original env var to restore later
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  afterEach(() => {
    // Restore original env var
    if (originalApiUrl !== undefined) {
      process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    } else {
      delete process.env.NEXT_PUBLIC_API_URL;
    }
  });

  describe('API_BASE_URL configuration', () => {
    it('should use environment variable when available', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
      
      // Test through buildUrl since it uses dynamic env var reading
      expect(TestService.testBuildUrl('/auth', '/login')).toBe('https://api.example.com/auth/login');
    });

    it('should use default URL when environment variable is not set', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      
      expect(TestService.testBuildUrl('/auth', '/login')).toBe('http://localhost:3000/api/auth/login');
    });
  });

  describe('buildUrl', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api';
    });

    describe('basic functionality', () => {
      it('should build URL with endpoint only', () => {
        expect(TestService.testBuildUrl('/auth')).toBe('http://localhost:3000/api/auth');
      });

      it('should build URL with endpoint and path', () => {
        expect(TestService.testBuildUrl('/auth', '/login')).toBe('http://localhost:3000/api/auth/login');
      });

      it('should handle empty path', () => {
        expect(TestService.testBuildUrl('/notes', '')).toBe('http://localhost:3000/api/notes');
      });

      it('should handle undefined path', () => {
        expect(TestService.testBuildUrl('/notes')).toBe('http://localhost:3000/api/notes');
      });
    });

    describe('slash normalization', () => {
      it('should handle endpoint without leading slash', () => {
        expect(TestService.testBuildUrl('auth', '/login')).toBe('http://localhost:3000/api/auth/login');
      });

      it('should handle path without leading slash', () => {
        expect(TestService.testBuildUrl('/auth', 'login')).toBe('http://localhost:3000/api/auth/login');
      });

      it('should handle both endpoint and path without leading slashes', () => {
        expect(TestService.testBuildUrl('auth', 'login')).toBe('http://localhost:3000/api/auth/login');
      });

      it('should remove trailing slash from endpoint', () => {
        expect(TestService.testBuildUrl('/auth/', '/login')).toBe('http://localhost:3000/api/auth/login');
      });

      it('should remove trailing slash from path', () => {
        expect(TestService.testBuildUrl('/auth', '/login/')).toBe('http://localhost:3000/api/auth/login');
      });

      it('should handle multiple trailing slashes', () => {
        expect(TestService.testBuildUrl('/auth///', '/login///')).toBe('http://localhost:3000/api/auth/login');
      });

      it('should handle base URL with trailing slash', () => {
        process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api/';
        
        expect(TestService.testBuildUrl('/auth', '/login')).toBe('http://localhost:3000/api/auth/login');
      });
    });

    describe('duplicate slash prevention', () => {
      it('should prevent duplicate slashes in the middle of URL', () => {
        expect(TestService.testBuildUrl('//auth//', '//login//')).toBe('http://localhost:3000/api/auth/login');
      });

      it('should preserve protocol slashes', () => {
        process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/v1';
        
        expect(TestService.testBuildUrl('/auth', '/login')).toBe('https://api.example.com/v1/auth/login');
      });

      it('should handle URLs with ports', () => {
        process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080/api';
        
        expect(TestService.testBuildUrl('/auth', '/login')).toBe('http://localhost:8080/api/auth/login');
      });
    });

    describe('complex path scenarios', () => {
      it('should handle nested paths', () => {
        expect(TestService.testBuildUrl('/user', '/123/profile')).toBe('http://localhost:3000/api/user/123/profile');
      });

      it('should handle paths with parameters', () => {
        expect(TestService.testBuildUrl('/notes', '/abc-123/edit')).toBe('http://localhost:3000/api/notes/abc-123/edit');
      });

      it('should handle complex nested paths', () => {
        expect(TestService.testBuildUrl('/user', '/123/notes/456/comments')).toBe('http://localhost:3000/api/user/123/notes/456/comments');
      });

      it('should handle single character paths', () => {
        expect(TestService.testBuildUrl('/api', '/v')).toBe('http://localhost:3000/api/api/v');
      });
    });

    describe('edge cases', () => {
      it('should handle empty endpoint', () => {
        expect(TestService.testBuildUrl('', '/login')).toBe('http://localhost:3000/api/login');
      });

      it('should handle just slashes', () => {
        expect(TestService.testBuildUrl('/', '/')).toBe('http://localhost:3000/api');
      });

      it('should handle endpoint with only slashes', () => {
        expect(TestService.testBuildUrl('///', '/login')).toBe('http://localhost:3000/api/login');
      });

      it('should handle path with only slashes', () => {
        expect(TestService.testBuildUrl('/auth', '///')).toBe('http://localhost:3000/api/auth');
      });

      it('should handle very long paths', () => {
        const longPath = '/very/long/path/with/many/segments/that/goes/on/and/on';
        expect(TestService.testBuildUrl('/api', longPath)).toBe(`http://localhost:3000/api/api${longPath}`);
      });
    });

    describe('real-world usage examples', () => {
      it('should handle auth service patterns', () => {
        expect(TestService.testBuildUrl('/auth', '/login')).toBe('http://localhost:3000/api/auth/login');
        expect(TestService.testBuildUrl('/auth', '/signup')).toBe('http://localhost:3000/api/auth/signup');
        expect(TestService.testBuildUrl('/auth', '/verify')).toBe('http://localhost:3000/api/auth/verify');
        expect(TestService.testBuildUrl('/auth', '/profile')).toBe('http://localhost:3000/api/auth/profile');
        expect(TestService.testBuildUrl('/auth', '/change-password')).toBe('http://localhost:3000/api/auth/change-password');
      });

      it('should handle notes service patterns', () => {
        expect(TestService.testBuildUrl('/notes')).toBe('http://localhost:3000/api/notes');
        expect(TestService.testBuildUrl('/notes', '/create')).toBe('http://localhost:3000/api/notes/create');
        expect(TestService.testBuildUrl('/notes', '/note-123')).toBe('http://localhost:3000/api/notes/note-123');
      });

      it('should handle user service patterns', () => {
        expect(TestService.testBuildUrl('/user', '/123')).toBe('http://localhost:3000/api/user/123');
        expect(TestService.testBuildUrl('/user', '/456/password')).toBe('http://localhost:3000/api/user/456/password');
        expect(TestService.testBuildUrl('/user', '/789/pause')).toBe('http://localhost:3000/api/user/789/pause');
        expect(TestService.testBuildUrl('/user', '/101/delete')).toBe('http://localhost:3000/api/user/101/delete');
      });
    });

    describe('different base URL formats', () => {
      it('should handle base URL without /api suffix', () => {
        process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
        
        expect(TestService.testBuildUrl('/auth', '/login')).toBe('http://localhost:3000/auth/login');
      });

      it('should handle base URL with version', () => {
        process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/v2';
        
        expect(TestService.testBuildUrl('/auth', '/login')).toBe('https://api.example.com/v2/auth/login');
      });

      it('should handle subdomain APIs', () => {
        process.env.NEXT_PUBLIC_API_URL = 'https://api.subdomain.example.com/graphql';
        
        expect(TestService.testBuildUrl('/query', '/users')).toBe('https://api.subdomain.example.com/graphql/query/users');
      });
    });
  });
});
