// src/api/users/handler.js
const { UserPayloadSchema, UserLoginPayloadSchema } = require('../../validator/users/schema');
const InvariantError = require('../../exceptions/InvariantError');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const NotFoundError = require('../../exceptions/NotFoundError');
const Jwt = require('@hapi/jwt');
const config = require('../../utils/config');

class UserHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  postUserHandler = async (request, h) => {
    try {
      this._validator.validate(request.payload, UserPayloadSchema);

      const { username, email, password } = request.payload;

      const userId = await this._service.addUser({ username, email, password });

      const response = h.response({
        status: 'success',
        message: 'User registered successfully',
        data: {
          userId,
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

  postUserLoginHandler = async (request, h) => {
    try {
      this._validator.validate(request.payload, UserLoginPayloadSchema);

      const { email, password } = request.payload;

      const userId = await this._service.verifyUserCredential(email, password);

      const accessToken = Jwt.token.generate(
        { userId },
        config.jwt.accessTokenKey,
        { expiresIn: config.jwt.accessTokenAge },
      );

      const response = h.response({
        status: 'success',
        message: 'Authentication successful',
        data: {
          accessToken,
        },
      });
      response.code(200);
      return response;
    } catch (error) {
      console.error(error);

      if (error instanceof AuthenticationError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(401);
        return response;
      }

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

  getUserByIdHandler = async (request, h) => {
    try {
      const { userId: authenticatedUserId } = request.auth.credentials;
      const { id: requestedUserId } = request.params;

      if (authenticatedUserId !== requestedUserId) {
        throw new AuthenticationError('You are not authorized to access this user\'s profile.');
      }

      const user = await this._service.getUserById(requestedUserId);

      const response = h.response({
        status: 'success',
        data: {
          user,
        },
      });
      response.code(200);
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

      if (error instanceof AuthenticationError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(403);
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

  // New handler for user dashboard data
  getUserDashboardHandler = async (request, h) => {
    try {
      const { userId } = request.auth.credentials; // Get userId from JWT

      const dashboardData = await this._service.getUserDashboardData(userId);

      const response = h.response({
        status: 'success',
        data: dashboardData,
      });
      response.code(200);
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

      // Handle other potential errors like database errors
      const response = h.response({
        status: 'error',
        message: 'Sorry, our server experienced a failure.',
      });
      response.code(500);
      return response;
    }
  };
}

module.exports = UserHandler;