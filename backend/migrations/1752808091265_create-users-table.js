/* eslint-disable camelcase */
/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    username: {
      type: 'TEXT',
      notNull: true,
      unique: true,
    },
    email: {
      type: 'TEXT',
      notNull: true,
      unique: true,
    },
    password: {
      type: 'TEXT',
      notNull: true,
    },
    // New: Total points accumulated by the user
    total_points: {
      type: 'INTEGER',
      notNull: true,
      default: 0,
    },
    // New: Current consecutive sleep streak length
    current_streak: {
      type: 'INTEGER',
      notNull: true,
      default: 0,
    },
    // New: Date of the user's last *recorded* sleep log (end_time's date).
    // Used to determine if the next sleep log continues the streak.
    // Can be null for a new user with no sleep logs yet.
    last_sleep_date: {
      type: 'DATE',
      notNull: false, // Allows null for new users
      default: null,
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('users');
};