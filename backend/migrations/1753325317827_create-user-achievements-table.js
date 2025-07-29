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
  pgm.createTable('user_achievements', {
    id: { // Primary key for this junction table itself
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'cascade',
    },
    achievement_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'achievements(id)',
      onDelete: 'cascade',
    },
    unlocked_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Constraint: Ensure a user can only unlock a specific achievement once
  pgm.addConstraint('user_achievements', 'unique_user_achievement', {
    unique: ['user_id', 'achievement_id'],
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('user_achievements');
};