/* eslint-disable camelcase */
// tests/services/SleepLogService.test.js - NO CHANGES HERE FROM PREVIOUS RESPONSE, KEEP IT THE SAME.
const SleepLogService = require('../../src/services/SleepLogService');
const AchievementService = require('../../src/services/AchievementService');
const pool = require('../../src/services/db/postgres');
const InvariantError = require('../../src/exceptions/InvariantError');
const NotFoundError = require('../../src/exceptions/NotFoundError');
const AuthenticationError = require('../../src/exceptions/AuthenticationError');

// Mock the entire postgres pool module
jest.mock('../../src/services/db/postgres', () => {
  const mockClient = {
    query: jest.fn(),
    release: jest.fn(),
  };

  return {
    query: jest.fn(),
    connect: jest.fn(() => mockClient),
  };
});

// Mock the AchievementService
jest.mock('../../src/services/AchievementService', () => {
  return jest.fn().mockImplementation(() => {
    return {
      checkAndAwardAchievements: jest.fn(),
    };
  });
});

describe('SleepLogService', () => {
  let sleepLogService;
  let mockAchievementService;
  let mockClient;

  const TEST_NOW = new Date('2025-07-26T10:00:00.000Z'); // July 26, 2025, 10:00:00 AM UTC

  beforeEach(() => {
    pool.query.mockClear();
    pool.connect.mockClear();
    AchievementService.mockClear();

    mockAchievementService = new AchievementService();
    sleepLogService = new SleepLogService(mockAchievementService);

    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);

    jest.spyOn(global.Date, 'now').mockReturnValue(TEST_NOW.getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });


  describe('startSleep', () => {
    it('should start a sleep log successfully', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'sleep-log-123' }] });

      const userId = 'user-test-id';
      const sleepLogId = await sleepLogService.startSleep(userId);

      expect(sleepLogId).toBe('sleep-log-123');
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query.mock.calls[0][0].text).toContain('INSERT INTO sleep_logs');
      expect(pool.query.mock.calls[0][0].values[1]).toBe(userId);
    });

    it('should throw InvariantError if sleep log creation fails', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: null }] });

      const userId = 'user-test-id';
      await expect(sleepLogService.startSleep(userId)).rejects.toThrow(InvariantError);
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('endSleep', () => {
    const sleepLogId = 'sleep-log-123';
    const userId = 'user-test-id';

    const setupEndSleepMocks = (
      sleepLogExists = true,
      isEnded = false,
      isAuthorized = true,
      initialTotalPoints = 0,
      initialCurrentStreak = 0,
      lastSleepDate = null,
      customStartTime = new Date(TEST_NOW.getTime() - (9 * 60 * 60 * 1000))
    ) => {
      mockClient.query.mockClear();

      mockClient.query.mockImplementationOnce((query) => {
        if (query === 'BEGIN') return Promise.resolve({});
        return Promise.reject(new Error('Unexpected client query for BEGIN'));
      });

      // 1. Get sleep log query
      mockClient.query.mockImplementationOnce((query) => {
        if (query.text.includes('SELECT start_time, end_time, user_id FROM sleep_logs')) {
          if (!sleepLogExists) return Promise.resolve({ rows: [] });
          const logUserId = isAuthorized ? userId : 'other-user';
          return Promise.resolve({
            rows: [{
              start_time: customStartTime.toISOString(),
              end_time: isEnded ? TEST_NOW.toISOString() : null,
              user_id: logUserId,
            }],
          });
        }
        return Promise.reject(new Error('Unexpected client query for SELECT sleep_logs'));
      });

      // 2. Update sleep log query
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: sleepLogId }] });

      // 3. Get user query
      mockClient.query.mockResolvedValueOnce({
        rows: [{
          total_points: initialTotalPoints,
          current_streak: initialCurrentStreak,
          last_sleep_date: lastSleepDate,
        }],
      });

      // 4. Update user query
      mockClient.query.mockResolvedValueOnce({});

      // 5. Mock COMMIT or ROLLBACK
      mockClient.query.mockImplementation((query) => {
        if (query === 'COMMIT' || query === 'ROLLBACK') return Promise.resolve({});
        return Promise.reject(new Error('Unexpected client query for COMMIT/ROLLBACK'));
      });

      mockAchievementService.checkAndAwardAchievements.mockResolvedValue([]);
    };

    it('should end a sleep log, calculate points/streak, and award achievements successfully', async () => {
      const prevSleepDate = new Date(TEST_NOW.getTime() - (24 * 60 * 60 * 1000));
      setupEndSleepMocks(true, false, true, 50, 2, prevSleepDate.toISOString().split('T')[0]);

      const result = await sleepLogService.endSleep(sleepLogId, userId);

      expect(result).toBeDefined();
      expect(result.sleepLogId).toBe(sleepLogId);
      expect(result.durationMinutes).toBe(9 * 60);
      expect(result.pointsAwarded).toBe(90 + 50);
      expect(result.totalPoints).toBe(50 + 90 + 50);
      expect(result.currentStreak).toBe(3);
      expect(pool.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalledTimes(1);
      expect(mockAchievementService.checkAndAwardAchievements).toHaveBeenCalledTimes(1);
      expect(mockAchievementService.checkAndAwardAchievements).toHaveBeenCalledWith(
        userId, expect.any(Number), expect.any(Number), mockClient
      );
    });

    it('should throw NotFoundError if sleep log does not exist', async () => {
      setupEndSleepMocks(false);

      await expect(sleepLogService.endSleep(sleepLogId, userId)).rejects.toThrow(NotFoundError);
      expect(pool.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalledTimes(1);
      expect(mockAchievementService.checkAndAwardAchievements).not.toHaveBeenCalled();
    });

    it('should throw AuthenticationError if user is not authorized to end sleep log', async () => {
      setupEndSleepMocks(true, false, false);

      await expect(sleepLogService.endSleep(sleepLogId, userId)).rejects.toThrow(AuthenticationError);
      expect(pool.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalledTimes(1);
      expect(mockAchievementService.checkAndAwardAchievements).not.toHaveBeenCalled();
    });

    it('should throw InvariantError if sleep log has already ended', async () => {
      setupEndSleepMocks(true, true);

      await expect(sleepLogService.endSleep(sleepLogId, userId)).rejects.toThrow(InvariantError);
      expect(pool.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalledTimes(1);
      expect(mockAchievementService.checkAndAwardAchievements).not.toHaveBeenCalled();
    });

    it('should start streak at 1 for first valid sleep', async () => {
      setupEndSleepMocks(true, false, true, 0, 0, null);

      const result = await sleepLogService.endSleep(sleepLogId, userId);
      expect(result.currentStreak).toBe(1);
    });

    it('should increase streak by 1 for consecutive day sleep', async () => {
      const yesterday = new Date(TEST_NOW.getTime() - (24 * 60 * 60 * 1000));
      setupEndSleepMocks(true, false, true, 100, 5, yesterday.toISOString().split('T')[0]);

      const result = await sleepLogService.endSleep(sleepLogId, userId);
      expect(result.currentStreak).toBe(6);
    });

    it('should not change streak for sleep on the same day', async () => {
      const today = new Date(TEST_NOW.getTime());
      setupEndSleepMocks(true, false, true, 100, 5, today.toISOString().split('T')[0]);

      const result = await sleepLogService.endSleep(sleepLogId, userId);
      expect(result.currentStreak).toBe(5);
    });

    it('should reset streak to 1 if there is a gap day', async () => {
      const dayBeforeYesterday = new Date(TEST_NOW.getTime() - (48 * 60 * 60 * 1000));
      setupEndSleepMocks(true, false, true, 100, 5, dayBeforeYesterday.toISOString().split('T')[0]);

      const result = await sleepLogService.endSleep(sleepLogId, userId);
      expect(result.currentStreak).toBe(1);
    });

    it('should reset streak to 0 if no points awarded', async () => {
      const shortSleepStartTime = new Date(TEST_NOW.getTime() - (5 * 60 * 60 * 1000));
      const prevSleepDate = new Date(TEST_NOW.getTime() - (24 * 60 * 60 * 1000));
      setupEndSleepMocks(true, false, true, 100, 5, prevSleepDate.toISOString().split('T')[0], shortSleepStartTime);

      const result = await sleepLogService.endSleep(sleepLogId, userId);
      expect(result.currentStreak).toBe(0);
      expect(result.pointsAwarded).toBe(0);
    });

    it('should award points based on sleep duration (>= 8 hours)', async () => {
      const longSleepStartTime = new Date(TEST_NOW.getTime() - (10 * 60 * 60 * 1000));
      setupEndSleepMocks(true, false, true, 0, 0, null, longSleepStartTime);

      const result = await sleepLogService.endSleep(sleepLogId, userId);
      expect(result.pointsAwarded).toBe(100);
      expect(result.totalPoints).toBe(100);
    });

    it('should include streak bonus points in total points', async () => {
      const yesterday = new Date(TEST_NOW.getTime() - (24 * 60 * 60 * 1000));
      const mockStartTimeForBonus = new Date(TEST_NOW.getTime() - (9 * 60 * 60 * 1000));
      setupEndSleepMocks(true, false, true, 50, 2, yesterday.toISOString().split('T')[0], mockStartTimeForBonus);

      const result = await sleepLogService.endSleep(sleepLogId, userId);
      expect(result.currentStreak).toBe(3);
      expect(result.pointsAwarded).toBe(140);
      expect(result.totalPoints).toBe(190);
    });

    it('should call AchievementService with correct parameters', async () => {
      const prevSleepDate = new Date(TEST_NOW.getTime() - (24 * 60 * 60 * 1000));
      setupEndSleepMocks(true, false, true, 50, 2, prevSleepDate.toISOString().split('T')[0]);

      mockAchievementService.checkAndAwardAchievements.mockResolvedValue(['Early Bird']);

      const result = await sleepLogService.endSleep(sleepLogId, userId);

      expect(mockAchievementService.checkAndAwardAchievements).toHaveBeenCalledTimes(1);
      expect(mockAchievementService.checkAndAwardAchievements).toHaveBeenCalledWith(
        userId,
        expect.any(Number),
        expect.any(Number),
        mockClient
      );
      expect(result.newlyUnlockedAchievements).toEqual(['Early Bird']);
    });
  });
});