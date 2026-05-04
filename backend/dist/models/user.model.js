"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.UserModel = {
    async create(data) {
        const result = await database_1.default.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', [data.name, data.email, data.password]);
        return result.rows[0];
    },
    async findByEmail(email) {
        const result = await database_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    },
    async findById(id) {
        const result = await database_1.default.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    },
};
