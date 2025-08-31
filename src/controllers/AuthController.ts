import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { ApiResponse } from '../types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login({ email, password });

      const response: ApiResponse<typeof result> = {
        success: true,
        payload: result,
        message: 'Login successful'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Login failed'
      };

      res.status(401).json(response);
    }
  };

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);

      const response: ApiResponse<typeof result> = {
        success: true,
        payload: result,
        message: 'User registered successfully'
      };

      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Registration failed'
      };

      res.status(400).json(response);
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;
      
      if (!user) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof user> = {
        success: true,
        payload: user,
        message: 'Profile retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get profile'
      };

      res.status(500).json(response);
    }
  };
} 