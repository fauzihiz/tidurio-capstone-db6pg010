// src/services/AchievementService.js
const { nanoid } = require('nanoid');
const pool = require('./db/postgres'); // Adjust path to postgres.js
const InvariantError = require('../exceptions/InvariantError');

class AchievementService {
  constructor() {
    this._pool = pool;
  }

  // Fetches all available achievements
  async getAllAchievements() {
    const result = await this._pool.query('SELECT id, name, description, type, threshold FROM achievements');
    return result.rows;
  }

  // Fetches achievements already unlocked by a specific user
  async getUnlockedAchievementsForUser(userId, client) {
    const query = {
      text: 'SELECT achievement_id FROM user_achievements WHERE user_id = $1',
      values: [userId],
    };
    const result = await client.query(query); // Use passed client for transaction
    return result.rows.map((row) => row.achievement_id);
  }

  // Adds an achievement as unlocked for a user
  async addUnlockedAchievement(userId, achievementId, client) {
    const id = `user_achieve-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO user_achievements (id, user_id, achievement_id, achieved_at, created_at, updated_at)
             VALUES($1, $2, $3, NOW(), NOW(), NOW()) RETURNING id`,
      values: [id, userId, achievementId],
    };
    try {
      await client.query(query); // Use passed client for transaction
    } catch (error) {
      if (error.code === '23505') { // Unique violation code for PostgreSQL
        // Achievement already unlocked for this user, ignore
        return;
      }
      throw error;
    }
  }

  // Main logic to check and award achievements
  async checkAndAwardAchievements(userId, totalPoints, currentStreak, client) {
    const allAchievements = await this.getAllAchievements(); // Get all possible achievements
    const unlockedAchievementIds = await this.getUnlockedAchievementsForUser(userId, client); // Get what user already has

    const newlyUnlockedAchievements = [];

    for (const achievement of allAchievements) {
      // Skip if already unlocked
      if (unlockedAchievementIds.includes(achievement.id)) {
        continue;
      }

      let unlocked = false;
      if (achievement.type === 'point_based' && totalPoints >= achievement.threshold) {
        unlocked = true;
      } else if (achievement.type === 'streak_based' && currentStreak >= achievement.threshold) {
        unlocked = true;
      }

      if (unlocked) {
        await this.addUnlockedAchievement(userId, achievement.id, client); // Add to user_achievements
        newlyUnlockedAchievements.push(achievement.name); // Add name for response
      }
    }

    return newlyUnlockedAchievements; // Return names of newly unlocked achievements
  }
}

module.exports = AchievementService;