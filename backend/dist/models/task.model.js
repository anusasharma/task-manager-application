"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModel = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.TaskModel = {
    async findAllByUser(userId) {
        const result = await database_1.default.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        return result.rows;
    },
    async findById(id, userId) {
        const result = await database_1.default.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
        return result.rows[0] || null;
    },
    async create(userId, data) {
        const result = await database_1.default.query(`INSERT INTO tasks (user_id, title, description, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [
            userId,
            data.title,
            data.description || null,
            data.status || 'todo',
            data.priority || 'medium',
            data.due_date || null
        ]);
        return result.rows[0];
    },
    async update(id, userId, data) {
        const result = await database_1.default.query(`UPDATE tasks
       SET title = $1, description = $2, status = $3, priority = $4, due_date = $5, updated_at = NOW()
       WHERE id = $6 AND user_id = $7
       RETURNING *`, [
            data.title,
            data.description || null,
            data.status || 'todo',
            data.priority || 'medium',
            data.due_date || null,
            id,
            userId
        ]);
        return result.rows[0] || null;
    },
    async delete(id, userId) {
        const result = await database_1.default.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
        return (result.rowCount ?? 0) > 0;
    },
};
