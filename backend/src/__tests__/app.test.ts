import request from 'supertest';
import app from '../app';

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
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Auth Validation', () => {
  it('should return 400 when register fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' }); // missing name and password
    expect(res.status).toBe(400);
  });

  it('should return 400 when login fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com' }); // missing password
    expect(res.status).toBe(400);
  });
});

describe('Protected Routes', () => {
  it('should return 401 when no token provided', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });
});