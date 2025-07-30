// src/services/UserService.js
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const pool = require('./db/postgres'); // Pastikan path ini benar ke instance pool database Anda
const AuthenticationError = require('../exceptions/AuthenticationError');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class UserService {
  constructor() {
    this._pool = pool; // Menggunakan instance pool yang diimpor
  }

  async addUser({ username, email, password }) {
    await this.verifyNewUsernameAndEmail(username, email);

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = `user-${nanoid(16)}`;

    const query = {
      text: `INSERT INTO users (id, username, email, password, total_points, current_streak, created_at, updated_at)
             VALUES($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id`,
      values: [id, username, email, hashedPassword, 0, 0], // Default total_points dan current_streak
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0 || !result.rows[0].id) {
      throw new InvariantError('Failed to add user to database.');
    }

    return result.rows[0].id;
  }

  async verifyNewUsernameAndEmail(username, email) {
    const checkUsernameQuery = {
      text: 'SELECT id FROM users WHERE username = $1',
      values: [username],
    };
    const usernameResult = await this._pool.query(checkUsernameQuery);

    if (usernameResult.rows.length > 0) {
      throw new InvariantError('Username is already taken.');
    }

    const checkEmailQuery = {
      text: 'SELECT id FROM users WHERE email = $1',
      values: [email],
    };
    const emailResult = await this._pool.query(checkEmailQuery);

    if (emailResult.rows.length > 0) {
      throw new InvariantError('Email is already registered.');
    }
  }

  async verifyUserCredential(email, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE email = $1',
      values: [email],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthenticationError('Invalid credentials');
    }

    const { id: userId, password: hashedPassword } = result.rows[0];

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Invalid credentials');
    }

    return userId;
  }

  async getUserById(id) {
    const query = {
      text: `SELECT id, username, email, total_points, current_streak, last_sleep_date, created_at, updated_at
             FROM users WHERE id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('User not found');
    }

    const user = result.rows[0];
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      totalPoints: user.total_points,
      currentStreak: user.current_streak,
      lastSleepDate: user.last_sleep_date,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async getUserDashboardData(userId) {
    const [
      userQueryResult,
      unlockedAchievementsResult,
      recentSleepLogsResult,
      lastSleepResult,
    ] = await Promise.all([
      // Query 1: Data dasar pengguna (username, total_points, current_streak)
      this._pool.query({
        text: 'SELECT username, total_points, current_streak FROM users WHERE id = $1',
        values: [userId],
      }),
      // Query 2: Pencapaian yang sudah dibuka pengguna
      this._pool.query({
        text: `SELECT
                 a.id,
                 a.name,
                 a.description,
                 a.type,
                 a.threshold,
                 ua.achieved_at
                FROM user_achievements ua
                JOIN achievements a ON ua.achievement_id = a.id
                WHERE ua.user_id = $1
                ORDER BY ua.achieved_at DESC`,
        values: [userId],
      }),
      // Query 3: Log tidur terbaru (misal 7 hari terakhir)
      this._pool.query({
        text: `SELECT
                 id,
                 start_time,
                 end_time,
                 duration_minutes,
                 points_awarded,
                 sleep_date
                FROM sleep_logs
                WHERE user_id = $1 AND end_time IS NOT NULL AND sleep_date >= (NOW() - INTERVAL '7 days')::date
                ORDER BY sleep_date DESC, end_time DESC
                LIMIT 7`,
        values: [userId],
      }),
      // Query 4: Log tidur terakhir yang sudah selesai
      this._pool.query({
        text: `SELECT
                 id,
                 start_time,
                 end_time,
                 duration_minutes,
                 points_awarded,
                 sleep_date
                FROM sleep_logs
                WHERE user_id = $1 AND end_time IS NOT NULL
                ORDER BY end_time DESC
                LIMIT 1`,
        values: [userId],
      }),
    ]);

    const user = userQueryResult.rows[0];
    const unlockedAchievements = unlockedAchievementsResult.rows;
    const recentSleepLogs = recentSleepLogsResult.rows;
    const lastSleep = lastSleepResult.rows[0] || null;

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    return {
      userId: userId,
      username: user.username,
      totalPoints: user.total_points,
      currentStreak: user.current_streak,
      lastSleep: lastSleep ? {
        id: lastSleep.id,
        startTime: lastSleep.start_time,
        endTime: lastSleep.end_time,
        durationMinutes: lastSleep.duration_minutes,
        points: lastSleep.points_awarded,
        sleepDate: lastSleep.sleep_date,
      } : null,
      recentSleeps: recentSleepLogs.map((log) => ({
        id: log.id,
        startTime: log.start_time,
        endTime: log.end_time,
        durationMinutes: log.duration_minutes,
        points: log.points_awarded,
        sleepDate: log.sleep_date,
      })),
      unlockedAchievements: unlockedAchievements.map((ach) => ({
        id: ach.id,
        name: ach.name,
        description: ach.description,
        type: ach.type,
        threshold: ach.threshold,
        achievedAt: ach.achieved_at,
      })),
    };
  }
}

module.exports = UserService;