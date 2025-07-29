// migrations/YYYYMMDDHHMMSS_add_initial_achievements.js
const { nanoid } = require('nanoid'); // Import nanoid for unique IDs

exports.up = (pgm) => {
  // Clear existing achievements if any, to ensure consistent state for testing
  pgm.sql('DELETE FROM achievements');

  pgm.sql(`
    INSERT INTO achievements (id, name, description, type, threshold, created_at, updated_at) VALUES
    ('${nanoid(16)}', 'Early Bird', 'Accumulate 100 total sleep points', 'point_based', 100, NOW(), NOW()),
    ('${nanoid(16)}', 'Sleep Novice', 'Achieve a 3-day sleep streak', 'streak_based', 3, NOW(), NOW()),
    ('${nanoid(16)}', 'Consistent Sleeper', 'Achieve a 7-day sleep streak', 'streak_based', 7, NOW(), NOW()),
    ('${nanoid(16)}', 'Sleep Master', 'Achieve a 14-day sleep streak', 'streak_based', 14, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING; -- Prevents errors if run multiple times without DELETE
  `);
};

exports.down = (pgm) => {
  // Optionally, remove only the achievements added by this migration
  // For simplicity, we can remove all seeded achievements
  pgm.sql(`
    DELETE FROM achievements
    WHERE name IN ('Early Bird', 'Sleep Novice', 'Consistent Sleeper', 'Sleep Master');
  `);
};