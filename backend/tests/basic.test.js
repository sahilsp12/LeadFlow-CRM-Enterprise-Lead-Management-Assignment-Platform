const request = require('supertest');
const app = require('../src/app');

describe('Basic API Testing', () => {

  test('Should return 404 for unknown route', async () => {

    const response = await request(app)
      .get('/unknown-route');

    expect(response.statusCode).toBe(404);

  });

});