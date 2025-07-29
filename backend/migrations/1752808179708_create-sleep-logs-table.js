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
  pgm.createTable('sleep_logs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: { // Renamed from userId for consistency with snake_case
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'cascade',
    },
    start_time: { // Renamed from sleepTime
      type: 'TIMESTAMP',
      notNull: true,
    },
    end_time: { // Renamed from wakeTime
      type: 'TIMESTAMP',
      notNull: false, // Can be null initially when 'start sleep' is tapped
      default: null,
    },
    duration_minutes: { // Duration calculated in minutes
      type: 'INTEGER',
      notNull: false, // Can be null until end_time is recorded
      default: null,
    },
    points_awarded: { // New: Points specific to this single sleep log
      type: 'INTEGER',
      notNull: true,
      default: 0,
    },
    // New: The calendar date this sleep log primarily occurred on (e.g., the date of end_time)
    // Crucial for streak calculation and daily summaries.
    sleep_date: {
      type: 'DATE',
      notNull: false, // Can be null if end_time is null
      default: null,
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: { // Added for consistency
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
  pgm.dropTable('sleep_logs');
};