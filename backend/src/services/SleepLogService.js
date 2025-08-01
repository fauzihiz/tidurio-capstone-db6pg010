// src/services/SleepLogService.js
const { nanoid } = require('nanoid');
const pool = require('./db/postgres');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthenticationError = require('../exceptions/AuthenticationError');
const AchievementService = require('./AchievementService');

class SleepLogService {
  constructor(achievementService) {
    this._pool = pool;
    this._achievementService = achievementService || new AchievementService();
  }

  async startSleep(userId) {
    const id = `sleep-${nanoid(16)}`;
    const startTime = new Date().toISOString(); // This is correctly UTC ISO string

    const query = {
      text: `INSERT INTO sleep_logs (id, user_id, start_time, created_at)
             VALUES($1, $2, $3, NOW()) RETURNING id`,
      values: [id, userId, startTime],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0] || !result.rows[0].id) { // Added check for result.rows[0] existence
      throw new InvariantError('Failed to start sleep log.');
    }

    return result.rows[0].id;
  }

  async endSleep(sleepLogId, userId) {
    const client = await this._pool.connect();
    let newlyUnlockedAchievements = [];

    try {
      await client.query('BEGIN');

      const getSleepLogQuery = {
        text: 'SELECT start_time, end_time, user_id FROM sleep_logs WHERE id = $1 FOR UPDATE',
        values: [sleepLogId],
      };
      const sleepLogResult = await client.query(getSleepLogQuery);

      if (!sleepLogResult.rows.length) {
        throw new NotFoundError('Sleep log not found.');
      }

      const { start_time: startTimeStr, end_time: existingEndTime, user_id: sleepLogUserId } = sleepLogResult.rows[0];

      if (sleepLogUserId !== userId) {
        throw new AuthenticationError('You are not authorized to update this sleep log.');
      }

      if (existingEndTime !== null) {
        throw new InvariantError('Sleep log has already ended.');
      }

      // --- FIX 1: Parse startTimeStr into a Date object ---
      const startTime = new Date(startTimeStr);
      const endTime = new Date(); // This will be the mocked TEST_NOW Date object

      const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      // Calculate points (Example: 10 points per hour, min 7 hours for points)
      let pointsAwarded = 0;
      const MIN_SLEEP_HOURS_FOR_POINTS = 7; // 7 hours threshold for points
      if (durationMinutes >= MIN_SLEEP_HOURS_FOR_POINTS * 60) { // Check if duration meets 7-hour threshold
        pointsAwarded = Math.floor(durationMinutes / 60) * 10; // Base points: 10 points per hour, Example: 10 points per hour of good sleep
      }

      // The sleepDate should be derived from endTime, and typically without time for DB storage
      const sleepDate = endTime.toISOString().split('T')[0]; // e.g., '2025-07-26'

      const updateSleepLogQuery = {
        text: `UPDATE sleep_logs
               SET end_time = $1, duration_minutes = $2, points_awarded = $3, sleep_date = $4, updated_at = NOW()
               WHERE id = $5 RETURNING id`,
        values: [endTime.toISOString(), durationMinutes, pointsAwarded, sleepDate, sleepLogId],
      };
      await client.query(updateSleepLogQuery);

      const getUserQuery = {
        text: 'SELECT total_points, current_streak, last_sleep_date FROM users WHERE id = $1 FOR UPDATE',
        values: [userId],
      };
      const userResult = await client.query(getUserQuery);
      const { total_points: currentTotalPoints, current_streak: currentStreak, last_sleep_date: lastSleepDateStr } = userResult.rows[0];

      let newCurrentStreak = currentStreak;
      let newLastSleepDate = lastSleepDateStr; // Keep as string for DB update

      if (pointsAwarded > 0) {
        if (!lastSleepDateStr) { // If no previous sleep date
          newCurrentStreak = 1;
          newLastSleepDate = sleepDate;
        } else {
          // --- FIX 2: Create Date objects from date strings ensuring UTC normalization ---
          // Parse lastSleepDateStr and sleepDate into Date objects,
          // then normalize them to UTC midnight to ensure accurate day comparison.
          // This ensures that timezone differences don't shift the "day".
          const prevDate = new Date('${lastSleepDateStr} T00:00:00.000Z'); // Force UTC midnight
          const currDate = new Date('${sleepDate} T00:00:00.000Z'); // Force UTC midnight

          const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) { // Consecutive day (e.g., prev was 25th, curr is 26th)
            newCurrentStreak += 1;
            newLastSleepDate = sleepDate;
          } else if (diffDays !== 0) { // Not same day and not consecutive, reset streak
            newCurrentStreak = 1;
            newLastSleepDate = sleepDate;
          }
          // If diffDays === 0, it's the same day, streak doesn't change
          // newLastSleepDate also doesn't change as it's already the most recent sleep day
        }
      } else {
        newCurrentStreak = 0; // If no points awarded, streak resets
      }

      const STREAK_BONUS_POINTS = {
        3: 50,
        7: 150,
        14: 300,
        30: 500,
      };

      if (STREAK_BONUS_POINTS[newCurrentStreak]) {
        pointsAwarded += STREAK_BONUS_POINTS[newCurrentStreak];
      }

      const newTotalPoints = currentTotalPoints + pointsAwarded;

      const updateUserQuery = {
        text: `UPDATE users
               SET total_points = $1, current_streak = $2, last_sleep_date = $3, updated_at = NOW()
               WHERE id = $4`,
        values: [newTotalPoints, newCurrentStreak, newLastSleepDate, userId],
      };
      await client.query(updateUserQuery);

      newlyUnlockedAchievements = await this._achievementService.checkAndAwardAchievements(
        userId,
        newTotalPoints,
        newCurrentStreak,
        client
      );

      await client.query('COMMIT');

      return {
        sleepLogId,
        durationMinutes,
        pointsAwarded,
        totalPoints: newTotalPoints,
        currentStreak: newCurrentStreak,
        newlyUnlockedAchievements,
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = SleepLogService;