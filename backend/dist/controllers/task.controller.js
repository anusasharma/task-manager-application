"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.getTask = exports.getTasks = void 0;
const task_model_1 = require("../models/task.model");
const logger_1 = __importDefault(require("../config/logger"));
const getTasks = async (req, res) => {
    try {
        const tasks = await task_model_1.TaskModel.findAllByUser(req.userId);
        res.json(tasks);
    }
    catch (err) {
        logger_1.default.error('GetTasks error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getTasks = getTasks;
const getTask = async (req, res) => {
    try {
        const task = await task_model_1.TaskModel.findById(parseInt(req.params['id']), req.userId);
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        res.json(task);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getTask = getTask;
const createTask = async (req, res) => {
    try {
        const { title, description, status, priority, due_date } = req.body;
        if (!title) {
            res.status(400).json({ error: 'Title is required' });
            return;
        }
        const task = await task_model_1.TaskModel.create(req.userId, { title, description, status, priority, due_date });
        logger_1.default.info(`Task created: ${task.id} by user ${req.userId}`);
        res.status(201).json(task);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    try {
        const task = await task_model_1.TaskModel.update(parseInt(req.params['id']), req.userId, req.body);
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        res.json(task);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const deleted = await task_model_1.TaskModel.delete(parseInt(req.params['id']), req.userId);
        if (!deleted) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteTask = deleteTask;
