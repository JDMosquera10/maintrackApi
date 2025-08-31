import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { ApiResponse } from '../types';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.createUser(req.body);

      const response: ApiResponse<typeof result> = {
        success: true,
        payload: result,
        message: 'User created successfully'
      };

      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to create user'
      };

      res.status(400).json(response);
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

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
        message: 'User retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get user'
      };

      res.status(500).json(response);
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.userService.updateUser(id, req.body);

      if (!result) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof result> = {
        success: true,
        payload: result,
        message: 'User updated successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to update user'
      };

      res.status(400).json(response);
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.userService.deleteUser(id);

      if (!result) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'User not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'User deleted successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to delete user'
      };

      res.status(500).json(response);
    }
  };

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();

      const response: ApiResponse<typeof users> = {
        success: true,
        payload: users,
        message: 'Users retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get users'
      };

      res.status(500).json(response);
    }
  };

  getUsersActives = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getUsersActives();

      const response: ApiResponse<typeof users> = {
        success: true,
        payload: users,
        message: 'Active users retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to get active users'
      };

      res.status(500).json(response);
    }
  };
} 