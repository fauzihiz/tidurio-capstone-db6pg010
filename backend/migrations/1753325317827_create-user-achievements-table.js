/* eslint-disable camelcase */
const shorthands = undefined;

const up = (pgm) => {
  pgm.createTable('user_achievements', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    user_id: { type: 'VARCHAR(50)', notNull: true, references: 'users(id)', onDelete: 'cascade' },
    achievement_id: { type: 'VARCHAR(50)', notNull: true, references: 'achievements(id)', onDelete: 'cascade' },
    unlocked_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  pgm.addConstraint('user_achievements', 'unique_user_achievement', {
    unique: ['user_id', 'achievement_id'],
  });
};

const down = (pgm) => {
  pgm.dropTable('user_achievements');
};

module.exports = { shorthands, up, down };