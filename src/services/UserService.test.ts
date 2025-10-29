import { UserService } from './UserService';

// Create manual mocks for the modules
const mockReadFile = jest.fn();
const mockWriteFile = jest.fn();
const mockBcryptHash = jest.fn();
const mockBcryptCompare = jest.fn();
const mockJwtSign = jest.fn();
const mockJwtVerify = jest.fn();

// Mock the modules
jest.mock('fs/promises', () => ({
  readFile: (...args: any[]) => mockReadFile(...args),
  writeFile: (...args: any[]) => mockWriteFile(...args),
}));

jest.mock('bcryptjs', () => ({
  hash: (...args: any[]) => mockBcryptHash(...args),
  compare: (...args: any[]) => mockBcryptCompare(...args),
}));

jest.mock('jsonwebtoken', () => ({
  sign: (...args: any[]) => mockJwtSign(...args),
  verify: (...args: any[]) => mockJwtVerify(...args),
}));

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
    mockReadFile.mockReset();
    mockWriteFile.mockReset();
    mockBcryptHash.mockReset();
    mockBcryptCompare.mockReset();
    mockJwtSign.mockReset();
    mockJwtVerify.mockReset();
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const mockUsers = [
        { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'hashed' },
        { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', password: 'hashed' },
      ];
      mockReadFile.mockResolvedValueOnce(JSON.stringify(mockUsers));

      const result = await userService.findByEmail('john@example.com');

      expect(result).toMatchObject({
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(result).toHaveProperty('password');
    });

    it('should return null if user not found', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify([]));

      const result = await userService.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should return null if file does not exist', async () => {
      mockReadFile.mockRejectedValue(new Error('File not found'));

      const result = await userService.findByEmail('any@example.com');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      // First call for checking existing user returns empty array
      // Second call for saving also returns empty array
      mockReadFile.mockResolvedValueOnce(JSON.stringify([]));
      mockReadFile.mockResolvedValueOnce(JSON.stringify([]));
      mockBcryptHash.mockResolvedValue('hashedPassword');
      mockWriteFile.mockResolvedValue(undefined);

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = await userService.createUser(userData);

      expect(result).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });
      expect(result).not.toHaveProperty('password');
      expect(mockBcryptHash).toHaveBeenCalledWith('password123', 10);
    });

    it('should throw error if email already exists', async () => {
      const existingUsers = [
        { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'hashed' },
      ];
      mockReadFile.mockResolvedValue(JSON.stringify(existingUsers));

      const userData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'john@example.com',
        password: 'password123',
      };

      await expect(userService.createUser(userData)).rejects.toThrow('User with this email already exists');
    });
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      const mockUser = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
      };
      mockReadFile.mockResolvedValue(JSON.stringify([mockUser]));
      mockBcryptCompare.mockResolvedValue(true);

      const result = await userService.validateUser({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result).toMatchObject({
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('should return null for invalid password', async () => {
      const mockUser = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
      };
      mockReadFile.mockResolvedValue(JSON.stringify([mockUser]));
      mockBcryptCompare.mockResolvedValue(false);

      const result = await userService.validateUser({
        email: 'john@example.com',
        password: 'wrongpassword',
      });

      expect(result).toBeNull();
    });

    it('should return null if user not found', async () => {
      mockReadFile.mockResolvedValue(JSON.stringify([]));

      const result = await userService.validateUser({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(result).toBeNull();
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const mockUser = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };
      mockJwtSign.mockReturnValue('token123');

      const result = userService.generateToken(mockUser);

      expect(result).toBe('token123');
      expect(mockJwtSign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
        }),
        expect.any(String),
        { expiresIn: '7d' }
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const mockDecoded = {
        id: '1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      mockJwtVerify.mockReturnValue(mockDecoded);

      const result = userService.verifyToken('token123');

      expect(result).toEqual(mockDecoded);
    });

    it('should return null for invalid token', () => {
      mockJwtVerify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = userService.verifyToken('invalidtoken');

      expect(result).toBeNull();
    });
  });
});
