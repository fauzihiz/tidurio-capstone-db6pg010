// src/api/sleeps/routes.js
const routes = (handler) => [
  {
    method: 'POST',
    path: '/sleeps/start',
    handler: handler.postStartSleepHandler,
    options: {
      auth: 'jwt_strategy',
    },
  },
  {
    method: 'PUT',
    path: '/sleeps/{sleepLogId}/end', // Route with a path parameter
    handler: handler.putEndSleepHandler,
    options: {
      auth: 'jwt_strategy', // This route requires authentication
    },
  },
];

module.exports = routes;