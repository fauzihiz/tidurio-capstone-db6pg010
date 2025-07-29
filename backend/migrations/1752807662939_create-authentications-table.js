/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
const shorthands = undefined;

const up = (pgm) => {
  pgm.createTable('authentications', {
    token: {
      type: 'TEXT',
      notNull: true,
      primaryKey: true,
    },
  });
};

const down = (pgm) => {
  pgm.dropTable('authentications');
};

module.exports = { shorthands, up, down };