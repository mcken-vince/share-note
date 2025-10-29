import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserWithPassword, LoginCredentials } from '@/types';
import { generateUUID } from '@/lib/uuid';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export class UserService {
  private async readUsers(): Promise<UserWithPassword[]> {
    try {
      const data = await readFile(DATA_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist, return empty array
      return [];
    }
  }

  private async writeUsers(users: UserWithPassword[]): Promise<void> {
    await writeFile(DATA_FILE_PATH, JSON.stringify(users, null, 2));
  }

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const users = await this.readUsers();
    return users.find(user => user.email === email) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.readUsers();
    const user = users.find(u => u.id === id);
    
    if (!user) {
      return null;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create new user with UUID
    const newUser: UserWithPassword = {
      id: generateUUID(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: hashedPassword,
    };

    // Save to file
    const users = await this.readUsers();
    users.push(newUser);
    await this.writeUsers(users);

    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async validateUser(credentials: LoginCredentials): Promise<User | null> {
    const user = await this.findByEmail(credentials.email);
    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    if (!isValidPassword) {
      return null;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  generateToken(user: User): string {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): User | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return {
        id: decoded.id,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
      };
    } catch (error) {
      return null;
    }
  }

  async updateUser(userId: string, updates: { firstName?: string; lastName?: string }): Promise<User> {
    const users = await this.readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
    };

    await this.writeUsers(users);

    // Return updated user without password
    const { password, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const users = await this.readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    users[userIndex].password = hashedPassword;
    
    await this.writeUsers(users);
  }
}
