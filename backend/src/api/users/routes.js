// src/api/users/routes.js
const Joi = require('joi'); // Import Joi for schema validation

const routes = (handler) => [
  {
    method: 'POST',
    path: '/register',
    handler: handler.postUserHandler,
    options: {
      auth: false, // This route does NOT require authentication
      description: 'Register a new user',
      notes: 'Creates a new user account with a unique username and password.',
      tags: ['api', 'Users'], // Assign to the 'Users' tag
      validate: {
        payload: Joi.object({
          username: Joi.string().required().min(3).max(50).description('Unique username for the new account.'),
          password: Joi.string().required().min(6).description('Password for the new account.'),
          // Add any other registration fields you might have (e.g., email, display name)
        }).label('RegisterUserPayload'),
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '201': {
              description: 'User registered successfully.',
              schema: Joi.object({
                status: Joi.string().valid('success').example('success'),
                message: Joi.string().example('User registered successfully'),
                data: Joi.object({
                  userId: Joi.string().example('user-newuser123').description('The ID of the newly registered user.'),
                }),
              }).label('RegisterSuccessResponse'),
            },
            '400': { description: 'Bad Request (e.g., username already taken, invalid input).' },
            '500': { description: 'Internal Server Error.' },
          },
        },
      },
    },
  },
  {
    method: 'POST',
    path: '/login',
    handler: handler.postUserLoginHandler,
    options: {
      auth: false, // This route does NOT require authentication
      description: 'Login a user',
      notes: 'Authenticates a user and returns a JWT access token.',
      tags: ['api', 'Users'], // Assign to the 'Users' tag
      validate: {
        payload: Joi.object({
          username: Joi.string().required().description('Username for login.'),
          password: Joi.string().required().description('Password for login.'),
        }).label('LoginPayload'),
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Login successful.',
              schema: Joi.object({
                status: Joi.string().valid('success').example('success'),
                message: Joi.string().example('Login successful'),
                data: Joi.object({
                  accessToken: Joi.string().description('JWT access token for authentication.').example('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
                }),
              }).label('LoginSuccessResponse'),
            },
            '400': { description: 'Bad Request (e.g., invalid credentials).' },
            '500': { description: 'Internal Server Error.' },
          },
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/users/{id}',
    handler: handler.getUserByIdHandler,
    options: {
      auth: 'jwt_strategy', // auth: 'jwt_strategy' is implied by server.auth.default() unless explicitly set to false
      description: 'Get user details by ID',
      notes: 'Retrieves public profile details for a specific user.',
      tags: ['api', 'Users'], // Assign to the 'Users' tag
      validate: {
        params: Joi.object({
          id: Joi.string().required().description('The unique ID of the user.').example('user-abcde12345'),
        }).label('GetUserByIdParams'),
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'User details retrieved successfully.',
              schema: Joi.object({
                status: Joi.string().valid('success').example('success'),
                data: Joi.object({
                  id: Joi.string().example('user-abcde12345'),
                  username: Joi.string().example('john.doe'),
                  totalPoints: Joi.number().example(1200),
                  currentStreak: Joi.number().example(15),
                  createdAt: Joi.string().isoDate().example('2025-07-20T10:00:00.000Z'),
                  updatedAt: Joi.string().isoDate().example('2025-07-27T08:00:00.000Z'),
                  // Add other user fields you return (e.g., achievements)
                }),
              }).label('UserDetailResponse'),
            },
            '401': { description: 'Unauthorized (missing or invalid JWT token).' },
            '404': { description: 'Not Found (user not found).' },
            '500': { description: 'Internal Server Error.' },
          },
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/dashboard', // New dashboard route
    handler: handler.getUserDashboardHandler,
    options: {
      auth: 'jwt_strategy', // This route requires authentication
      description: 'Get user dashboard data',
      notes: 'Retrieves comprehensive dashboard data for the authenticated user, including total points, current streak, recent sleep logs, and unlocked achievements.',
      tags: ['api', 'Users'], // Assign to the 'Users' tag
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Dashboard data retrieved successfully.',
              schema: Joi.object({
                status: Joi.string().valid('success').example('success'),
                data: Joi.object({
                  userId: Joi.string().example('user-abcde12345'),
                  totalPoints: Joi.number().example(1500).description('Total points accumulated by the user.'),
                  currentStreak: Joi.number().example(20).description('Current consecutive quality sleep streak.'),
                  lastSleep: Joi.object().optional().description('Details of the last completed sleep log.')
                    .unknown(true), // Allow other fields not explicitly defined if your actual model is richer
                  recentSleeps: Joi.array().items(Joi.object().unknown(true)).description('Array of recent sleep log summaries.'),
                  unlockedAchievements: Joi.array().items(Joi.object().unknown(true)).description('Array of achievements unlocked by the user.'),
                  // Add any other dashboard specific data
                }),
              }).label('UserDashboardResponse'),
            },
            '401': { description: 'Unauthorized (missing or invalid JWT token).' },
            '500': { description: 'Internal Server Error.' },
          },
        },
      },
    },
  },
];

module.exports = routes;