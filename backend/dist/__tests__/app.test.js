"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
// Simple mocks
jest.mock('../config/database', () => ({
    __esModule: true,
    default: { query: jest.fn() },
    connectDB: jest.fn().mockResolvedValue(undefined),
    initDB: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../config/logger', () => ({
    __esModule: true,
    default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));
describe('Health Check', () => {
    it('should return status ok', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });
});
describe('Auth Validation', () => {
    it('should return 400 when register fields are missing', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({ email: 'test@test.com' }); // missing name and password
        expect(res.status).toBe(400);
    });
    it('should return 400 when login fields are missing', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({ email: 'test@test.com' }); // missing password
        expect(res.status).toBe(400);
    });
});
describe('Protected Routes', () => {
    it('should return 401 when no token provided', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/tasks');
        expect(res.status).toBe(401);
    });
});
