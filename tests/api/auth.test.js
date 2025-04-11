const request = require('supertest');
const app = require('../../server.cjs');

// Ensure the server is properly initialized for testing
beforeAll(() => {
  app.listen(3001, () => console.log('Test server running on port 3001'));
});

describe('Auth API', () => {
  test('Register new user', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});
