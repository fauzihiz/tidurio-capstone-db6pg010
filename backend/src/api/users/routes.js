// src/api/users/routes.js
const routes = (handler) => [
  {
    method: 'POST',
    path: '/register',
    handler: handler.postUserHandler,
    options: {
      auth: false,
    },
  },
  {
    method: 'POST',
    path: '/login',
    handler: handler.postUserLoginHandler,
    options: {
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/users/{id}',
    handler: handler.getUserByIdHandler,
    // auth: 'jwt_strategy' is implied by default strategy
  },
  {
    method: 'GET',
    path: '/dashboard', // New dashboard route
    handler: handler.getUserDashboardHandler,
    options: {
      auth: 'jwt_strategy', // This route requires authentication
    },
  },
];

module.exports = routes;