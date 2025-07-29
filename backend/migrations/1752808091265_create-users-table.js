/* eslint-disable camelcase */
const shorthands = undefined;

const up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    username: { type: 'TEXT', notNull: true, unique: true },
    email: { type: 'TEXT', notNull: true, unique: true },
    password: { type: 'TEXT', notNull: true },
    total_points: { type: 'INTEGER', notNull: true, default: 0 },
    current_streak: { type: 'INTEGER', notNull: true, default: 0 },
    last_sleep_date: { type: 'DATE', notNull: false, default: null },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    updated_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });
};

const down = (pgm) => {
  pgm.dropTable('users');
};

module.exports = { shorthands, up, down };