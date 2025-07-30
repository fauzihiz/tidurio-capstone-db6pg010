// src/validator/sleeps/schema.js
const Joi = require('joi');

/*const StartSleepPayloadSchema = Joi.object({
  // No required fields for 'start' as userId comes from JWT and startTime from server.
}).unknown(false);*/

// New schema for path parameter validation (sleepLogId)
const SleepLogIdParamSchema = Joi.object({
  sleepLogId: Joi.string().required(),
});

// New schema for 'end' payload (empty for now, as endTime is server-generated)
const EndSleepPayloadSchema = Joi.object({
  // No required fields for 'end' as endTime is server-generated.
}).unknown(false);

module.exports = { StartSleepPayloadSchema, SleepLogIdParamSchema, EndSleepPayloadSchema };