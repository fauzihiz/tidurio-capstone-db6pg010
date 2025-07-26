// src/exceptions/InvariantError.js
class InvariantError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvariantError';
  }
}

module.exports = InvariantError;