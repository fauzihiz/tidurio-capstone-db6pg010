// src/api/sleeps/handler.js
const { SleepLogIdParamSchema } = require('../../validator/sleeps/schema');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError'); // For authorization check

class SleepLogHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  postStartSleepHandler = async (request, h) => {
    try {
      const { userId } = request.auth.credentials;
      const sleepLogId = await this._service.startSleep(userId);

      const response = h.response({
        status: 'success',
        message: 'Sleep started successfully',
        data: {
          sleepLogId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      console.error(error);

      if (error instanceof InvariantError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(400);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Sorry, our server experienced a failure.',
      });
      response.code(500);
      return response;
    }
  };

  // New handler for ending a sleep log
  putEndSleepHandler = async (request, h) => {
    try {
      // Validate path parameter
      this._validator.validate(request.params, SleepLogIdParamSchema);
      // Validate payload (empty for now)
      //this._validator.validate(request.payload, EndSleepPayloadSchema);

      const { sleepLogId } = request.params;
      const { userId } = request.auth.credentials; // Authenticated user ID

      const { durationMinutes, pointsAwarded, newTotalPoints, newCurrentStreak } = await this._service.endSleep(sleepLogId, userId);

      const response = h.response({
        status: 'success',
        message: 'Sleep ended successfully',
        data: {
          sleepLogId,
          durationMinutes,
          pointsAwarded,
          totalPoints: newTotalPoints,
          currentStreak: newCurrentStreak,
        },
      });
      response.code(200); // 200 OK
      return response;
    } catch (error) {
      console.error(error);

      if (error instanceof NotFoundError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(404);
        return response;
      }

      if (error instanceof InvariantError || error instanceof AuthenticationError) { // Catch validation and authorization errors
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(400); // Bad Request for InvariantError, 403 Forbidden for AuthenticationError (depending on specific use case)
        if (error instanceof AuthenticationError) {
          response.code(403); // Forbidden access
        }
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Sorry, our server experienced a failure.',
      });
      response.code(500);
      return response;
    }
  };
}

module.exports = SleepLogHandler;