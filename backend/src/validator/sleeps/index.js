// src/validator/sleeps/index.js
const InvariantError = require('../../exceptions/InvariantError');

const SleepLogValidator = {
  validate: (payload, schema) => {
    const { error } = schema.validate(payload);
    if (error) {
      throw new InvariantError(error.message);
    }
  },
};

module.exports = SleepLogValidator;