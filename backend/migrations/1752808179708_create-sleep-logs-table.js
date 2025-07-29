/* eslint-disable camelcase */
const shorthands = undefined;

const up = (pgm) => {
  pgm.createTable('sleep_logs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    user_id: { type: 'VARCHAR(50)', notNull: true, references: 'users(id)', onDelete: 'cascade' },
    start_time: { type: 'TIMESTAMP', notNull: true },
    end_time: { type: 'TIMESTAMP', notNull: false, default: null },
    duration_minutes: { type: 'INTEGER', notNull: false, default: null },
    points_awarded: { type: 'INTEGER', notNull: true, default: 0 },
    sleep_date: { type: 'DATE', notNull: false, default: null },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    updated_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });
};

const down = (pgm) => {
  pgm.dropTable('sleep_logs');
};

module.exports = { shorthands, up, down };