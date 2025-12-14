// backend/routes/levelup.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const Workout = require('../models/workout.model');
const Nutrition = require('../models/nutrition.model');
const Hydration = require('../models/hydration.model');
const BodyMetrics = require('../models/bodyMetric.model');
const {
    calculateRank,
    getNextRankXP,
    calculateFitnessXP,
    calculateNutritionXP,
    calculateStreakBonus,
    checkSeasonReset
} = require('../utils/levelUpHelpers');

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
    try {
        const user = await User.findById(req.user.id);

        if (!user.levelUpMode.enabled) {
            return res.status(400).json({ msg: 'Level Up Mode not enabled' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let totalXP = 0;
        const breakdown = {};

        // 1. Check for workouts today
        const todayWorkouts = await Workout.find({
            user: req.user.id,
            date: { $gte: today, $lt: tomorrow }
        }).sort({ date: -1 });

        if (todayWorkouts.length > 0) {
            // Get previous workouts for comparison (last 14 days)
            const twoWeeksAgo = new Date(today);
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            const previousWorkouts = await Workout.find({
                user: req.user.id,
                date: { $gte: twoWeeksAgo, $lt: today }
            });

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
        const todayNutrition = await Nutrition.find({
            user: req.user.id,
            date: { $gte: today, $lt: tomorrow }
        });

        if (todayNutrition.length > 0) {
            // Calculate daily totals
            const dailyTotals = {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                water: 0
            };

            todayNutrition.forEach(log => {
                log.items.forEach(item => {
                    dailyTotals.calories += item.calories || 0;
                    dailyTotals.protein += item.protein || 0;
                    dailyTotals.carbs += item.carbohydrates || 0;
                    dailyTotals.fat += item.fat || 0;
                });
            });

            // Add hydration
            const todayHydration = await Hydration.find({
                user: req.user.id,
                date: { $gte: today, $lt: tomorrow }
            });

            dailyTotals.water = todayHydration.reduce((sum, log) => sum + (log.amount || 0), 0);

            // Calculate nutrition XP
            const nutritionResult = calculateNutritionXP(dailyTotals, user.nutritionGoals);
            totalXP += nutritionResult.totalXP;
            breakdown.nutrition = nutritionResult;

            // Calculate nutrition streak bonus
            const nutritionStreakBonus = calculateStreakBonus(user, 'nutrition', true);
            if (nutritionStreakBonus > 0) {
                totalXP += nutritionStreakBonus;
                breakdown.nutritionStreakBonus = nutritionStreakBonus;
            }
        } else {
            // No meals logged - break streak
            calculateStreakBonus(user, 'nutrition', false);
        }

        // 3. Check for body metrics today
        const todayMetrics = await BodyMetrics.findOne({
            user: req.user.id,
            date: { $gte: today, $lt: tomorrow }
        });

        if (todayMetrics) {
            totalXP += 25;
            breakdown.bodyMetrics = 25;
        }

        // 4. Check for perfect day bonus
        if (breakdown.nutrition && breakdown.nutrition.targetsMet === 5 &&
            breakdown.fitness && breakdown.fitness.improvementRate === '100.0%') {
            totalXP += 500;
            breakdown.perfectDayBonus = 500;
        }

        // Award XP
        user.levelUpMode.xp += totalXP;
        user.levelUpMode.lastXpUpdate = new Date();

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
            xpAwarded: totalXP,
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

module.exports = router;
