// src/api/sleeps/index.js
const SleepLogHandler = require('./handler');
const SleepLogService = require('../../services/SleepLogService'); // Adjust path
const SleepLogValidator = require('../../validator/sleeps'); // Adjust path
// --- NEW IMPORT ---
const AchievementService = require('../../services/AchievementService'); // Import AchievementService
// --- END NEW IMPORT ---

const sleeps = {
  name: 'sleeps',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const sleepLogHandler = new SleepLogHandler(service, validator);
    server.route(require('./routes')(sleepLogHandler));
  },
};

module.exports = {
  plugin: sleeps,
  options: {
    // --- MODIFIED SleepLogService INSTANTIATION ---
    service: new SleepLogService(new AchievementService()), // Pass AchievementService instance
    // --- END MODIFIED ---
    validator: SleepLogValidator,
  },
};