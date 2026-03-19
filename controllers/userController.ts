import { Request, Response } from 'express';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth.js';

// [ADMIN] Get all users
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

// [ADMIN/USER] Get user by ID - ADMIN can view any, USER can only view themselves
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(String(req.params.id), {
      attributes: { exclude: ['password_hash'] }
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
};

// [PUBLIC] User Signup
export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password, first_name, last_name, address, phone_number, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Only allow ADMIN role if explicitly set and validated elsewhere, default to USER
    const userRole = role === 'ADMIN' ? 'ADMIN' : 'USER';

    const newUser = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      first_name,
      last_name,
      address,
      phone_number,
      role: userRole,
    });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

// [PUBLIC] User Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

// [ADMIN] Create user (admin only)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, first_name, last_name, address, phone_number, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      first_name,
      last_name,
      address,
      phone_number,
      role: role || 'USER',
    });
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

// [ADMIN] Update user
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(String(req.params.id));
    if (user) {
      await user.update(req.body);
      res.json({
        message: 'User updated successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};

// [ADMIN] Delete user
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(String(req.params.id));
    if (user) {
      await user.destroy();
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};
