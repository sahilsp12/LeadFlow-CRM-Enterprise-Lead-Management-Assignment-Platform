const request = require('supertest');
const app = require('../src/app');

describe('Authentication API', () => {

  test('Should fail login with invalid credentials', async () => {

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      });

    expect(response.statusCode).toBe(401);

  });

});