// src/validator/users/index.js
const InvariantError = require('../../exceptions/InvariantError'); // We'll create this custom error class

const UserValidator = {
  validate: (payload, schema) => {
    const { error } = schema.validate(payload);
    if (error) {
      throw new InvariantError(error.message); // Throw custom error for consistency
    }
  },
};

module.exports = UserValidator;