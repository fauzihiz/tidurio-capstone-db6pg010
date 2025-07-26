// server.js
'use strict';

const Hapi = require('@hapi/hapi');
const config = require('./src/utils/config');
const pool = require('./src/services/db/postgres');
const users = require('./src/api/users');
const sleeps = require('./src/api/sleeps'); // Import the new sleeps plugin
const Jwt = require('@hapi/jwt');
//const path = require('path');
//const fs = require('fs'); // To read the JSON file directly
const Inert = require('@hapi/inert'); // Required for hapi-swagger
const Vision = require('@hapi/vision'); // Required for hapi-swagger
const HapiSwagger = require('hapi-swagger'); // The swagger plugin

const init = async () => {
  const server = Hapi.server({
    port: config.app.port,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Load the OpenAPI specification JSON file
  //const openapiSpecPath = path.join(__dirname, 'openapi.json'); // Adjust path if openapi.json is in a 'docs' folder
  //console.log('Attempting to read OpenAPI spec from:', openapiSpecPath); //for debugging
  const swaggerOptions = {
    info: {
      title: 'Sleep Tracker Tidur.io API Documentation',
      version: '1.0.0',
    },
    // Point to your OpenAPI spec. hapi-swagger will load this.
    // It's usually better to let hapi-swagger generate the paths dynamically
    // if your routes are defined directly within Hapi.
    // However, since we pre-defined the openapi.json, we'll configure it to use that.
    jsonPath: '/openapi.json', // Path where the raw JSON spec will be served
    documentationPath: '/api-docs', // Path where the Swagger UI will be served
    jsonEditor: true, // Enable JSON editor for testing requests in the UI
    securityDefinitions: { // Example for authentication (if you add it later)
      Bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Enter your bearer token in the format **Bearer &lt;token>**'
      }
    },
    grouping: 'tags', // Group endpoints by tags in the UI
    // This is a common pattern: provide the entire spec via a custom route
    // and tell hapi-swagger where to find it.
    swaggerDefinition: JSON.parse(fs.readFileSync(openapiSpecPath, 'utf8')),
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
  server.auth.default('jwt_strategy');

  // Register Hapi plugins for authentication and features
  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
    {
      plugin: users.plugin,
      options: users.options,
    },
    {
      plugin: sleeps.plugin, // Register the sleeps plugin
      options: sleeps.options,
    }
  ]);

  // Basic route for testing server health (unchanged)
  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return 'Hello, Tidurio API!';
    },
    options: {
      tags: ['api', 'health'],
      description: 'Health check endpoint',
      notes: 'Returns a simple greeting to verify the API is running',
    },
  });

  // Route to test DB connection (unchanged)
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
      tags: ['api', 'database'],
      description: 'Database connection test',
      notes: 'Tests the database connection and returns current timestamp',
    },
  });

  await server.start();
  console.log(`🚀 Server berjalan pada ${server.info.uri}`);
  console.log(`📚 API Docs available at ${server.info.uri}/api-docs`);
  console.log(`📄 OpenAPI JSON available at ${server.info.uri}/openapi.json`);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();