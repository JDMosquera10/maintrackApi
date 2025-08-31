import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { IAuthService } from '../interfaces/services';
import { LoginRequest, AuthResponse, User } from '../types';

export class AuthService implements IAuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || '$2a$10$01MwPfS7DH.Ycoh7jqwNkeGxZj3ExRRAYj2g2lwVpkX/mfSwWW5dG';
  private readonly JWT_EXPIRES_IN = '24h';

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { email, password } = credentials;

    const user = await UserModel.findOne({ email, isActive: true });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await this.comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };
  }

  async register(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<AuthResponse> {
    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await this.hashPassword(userData.password);

    const newUser = new UserModel({
      ...userData,
      password: hashedPassword
    });

    await newUser.save();

    const token = this.generateToken(newUser);

    return {
      token,
      user: {
        _id: newUser._id.toString(),
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      }
    };
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      const user = await UserModel.findById(decoded.userId);
      return user ? user.toObject() : null;
    } catch (error) {
      return null;
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private generateToken(user: any): string {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    });
  }
} 