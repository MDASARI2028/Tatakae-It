// backend/routes/levelup.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const { Workout } = require('../models/workout.model');
const Nutrition = require('../models/nutrition.model');
// NOTE: XP System now includes Nutrition
const XPHistory = require('../models/XPHistory.model');
const {
    calculateRank,
    getNextRankXP,
    calculateFitnessXP,
    calculateNutritionXP,
    calculateStreakBonus,
    checkSeasonReset
} = require('../utils/levelUpHelpers');

// Helper: Log XP Change (with idempotency check)
const logXPChange = async (userId, amount, reason, category = 'OTHER') => {
    try {
        if (amount === 0) return;

        // Idempotency check: Don't log duplicate entries for same day/reason
        // Use LOCAL timezone for date calculations
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);

        const existingEntry = await XPHistory.findOne({
            user: userId,
            reason: reason,
            date: { $gte: today, $lt: tomorrow }
        });

        if (existingEntry) {
            console.log(`[XP Log] Warning: Duplicate entry for "${reason}" today found, but proceeding effectively.`);
            // return; // REMOVED: Allow multiple logs if the caller verified the amount (which calculateDailyXP does)
        }

        await XPHistory.create({
            user: userId,
            amount: amount,
            type: amount > 0 ? 'GAIN' : 'LOSS',
            reason: reason,
            category: category
        });
    } catch (err) {
        console.error('Error logging XP change:', err);
    }
};

/**
 * @route   POST /api/levelup/toggle
 * @desc    Enable or disable Level Up Mode
 * @access  Private
 */
router.post('/toggle', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user.levelUpMode.enabled) {
            // Enabling for first time
            user.levelUpMode.enabled = true;
            user.levelUpMode.seasonStartDate = new Date();
            await user.save();

            return res.json({
                success: true,
                message: 'Level Up Mode activated!',
                levelUpMode: user.levelUpMode
            });
        } else {
            // Disabling
            user.levelUpMode.enabled = false;
            await user.save();

            return res.json({
                success: true,
                message: 'Level Up Mode deactivated.',
                levelUpMode: user.levelUpMode
            });
        }
    } catch (err) {
        console.error('Level Up toggle error:', err);
        res.status(500).json({ msg: 'Server error toggling Level Up Mode' });
    }
});

/**
 * @route   GET /api/levelup/stats
 * @desc    Get user's Level Up stats (XP, rank, progress, streaks)
 * @access  Private
 */
router.get('/stats', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user.levelUpMode.enabled) {
            return res.status(400).json({ msg: 'Level Up Mode not enabled' });
        }

        const currentRank = user.levelUpMode.rank;
        const nextRankXP = getNextRankXP(currentRank);
        const currentXP = user.levelUpMode.xp;

        // Calculate days in current season
        const seasonStart = user.levelUpMode.seasonStartDate || new Date();
        const daysSinceStart = Math.floor(
            (new Date() - seasonStart) / (1000 * 60 * 60 * 24)
        );
        const daysRemaining = Math.max(0, 365 - daysSinceStart);

        res.json({
            enabled: true,
            xp: currentXP,
            rank: currentRank,
            nextRank: nextRankXP ? Object.keys(require('../utils/levelUpHelpers').RANK_THRESHOLDS).find(
                r => require('../utils/levelUpHelpers').RANK_THRESHOLDS[r] === nextRankXP
            ) : null,
            nextRankXP,
            progress: nextRankXP ? ((currentXP / nextRankXP) * 100).toFixed(1) : 100,
            streaks: user.levelUpMode.streaks,
            seasonInfo: {
                seasonNumber: user.levelUpMode.legacyAchievements.length + 1,
                daysElapsed: daysSinceStart,
                daysRemaining,
                startDate: seasonStart
            },
            legacyAchievements: user.levelUpMode.legacyAchievements
        });
    } catch (err) {
        console.error('Get Level Up stats error:', err);
        res.status(500).json({ msg: 'Server error fetching Level Up stats' });
    }
});

/**
 * @route   POST /api/levelup/calculate-daily
 * @desc    Calculate and award XP for today's activities
 * @access  Private
 */
router.post('/calculate-daily', auth, async (req, res) => {
    console.log('=== /calculate-daily endpoint HIT ===');
    console.log('User ID:', req.user.id);
    try {
        const user = await User.findById(req.user.id);

        if (!user.levelUpMode.enabled) {
            return res.status(400).json({ msg: 'Level Up Mode not enabled' });
        }

        // --- TIMEZONE-AWARE DATE HANDLING ---
        // Get current time and extract LOCAL date components
        const now = new Date();
        const localYear = now.getFullYear();
        const localMonth = String(now.getMonth() + 1).padStart(2, '0');
        const localDay = String(now.getDate()).padStart(2, '0');
        const todayDateString = `${localYear}-${localMonth}-${localDay}`;

        // Create date range for Date-based model queries (starts at local midnight)
        const today = new Date(localYear, now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const tomorrow = new Date(localYear, now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);

        console.log(`[XP Calc] Local date string: ${todayDateString}`);
        console.log(`[XP Calc] Date range: ${today.toISOString()} to ${tomorrow.toISOString()}`);

        let totalXP = 0;
        const breakdown = {};

        // 1. Check for workouts today
        console.log(`[XP Calc] Checking workouts for date: ${todayDateString}`);

        const todayWorkouts = await Workout.find({
            user: req.user.id,
            date: { $gte: today, $lt: tomorrow }
        })
            .sort({ date: -1 })
            .select('-__v')
            .lean();

        console.log(`[XP Calc] Found ${todayWorkouts.length} workouts.`);
        if (todayWorkouts.length > 0) {
            console.log(`[XP Calc] Latest workout date: ${todayWorkouts[0].date}`);
        }

        if (todayWorkouts.length > 0) {
            // Get previous workouts for comparison (last 14 days)
            const twoWeeksAgo = new Date(today);
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            const previousWorkouts = await Workout.find({
                user: req.user.id,
                date: { $gte: twoWeeksAgo, $lt: today }
            })
                .select('-__v')
                .lean();

            // Calculate fitness XP with progressive overload
            const fitnessResult = await calculateFitnessXP(todayWorkouts[0], previousWorkouts);
            totalXP += fitnessResult.totalXP;
            breakdown.fitness = fitnessResult;

            // Calculate fitness streak bonus
            const fitnessStreakBonus = calculateStreakBonus(user, 'fitness', true);
            if (fitnessStreakBonus > 0) {
                totalXP += fitnessStreakBonus;
                breakdown.fitnessStreakBonus = fitnessStreakBonus;
            }
        } else {
            // No workout - break streak
            calculateStreakBonus(user, 'fitness', false);
        }

        // 2. Check for nutrition logs today
        console.log(`[XP Calc] Checking nutrition for date: ${todayDateString}`);
        const todayNutrition = await Nutrition.find({
            user: req.user.id,
            date: todayDateString
        }).lean();

        if (todayNutrition.length > 0) {
            // Calculate daily totals
            const dailyTotals = todayNutrition.reduce((acc, log) => {
                if (log.items) {
                    log.items.forEach(item => {
                        acc.calories += (Number(item.calories) || 0);
                        acc.protein += (Number(item.protein) || 0);
                        acc.carbs += (Number(item.carbohydrates) || 0);
                        acc.fat += (Number(item.fat) || 0);
                    });
                }
                return acc;
            }, { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 }); // Water not tracked yet in logs but helper expects it

            // Calculate Nutrition XP
            const nutritionResult = calculateNutritionXP(dailyTotals, user.nutritionGoals || {});
            totalXP += nutritionResult.totalXP;
            breakdown.nutrition = nutritionResult;

            // Calculate nutrition streak bonus
            const nutritionStreakBonus = calculateStreakBonus(user, 'nutrition', true);
            if (nutritionStreakBonus > 0) {
                totalXP += nutritionStreakBonus;
                breakdown.nutritionStreakBonus = nutritionStreakBonus;
            }
        } else {
            // No nutrition log - break streak
            calculateStreakBonus(user, 'nutrition', false);
        }

        // NOTE: XP System now includes Fitness AND Nutrition
        console.log(`[XP Calc] XP System: Fitness & Nutrition Mode. Total XP: ${totalXP}`);

        // --- Idempotent XP Awarding Logic ---
        // IMPORTANT: Declare these variables BEFORE using them
        const lastCalcDate = user.levelUpMode.lastDailyCalculationDate ? new Date(user.levelUpMode.lastDailyCalculationDate) : null;
        const isNewDay = !lastCalcDate || lastCalcDate.toDateString() !== today.toDateString();

        // 5. XP Penalties for Missed Logging (Streak Breaking)
        // Check if there was a gap between lastCalcDate and yesterday
        if (isNewDay && lastCalcDate) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            // If last calc was before yesterday, we missed some days
            if (lastCalcDate < yesterday) {
                // Calculate days missed (excluding rest days)
                const restDays = user.levelUpMode.restDays || [];
                let missedDays = 0;

                // Check each day between lastCalcDate and yesterday
                const checkDate = new Date(lastCalcDate);
                checkDate.setDate(checkDate.getDate() + 1);

                while (checkDate < today) {
                    const checkDateString = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;

                    // Only count as missed if NOT a rest day
                    if (!restDays.includes(checkDateString)) {
                        missedDays++;
                    }

                    checkDate.setDate(checkDate.getDate() + 1);
                }

                if (missedDays > 0) {
                    // Penalty per missed day (e.g. -50 XP)
                    const penaltyPerDay = 50;
                    const totalPenalty = missedDays * penaltyPerDay;

                    const penaltyReason = `Missed logging for ${missedDays} day(s)`;

                    totalXP -= totalPenalty;
                    breakdown.penalty = -totalPenalty;

                    // Log the penalty IMMEDIATELY as it's a separate event from today's potential gains
                    await logXPChange(req.user.id, -totalPenalty, penaltyReason, 'PENALTY');

                    user.levelUpMode.xp -= totalPenalty;
                    // Ensure XP doesn't go below 0
                    if (user.levelUpMode.xp < 0) user.levelUpMode.xp = 0;

                    console.log(`[XP Calc] Penalized ${missedDays} missed days (rest days excluded)`);
                }
            }
        }

        if (isNewDay) {
            console.log('[XP Calc] New day detected. Resetting dailyXPEarned.');
            user.levelUpMode.dailyXPEarned = 0;
        }

        const currentlyEarnedToday = user.levelUpMode.dailyXPEarned || 0;

        console.log(`[XP Calc] Total Calculated for Today: ${totalXP}`);
        console.log(`[XP Calc] Already Earned Today: ${currentlyEarnedToday}`);

        // Calculate the difference (Delta)
        // If totalXP (freshly calculated) is 500, and currentlyEarned is 200, we add 300.
        let xpToAdd = totalXP - currentlyEarnedToday;

        // Safety: Ensure we don't subtract XP if for some reason totalXP < currentlyEarned
        // (This prevents losing XP if a user deletes a workout/log)
        if (xpToAdd < 0) {
            console.log('[XP Calc] xpToAdd is negative (log deleted?), checking simple safety.');
            xpToAdd = 0;
        }

        if (xpToAdd > 0) {
            console.log(`[XP Calc] Awarding ${xpToAdd} XP.`);
            user.levelUpMode.xp += xpToAdd;
            user.levelUpMode.dailyXPEarned = totalXP; // Update tracker to match current total
            user.levelUpMode.lastXpUpdate = new Date();

            // LOG THE GAIN
            // Determine primary source for log reason
            let reason = 'Daily Activity';
            let category = 'OTHER';

            if (breakdown.fitness && breakdown.nutrition) {
                reason = 'Workout & Nutrition Logged';
                category = 'MIXED';
            } else if (breakdown.fitness) {
                reason = 'Workout Logged';
                category = 'FITNESS';
            } else if (breakdown.nutrition) {
                reason = 'Nutrition Logged';
                category = 'NUTRITION';
            }

            await logXPChange(req.user.id, xpToAdd, reason, category);
        } else {
            console.log('[XP Calc] No new XP to award.');
        }

        // Always update the calculation date to today
        user.levelUpMode.lastDailyCalculationDate = today;

        // -------------------------------------

        // Update rank based on new XP
        const newRank = calculateRank(user.levelUpMode.xp);
        const oldRank = user.levelUpMode.rank;
        const rankedUp = newRank !== oldRank;
        user.levelUpMode.rank = newRank;

        // Check for season reset
        const seasonReset = checkSeasonReset(user);

        await user.save();

        res.json({
            success: true,
            xpAwarded: xpToAdd,  // Actual XP added this call
            dailyTotal: totalXP, // Total XP calculated for today
            breakdown,
            newTotal: user.levelUpMode.xp,
            rank: user.levelUpMode.rank,
            rankedUp,
            oldRank: rankedUp ? oldRank : null,
            seasonReset,
            streaks: user.levelUpMode.streaks
        });
    } catch (err) {
        console.error('Calculate daily XP error:', err);
        res.status(500).json({ msg: 'Server error calculating daily XP' });
    }
});

/**
 * @route   GET /api/levelup/history
 * @desc    Get XP History logs
 * @access  Private
 */
router.get('/history', auth, async (req, res) => {
    try {
        const history = await XPHistory.find({ user: req.user.id })
            .sort({ date: -1 })
            .limit(50)
            .select('-__v')
            .lean();
        res.json(history);
    } catch (err) {
        console.error('Get XP history error:', err);
        res.status(500).json({ msg: 'Server error fetching XP history' });
    }
});

/**
 * @route   POST /api/levelup/award-xp
 * @desc    Manually award XP (for specific events)
 * @access  Private
 */
router.post('/award-xp', auth, async (req, res) => {
    try {
        const { amount, reason } = req.body;
        const user = await User.findById(req.user.id);

        if (!user.levelUpMode.enabled) {
            return res.status(400).json({ msg: 'Level Up Mode not enabled' });
        }

        user.levelUpMode.xp += amount;
        user.levelUpMode.lastXpUpdate = new Date();

        const newRank = calculateRank(user.levelUpMode.xp);
        const oldRank = user.levelUpMode.rank;
        const rankedUp = newRank !== oldRank;
        user.levelUpMode.rank = newRank;

        await logXPChange(req.user.id, amount, reason, 'OTHER');

        await user.save();

        res.json({
            success: true,
            xpAwarded: amount,
            reason,
            newTotal: user.levelUpMode.xp,
            rank: user.levelUpMode.rank,
            rankedUp,
            oldRank: rankedUp ? oldRank : null
        });
    } catch (err) {
        console.error('Award XP error:', err);
        res.status(500).json({ msg: 'Server error awarding XP' });
    }
});

/**
 * @route   POST /api/levelup/reset-xp
 * @desc    Reset XP for testing (DEV ONLY)
 * @access  Private
 */
router.post('/reset-xp', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // Reset XP and related fields
        user.levelUpMode.xp = 0;
        user.levelUpMode.rank = 'E';
        user.levelUpMode.dailyXPEarned = 0;
        user.levelUpMode.lastDailyCalculationDate = null;
        user.levelUpMode.streaks.fitness.current = 0;
        user.levelUpMode.streaks.nutrition.current = 0;

        await user.save();

        // Also clear XP History
        await XPHistory.deleteMany({ user: req.user.id });

        res.json({
            success: true,
            message: 'XP reset to 0',
            levelUpMode: user.levelUpMode
        });
    } catch (err) {
        console.error('Reset XP error:', err);
        res.status(500).json({ msg: 'Server error resetting XP' });
    }
});

/**
 * @route   POST /api/levelup/log-rest-day
 * @desc    Mark today as a rest day (no XP penalty, streak maintained)
 * @access  Private
 */
router.post('/log-rest-day', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user.levelUpMode.enabled) {
            return res.status(400).json({ msg: 'Level Up Mode not enabled' });
        }

        // Get today's date string in local timezone
        const now = new Date();
        const localYear = now.getFullYear();
        const localMonth = String(now.getMonth() + 1).padStart(2, '0');
        const localDay = String(now.getDate()).padStart(2, '0');
        const todayDateString = `${localYear}-${localMonth}-${localDay}`;

        // Initialize restDays if not exists
        if (!user.levelUpMode.restDays) {
            user.levelUpMode.restDays = [];
        }

        // Check if already logged as rest day
        if (user.levelUpMode.restDays.includes(todayDateString)) {
            return res.json({
                success: true,
                message: 'Today is already marked as a rest day',
                date: todayDateString
            });
        }

        // Add today to rest days
        user.levelUpMode.restDays.push(todayDateString);

        // Update lastDailyCalculationDate to prevent penalty on next calculation
        user.levelUpMode.lastDailyCalculationDate = now;

        // Keep only last 90 days of rest day records (cleanup)
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90);
        user.levelUpMode.restDays = user.levelUpMode.restDays.filter(dateStr => {
            const [year, month, day] = dateStr.split('-').map(Number);
            const restDate = new Date(year, month - 1, day);
            return restDate >= cutoffDate;
        });

        await user.save();

        // Log as XP History entry (0 XP but tracked)
        await logXPChange(req.user.id, 0, 'Rest Day (No Penalty)', 'REST_DAY');

        res.json({
            success: true,
            message: 'Rest day logged! No XP penalty will be applied.',
            date: todayDateString,
            totalRestDays: user.levelUpMode.restDays.length
        });
    } catch (err) {
        console.error('Log rest day error:', err);
        res.status(500).json({ msg: 'Server error logging rest day' });
    }
});

/**
 * @route   GET /api/levelup/rest-days
 * @desc    Get user's logged rest days
 * @access  Private
 */
router.get('/rest-days', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.json({
            success: true,
            restDays: user.levelUpMode.restDays || []
        });
    } catch (err) {
        console.error('Get rest days error:', err);
        res.status(500).json({ msg: 'Server error fetching rest days' });
    }
});

module.exports = router;
