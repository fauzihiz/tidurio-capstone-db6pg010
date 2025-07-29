// src/api/users/index.js
const UserHandler = require('./handler');
const UserService = require('../../services/UserService'); // Adjust path
const UserValidator = require('../../validator/users/index'); // We'll create this simple validator wrapper next

const users = {
  name: 'users',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const userHandler = new UserHandler(service, validator);
    server.route(require('./routes')(userHandler)); // Register routes
  },
};

module.exports = {
  plugin: users,
  options: {
    service: new UserService(), // Instantiate your service
    validator: UserValidator,   // Pass your validator
  },
};