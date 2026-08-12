import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { loadConfig } from '../src/config/index.js';
import { createApp } from '../src/app.js';

// API validation tests should not require a live MongoDB connection.
// The single test that reaches the repository layer (404 for a
// well-formed but non-existent audit_id) mocks the model instead.
vi.mock('../src/models/audit.js', () => ({
  AuditModel: {
    findById: vi.fn().mockResolvedValue(null),
  },
}));

describe('API Endpoints', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    // Set required env vars for test
    process.env.MONGODB_URI = 'mongodb+srv://test:test@localhost/test';
    process.env.PORT = '5001';
    process.env.NODE_ENV = 'test';

    loadConfig();
    app = createApp();
  });

  describe('GET /health', () => {
    it('returns 200 with ok status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('POST /audit', () => {
    it('returns 400 for missing URL', async () => {
      const response = await request(app).post('/audit').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for invalid URL format', async () => {
      const response = await request(app).post('/audit').send({
        url: 'not-a-url',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for non-http protocol', async () => {
      const response = await request(app).post('/audit').send({
        url: 'file:///etc/passwd',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for localhost', async () => {
      const response = await request(app).post('/audit').send({
        url: 'http://localhost:8000',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for private IP (127.0.0.1)', async () => {
      const response = await request(app).post('/audit').send({
        url: 'http://127.0.0.1:5000',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for private IP (192.168.x.x)', async () => {
      const response = await request(app).post('/audit').send({
        url: 'http://192.168.1.1',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for private IP (10.x.x.x)', async () => {
      const response = await request(app).post('/audit').send({
        url: 'http://10.0.0.1',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /audit/:audit_id', () => {
    it('returns 400 for invalid audit_id format', async () => {
      const response = await request(app).get('/audit/invalid');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for non-hex audit_id', async () => {
      const response = await request(app).get('/audit/00000000000000000000000z');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 404 for non-existent audit_id', async () => {
      const response = await request(app).get('/audit/000000000000000000000000');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('404 Handler', () => {
    it('returns 404 for undefined routes', async () => {
      const response = await request(app).get('/invalid-route');

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
