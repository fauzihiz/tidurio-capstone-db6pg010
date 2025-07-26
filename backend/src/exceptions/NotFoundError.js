// src/exceptions/NotFoundError.js
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

module.exports = NotFoundError;