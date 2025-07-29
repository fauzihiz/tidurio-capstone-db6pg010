// tests/api/users.test.js
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt'); // For generating tokens in tests
const Supertest = require('supertest');

const usersPlugin = require('../../src/api/users');
const pool = require('../../src/services/db/postgres'); // Import the actual pool
const config = require('../../src/utils/config'); // Needed for JWT secret

const { init } = require('../../server');

// Mock the pool.query for database calls
jest.mock('../../src/services/db/postgres', () => ({
  query: jest.fn(),
}));

// Mock bcrypt (used in UserService) if you want to avoid actual hashing in tests
jest.mock('bcrypt', () => ({
  hash: jest.fn(() => 'hashedPassword'),
  compare: jest.fn((password, hashedPassword) => password === 'correctpassword'),
}));

describe('User API', () => {
  let server;
  let request;

  beforeAll(async () => {
    server = Hapi.server({
      port: 0,
      //host: 'localhost',
      host: '127.0.0.1',
    });

    // Register JWT plugin
    await server.register([
      { plugin: Jwt },
    ]);

    // Define JWT strategy
    server.auth.strategy('jwt_strategy', 'jwt', {
      keys: config.jwt.accessTokenKey,
      verify: {
        aud: false,
        iss: false,
        sub: false,
        maxAgeSec: config.jwt.accessTokenAge,
      },
      validate: (artifacts) => {
        return {
          isValid: true,
          credentials: { userId: artifacts.decoded.payload.userId },
        };
      },
    });

    // Register users plugin (with actual UserService, but its pool.query is mocked)
    await server.register([
      {
        plugin: usersPlugin.plugin,
        options: usersPlugin.options,
      },
    ]);

    // Set default auth strategy
    server.auth.default('jwt_strategy');

    await server.start();

    request = Supertest(server.listener); // Create a supertest agent
  });

  afterAll(async () => {
    await server.stop();
  });

  beforeEach(() => {
    pool.query.mockReset(); // Reset database mock before each test
    // Reset bcrypt mocks if they were used
    require('bcrypt').hash.mockClear();
    require('bcrypt').compare.mockClear();
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      // Mock DB queries for `addUser` method
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // check username
        .mockResolvedValueOnce({ rows: [] }) // check email
        .mockResolvedValueOnce({ rows: [{ id: 'user-new-id' }] }); // insert user

      const response = await request.post('/register').send({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.userId).toBeDefined();
    });

    it('should return 400 when username is already taken', async () => {
      // Mock DB query for `verifyNewUsernameAndEmail` to indicate username exists
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'existing-id' }] });

      const response = await request.post('/register').send({
        username: 'existinguser',
        email: 'some@example.com',
        password: 'password123',
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Username is already taken.');
    });

    // Add more test cases for invalid email, missing fields, etc.
  });

  describe('POST /login', () => {
    it('should return accessToken on successful login', async () => {
      // Mock DB query for `verifyUserCredential`
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 'user-abc', password: 'hashedPassword' }],
      });
      // Mock bcrypt.compare to return true
      require('bcrypt').compare.mockResolvedValueOnce(true);

      const response = await request.post('/login').send({
        email: 'user@example.com',
        password: 'correctpassword',
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      // Mock DB query for `verifyUserCredential` (no user found)
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request.post('/login').send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      });

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Invalid credentials');
    });
  });

  // Add integration tests for GET /dashboard, POST /sleeps/start, PUT /sleeps/{sleepLogId}/end etc.
});