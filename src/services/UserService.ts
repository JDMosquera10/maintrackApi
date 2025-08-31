import { UserModel } from '../models/User';
import { IUserService } from '../interfaces/services';
import { User } from '../types';
import { convertObjectIdToString, convertArrayObjectIdsToString } from '../utils/helpers';

export class UserService implements IUserService {
  async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user = new UserModel(userData);
    await user.save();
    return convertObjectIdToString(user.toObject());
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    if (!user) return null;
    return convertObjectIdToString(user.toObject());
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    if (!user) return null;
    return convertObjectIdToString(user.toObject());
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      userData,
      { new: true, runValidators: true }
    );
    if (!user) return null;
    return convertObjectIdToString(user.toObject());
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await UserModel.find({});
    return convertArrayObjectIdsToString(users.map(user => user.toObject()));
  }

  async getUsersActives(): Promise<User[]> {
    const users = await UserModel.find({"isActive" : true});
    return convertArrayObjectIdsToString(users.map(user => user.toObject()));
  }
} 