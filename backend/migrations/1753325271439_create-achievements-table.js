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
  pgm.createTable('achievements', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'VARCHAR(100)',
      notNull: true,
      unique: true,
    },
    description: {
      type: 'TEXT',
      notNull: true,
    },
    // Type of achievement (e.g., 'point_based', 'streak_based', 'total_duration_based')
    type: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    // The value needed to unlock (e.g., 1000 for points, 7 for streaks)
    threshold: {
      type: 'INTEGER',
      notNull: true,
    },
    image_url: { // Optional: for display in UI
      type: 'TEXT',
      notNull: false,
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
  pgm.dropTable('achievements');
};