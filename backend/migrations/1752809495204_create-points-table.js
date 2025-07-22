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
  pgm.createTable('points', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    userId: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"(id)',
      onDelete: 'cascade',
    },
    date: {
      type: 'DATE',
      notNull: true,
    },
    points: {
      type: 'INTEGER',
      notNull: true,
    },
    createdAt: {
      type: 'TIMESTAMP',
      default: pgm.func('CURRENT_TIMESTAMP'),
      notNull: true,
    },
    updatedAt: {
      type: 'TIMESTAMP',
      default: pgm.func('CURRENT_TIMESTAMP'),
      notNull: true,
    },
  });

  pgm.addConstraint('points', 'unique_user_date', 'UNIQUE("userId", date)');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('points');
};