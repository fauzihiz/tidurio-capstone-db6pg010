// src/validator/users/schema.js
const Joi = require('joi');

// schema for register
const UserPayloadSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// schema for login payload
const UserLoginPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});


module.exports = { UserPayloadSchema, UserLoginPayloadSchema };