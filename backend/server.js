// server.js
'use strict';

const Hapi = require('@hapi/hapi');
const config = require('./src/utils/config');
const pool = require('./src/services/db/postgres');
const users = require('./src/api/users');
const sleeps = require('./src/api/sleeps'); // Import the new sleeps plugin
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert'); // Required for hapi-swagger
const Vision = require('@hapi/vision'); // Required for hapi-swagger
const HapiSwagger = require('hapi-swagger'); // The swagger plugin
const Joi = require('joi');

const init = async () => {
  const server = Hapi.server({
    port: config.app.port,
    host: '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  const swaggerOptions = {
    info: {
      title: 'Sleep Tracker Tidur.io API Documentation',
      version: '1.0.0',
      description: 'API for managing user sleep logs, calculating points, and tracking streaks for the Tidur.io application.'
    },
    jsonPath: '/openapi.json', // Path where the raw JSON spec will be served
    documentationPath: '/api-docs', // Path where the Swagger UI will be served
    // FIXED: Removed jsonEditor (not a valid hapi-swagger option)
    // FIXED: Use proper Swagger 2.0 security definitions
    securityDefinitions: {
      'Bearer': {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Enter your bearer token in the format: Bearer <token>'
      }
    },
    grouping: 'tags', // Group endpoints by tags in the UI
    tags: [ // Define your tags here, which your routes will then use
      { name: 'Users', description: 'User authentication and profile data' },
      { name: 'Sleeps', description: 'Sleep log management and progress' },
      { name: 'health', description: 'API health and status endpoints' },
      { name: 'database', description: 'Database connection and test endpoints' },
    ],
  };

  // Register JWT plugin FIRST
  await server.register(Jwt);

  // Define JWT authentication strategy (unchanged)
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
        credentials: {
          userId: artifacts.decoded.payload.userId,
        },
      };
    },
  });

  // Set 'jwt_strategy' as the default authentication strategy for all routes
  //server.auth.default('jwt_strategy');

  // Register Hapi plugins for authentication and features
  await server.register([
    {
      plugin: Inert,
    },
    {
      plugin: Vision,
    },
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
    {
      plugin: users.plugin, //users route
      options: users.options,
    },
    {
      plugin: sleeps.plugin, // sleeps route
      options: sleeps.options,
    }
  ]);

  // Basic route for testing server health
  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return 'Hello, Tidurio API!';
    },
    options: {
      auth: false, // Explicitly disable auth for this route
      tags: ['api', 'health'],
      description: 'Health check endpoint',
      notes: 'Returns a simple greeting to verify the API is running',
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Successful operation',
              schema: Joi.string().example('Hello, Tidurio API!').label('RootResponse'),
            },
          },
        },
      }
    },
  });

  // Route to test DB connection
  server.route({
    method: 'GET',
    path: '/db-test',
    handler: async (request, h) => {
      try {
        const result = await pool.query('SELECT NOW()');
        return `Database connected! Current time from DB: ${result.rows[0].now}`;
      } catch (error) {
        console.error('Database connection test failed:', error);
        return h.response('Database connection failed').code(500);
      }
    },
    options: {
      auth: false, // Explicitly disable auth for this route
      tags: ['api', 'database'],
      description: 'Database connection test',
      notes: 'Tests the database connection and returns current timestamp',
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Database connected successfully',
              schema: Joi.string().example('Database connected! Current time from DB: 2025-07-27T10:16:12.000Z').label('DbTestSuccessResponse'),
            },
            '500': {
              description: 'Database connection failed',
              schema: Joi.string().example('Database connection failed').label('DbTestErrorResponse'),
            },
          },
        },
      },
    },
  });

  await server.start();
  console.log(`🚀 Server berjalan pada ${server.info.uri}`);
  console.log(`📚 API Docs available at ${server.info.uri}/api-docs`);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();