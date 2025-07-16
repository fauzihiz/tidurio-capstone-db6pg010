require('dotenv').config(); // Load .env
const Joi = require('joi');

// Skema validasi untuk environment variables
const envSchema = Joi.object({
  PORT: Joi.number().default(5000),

  PGHOST: Joi.string().required(),
  PGUSER: Joi.string().required(),
  PGPASSWORD: Joi.string().required(),
  PGDATABASE: Joi.string().required(),
  PGPORT: Joi.number().default(5432),

  ACCESS_TOKEN_KEY: Joi.string().required(),
  ACCESS_TOKEN_AGE: Joi.number().default(3600),
}).unknown(); // izinkan variabel lain di .env

// Validasi dan parsing .env
const { error, value: env } = envSchema.validate(process.env);

if (error) {
  throw new Error(`❌ Invalid environment configuration: ${error.message}`);
}

// Export config siap pakai
const config = {
  app: {
    port: env.PORT,
  },
  db: {
    host: env.PGHOST,
    user: env.PGUSER,
    password: env.PGPASSWORD,
    database: env.PGDATABASE,
    port: env.PGPORT,
  },
  jwt: {
    accessTokenKey: env.ACCESS_TOKEN_KEY,
    accessTokenAge: env.ACCESS_TOKEN_AGE,
  },
};

module.exports = config;