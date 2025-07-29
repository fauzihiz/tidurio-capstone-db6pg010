// tests/services/UserService.test.js
const UserService = require('../../src/services/UserService');
const pool = require('../../src/services/db/postgres'); // Import the actual pool
const InvariantError = require('../../src/exceptions/InvariantError');
const AuthenticationError = require('../../src/exceptions/AuthenticationError');
const NotFoundError = require('../../src/exceptions/NotFoundError');

// Mock the entire 'pg' pool module
jest.mock('../../src/services/db/postgres', () => ({
  query: jest.fn(), // Mock the query method
}));

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    // Reset mock before each test
    pool.query.mockReset();
  });

  describe('addUser', () => {
    it('should add a new user successfully', async () => {
      // Mock unique username/email check
      pool.query.mockResolvedValueOnce({ rows: [] }) // No existing username
        .mockResolvedValueOnce({ rows: [] }); // No existing email

      // Mock the insert operation
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'user-test12345' }] });

      const userId = await userService.addUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(userId).toBe('user-test12345');
      expect(pool.query).toHaveBeenCalledTimes(3); // 2 for verification + 1 for insert
      // You can add more specific assertions about the query calls if needed
    });

    it('should throw InvariantError when username is already taken', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'existing-id' }] }); // Username exists

      await expect(userService.addUser({
        username: 'existinguser',
        email: 'new@example.com',
        password: 'password123',
      })).rejects.toThrow(InvariantError);

      expect(pool.query).toHaveBeenCalledTimes(1); // Only username check
    });

    it('should throw InvariantError when email is already registered', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }) // Username is unique
        .mockResolvedValueOnce({ rows: [{ id: 'existing-id' }] }); // Email exists

      await expect(userService.addUser({
        username: 'uniqueuser',
        email: 'existing@example.com',
        password: 'password123',
      })).rejects.toThrow(InvariantError);

      expect(pool.query).toHaveBeenCalledTimes(2); // Username check + email check
    });

    it('should throw InvariantError if user insertion fails', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }) // Username unique
        .mockResolvedValueOnce({ rows: [] }) // Email unique
        .mockResolvedValueOnce({ rows: [] }); // Insertion fails (no returning id)

      await expect(userService.addUser({
        username: 'failuser',
        email: 'fail@example.com',
        password: 'password123',
      })).rejects.toThrow(InvariantError);

      expect(pool.query).toHaveBeenCalledTimes(3);
    });
  });

  describe('verifyUserCredential', () => {
    it('should return userId on successful authentication', async () => {
      // Mock the query for fetching user by email
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 'user-123', password: await require('bcrypt').hash('correctpassword', 10) }],
      });

      const userId = await userService.verifyUserCredential('user@example.com', 'correctpassword');
      expect(userId).toBe('user-123');
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw AuthenticationError for invalid email', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }); // No user found

      await expect(userService.verifyUserCredential('nonexistent@example.com', 'password')).rejects.toThrow(AuthenticationError);
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw AuthenticationError for incorrect password', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 'user-123', password: await require('bcrypt').hash('wrongpassword', 10) }],
      });

      await expect(userService.verifyUserCredential('user@example.com', 'correctpassword')).rejects.toThrow(AuthenticationError);
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });

  // Add more unit tests for getUserById, getUserDashboardData etc.
});