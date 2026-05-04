import { Response } from 'express';
import { TaskModel } from '../models/task.model';
import { AuthRequest } from '../middleware/auth.middleware';
import logger from '../config/logger';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tasks = await TaskModel.findAllByUser(req.userId!);
    res.json(tasks);
  } catch (err) {
    logger.error('GetTasks error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await TaskModel.findById(parseInt(req.params['id'] as string), req.userId!);
    if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, due_date } = req.body;
    if (!title) { res.status(400).json({ error: 'Title is required' }); return; }
    const task = await TaskModel.create(req.userId!, { title, description, status, priority, due_date });
    logger.info(`Task created: ${task.id} by user ${req.userId}`);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await TaskModel.update(parseInt(req.params['id'] as string), req.userId!, req.body);
    if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deleted = await TaskModel.delete(parseInt(req.params['id'] as string), req.userId!);
    if (!deleted) { res.status(404).json({ error: 'Task not found' }); return; }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};