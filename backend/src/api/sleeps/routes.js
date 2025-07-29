// src/api/sleeps/routes.js
const Joi = require('joi'); // Import Joi for schema validation

const routes = (handler) => [
  {
    method: 'POST',
    path: '/sleeps/start',
    handler: handler.postStartSleepHandler,
    options: {
      auth: 'jwt_strategy',
      description: 'Start a new sleep log',
      notes: 'Records the current time as the start time for a new sleep session for the authenticated user.',
      tags: ['api', 'Sleeps'], // Assign to the 'Sleeps' tag
      validate: {
        // No explicit payload needed here if userId is derived from JWT
        // If your handler still expects userId in payload, add it:
        // payload: Joi.object({
        //   userId: Joi.string().required().description('The ID of the user starting sleep.'),
        // }),
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '201': {
              description: 'Sleep log started successfully.',
              schema: Joi.object({
                status: Joi.string().valid('success').example('success'),
                message: Joi.string().example('Sleep log started successfully'),
                data: Joi.object({
                  sleepLogId: Joi.string().example('sleep-xyz123abc456').description('The ID of the newly created sleep log.'),
                }),
              }).label('StartSleepSuccessResponse'),
            },
            '401': { description: 'Unauthorized (missing or invalid JWT token).' },
            '500': { description: 'Internal Server Error.' },
          },
        },
      },
    },
  },
  {
    method: 'PUT',
    path: '/sleeps/{sleepLogId}/end', // Route with a path parameter
    handler: handler.putEndSleepHandler,
    options: {
      auth: 'jwt_strategy', // This route requires authentication
      description: 'End an existing sleep log',
      notes: 'Marks an ongoing sleep session as ended, calculates duration, awards points, updates user streak, and checks for achievements.',
      tags: ['api', 'Sleeps'], // Assign to the 'Sleeps' tag
      validate: {
        params: Joi.object({
          sleepLogId: Joi.string().required().description('The unique ID of the sleep log to end.').example('sleep-xyz123abc456'),
        }).label('EndSleepParams'),
        // Assuming userId is derived from JWT authentication and not in payload
        // If your handler still expects userId in payload, add it:
        // payload: Joi.object({
        //   userId: Joi.string().required().description('The ID of the user who owns this sleep log.'),
        // }).label('EndSleepPayload'),
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Sleep log ended successfully and points/streak calculated.',
              schema: Joi.object({
                status: Joi.string().valid('success').example('success'),
                message: Joi.string().example('Sleep log ended successfully'),
                data: Joi.object({
                  sleepLogId: Joi.string().example('sleep-xyz123abc456'),
                  durationMinutes: Joi.number().example(540).description('Total sleep duration in minutes.'),
                  pointsAwarded: Joi.number().example(140).description('Points awarded for this sleep session (base + streak bonus).'),
                  totalPoints: Joi.number().example(190).description('The user\'s new total points.'),
                  currentStreak: Joi.number().example(3).description('The user\'s new current sleep streak.'),
                  newlyUnlockedAchievements: Joi.array().items(Joi.string()).example(['Early Bird', 'Consistent Sleeper']).description('List of names of any achievements newly unlocked in this session.'),
                }),
              }).label('EndSleepSuccessResponse'),
            },
            '400': { description: 'Bad Request (e.g., sleep log already ended).' },
            '401': { description: 'Unauthorized (missing or invalid JWT token, or user ID does not match sleep log owner).' },
            '404': { description: 'Not Found (sleep log not found).' },
            '500': { description: 'Internal Server Error.' },
          },
        },
      },
    },
  },
];

module.exports = routes;