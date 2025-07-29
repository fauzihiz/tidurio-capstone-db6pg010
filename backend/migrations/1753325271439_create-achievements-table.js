/* eslint-disable camelcase */
const shorthands = undefined;

const up = (pgm) => {
  pgm.createTable('achievements', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    name: { type: 'VARCHAR(100)', notNull: true, unique: true },
    description: { type: 'TEXT', notNull: true },
    type: { type: 'VARCHAR(50)', notNull: true },
    threshold: { type: 'INTEGER', notNull: true },
    image_url: { type: 'TEXT', notNull: false },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    updated_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });
};

const down = (pgm) => {
  pgm.dropTable('achievements');
};

module.exports = { shorthands, up, down };