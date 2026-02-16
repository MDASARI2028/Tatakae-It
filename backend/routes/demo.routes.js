const router = require('express').Router();
const User = require('../models/user.model');
const { Workout } = require('../models/workout.model');
const Nutrition = require('../models/nutrition.model');
const XPHistory = require('../models/XPHistory.model');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Import helpers
const {
    calculateRank,
    getNextRankXP,
    calculateFitnessXP,
    calculateNutritionXP,
    calculateStreakBonus,
    checkSeasonReset
} = require('../utils/levelUpHelpers');

const DEMO_EMAIL = process.env.DEMO_USER_EMAIL || 'demo@tatakai.it';
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'demo123';
const CRON_SECRET = process.env.CRON_SECRET || 'demo-cron-secret-123';

/**
 * @route   POST /api/demo/seed-daily
 * @desc    Automatically feeds data into the demo account for today
 * @access  Protected (Cron Secret)
 */
// @route   GET /api/demo/seed-daily (GET for Vercel Cron compatibility)
// @desc    Automatically feeds data into the demo account for today
// @access  Protected (Cron Secret)
router.get('/seed-daily', async (req, res) => {
    try {
        // 1. Security Check
        // Vercel sends Authorization: Bearer <CRON_SECRET>
        // We also allow x-cron-secret for manual testing
        const authHeader = req.headers['authorization'];
        const manualSecret = req.headers['x-cron-secret'];

        const authorized = (authHeader === `Bearer ${CRON_SECRET}`) || (manualSecret === CRON_SECRET);

        /* 
           NOTE: For the demo to work easily without strict enviroment setup issues immediately, 
           we can allow a 'force' parameter or just log a warning if secret is missing but still run 
           IF IT IS A DEMO. But for security, let's keep it strict but maybe allow a query param for testing?
           Let's stick to the env var secret.
        */

        if (!authorized && process.env.NODE_ENV === 'production') {
            return res.status(401).json({ msg: 'Unauthorized: Invalid Cron Secret' });
        }

        console.log('[DEMO SEED] Starting daily seed for demo account...');

        // 2. Find or Create Demo User
        let user = await User.findOne({ email: DEMO_EMAIL });

        if (!user) {
            console.log('[DEMO SEED] Demo user not found. Creating...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, salt);

            user = new User({
                username: 'DemoUser',
                email: DEMO_EMAIL,
                password: hashedPassword, // Will be re-hashed by pre-save hook effectively but we hash it here to be safe or pass plain if model handles it? 
                // Model handles it if modified. 
                // Actually model pre-save hook hashes it. So we should pass plain text if we create new instance?
                // Wait, pre-save hook checks `isModified('password')`. 
                // If I pass hashed password, it might double hash if I'm not careful.
                // But `user = new User({ password: ... })` marks it as modified.
                // Let's pass plain text and let the model hash it.
                // Wait, if I pass 'hashedPassword', the model will hash the hash.

                // Correction: Passing plain password
                password: DEMO_PASSWORD,
                levelUpMode: {
                    enabled: true,
                    xp: 5000,
                    rank: 'E',
                    seasonStartDate: new Date(),
                    streaks: {
                        fitness: { current: 5, longest: 5, lastLog: new Date() },
                        nutrition: { current: 5, longest: 5, lastLog: new Date() }
                    }
                }
            });
            await user.save();
        } else {
            // Ensure Level Up Mode is enabled
            if (!user.levelUpMode.enabled) {
                user.levelUpMode.enabled = true;
                await user.save();
            }
        }

        // 3. Define Today's Date (Local Timezone Simulation)
        const now = new Date();
        const localYear = now.getFullYear();
        const localMonth = String(now.getMonth() + 1).padStart(2, '0');
        const localDay = String(now.getDate()).padStart(2, '0');
        const todayDateString = `${localYear}-${localMonth}-${localDay}`;

        // Date range for queries
        const todayStart = new Date(localYear, now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const todayEnd = new Date(localYear, now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);

        // 4. Check & Seed Workout
        const existingWorkout = await Workout.findOne({
            user: user._id,
            date: { $gte: todayStart, $lt: todayEnd }
        });

        let workoutSeeded = false;
        if (!existingWorkout) {
            console.log('[DEMO SEED] Seeding Workout...');
            // Randomly choose Strength or Cardio
            const isStrength = Math.random() > 0.3;

            const workout = new Workout({
                user: user._id,
                date: now,
                type: isStrength ? 'Strength Training' : 'Cardio',
                duration: isStrength ? 45 + Math.floor(Math.random() * 30) : 30 + Math.floor(Math.random() * 30),
                caloriesBurned: isStrength ? 300 + Math.floor(Math.random() * 200) : 400 + Math.floor(Math.random() * 300),
                exercises: isStrength ? [
                    { name: 'Bench Press', sets: 3, reps: 10, weight: 135, setsData: [{ reps: 10, weight: 135 }, { reps: 10, weight: 135 }, { reps: 10, weight: 135 }] },
                    { name: 'Squat', sets: 3, reps: 8, weight: 185, setsData: [{ reps: 8, weight: 185 }, { reps: 8, weight: 185 }, { reps: 8, weight: 185 }] },
                    { name: 'Pull Ups', sets: 3, reps: 10, weight: 0, setsData: [{ reps: 10, weight: 0 }, { reps: 10, weight: 0 }, { reps: 10, weight: 0 }] }
                ] : [],
                distance: isStrength ? 0 : 5 + Math.random() * 5, // km
                notes: 'Automated Demo Log'
            });
            await workout.save();
            workoutSeeded = true;
        }

        // 5. Check & Seed Nutrition
        const existingNutrition = await Nutrition.findOne({
            user: user._id,
            date: todayDateString
        });

        let nutritionSeeded = false;
        if (!existingNutrition) {
            console.log('[DEMO SEED] Seeding Nutrition...');

            const meals = [
                {
                    mealType: 'Breakfast',
                    mealName: 'Healthy Start',
                    items: [
                        { foodName: 'Oatmeal', calories: 150, protein: 5, carbohydrates: 27, fat: 3, servingSize: 1, servingUnit: 'cup' },
                        { foodName: 'Eggs', calories: 140, protein: 12, carbohydrates: 0, fat: 10, servingSize: 2, servingUnit: 'large' }
                    ]
                },
                {
                    mealType: 'Lunch',
                    mealName: 'Power Lunch',
                    items: [
                        { foodName: 'Chicken Breast', calories: 165, protein: 31, carbohydrates: 0, fat: 3.6, servingSize: 100, servingUnit: 'g' },
                        { foodName: 'Brown Rice', calories: 216, protein: 5, carbohydrates: 45, fat: 1.8, servingSize: 1, servingUnit: 'cup' },
                        { foodName: 'Broccoli', calories: 55, protein: 3.7, carbohydrates: 11, fat: 0.6, servingSize: 1, servingUnit: 'cup' }
                    ]
                },
                {
                    mealType: 'Dinner',
                    mealName: 'Recovery Meal',
                    items: [
                        { foodName: 'Salmon', calories: 208, protein: 20, carbohydrates: 0, fat: 13, servingSize: 100, servingUnit: 'g' },
                        { foodName: 'Sweet Potato', calories: 112, protein: 2, carbohydrates: 26, fat: 0.1, servingSize: 1, servingUnit: 'medium' }
                    ]
                }
            ];

            for (const meal of meals) {
                await Nutrition.create({
                    user: user._id,
                    date: todayDateString,
                    ...meal
                });
            }
            nutritionSeeded = true;
        }

        // 6. Calculate XP & Stats (Replicating calculate-daily safely)
        if (workoutSeeded || nutritionSeeded) {
            console.log('[DEMO SEED] Recalculating Daily XP...');
            await calculateDailyXP(user, todayStart, todayEnd, todayDateString);
        }

        res.json({
            success: true,
            msg: 'Demo data seeded successfully',
            data: {
                workoutSeeded,
                nutritionSeeded,
                user: user.email
            }
        });

    } catch (err) {
        console.error('[DEMO SEED ERROR]', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * Reused Logic from levelup.routes.js to update XP/Streaks
 */
async function calculateDailyXP(user, todayStart, todayEnd, todayDateString) {
    try {
        let totalXP = 0;
        const breakdown = {};

        // 1. Workout Analysis
        const todayWorkouts = await Workout.find({
            user: user._id,
            date: { $gte: todayStart, $lt: todayEnd }
        }).sort({ date: -1 }).lean();

        if (todayWorkouts.length > 0) {
            const twoWeeksAgo = new Date(todayStart);
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

            const previousWorkouts = await Workout.find({
                user: user._id,
                date: { $gte: twoWeeksAgo, $lt: todayStart }
            }).select('-__v').lean();

            const fitnessResult = await calculateFitnessXP(todayWorkouts[0], previousWorkouts);
            totalXP += fitnessResult.totalXP;
            breakdown.fitness = fitnessResult;

            const streakBonus = calculateStreakBonus(user, 'fitness', true);
            if (streakBonus > 0) totalXP += streakBonus;
        } else {
            calculateStreakBonus(user, 'fitness', false);
        }

        // 2. Nutrition Analysis
        const todayNutrition = await Nutrition.find({
            user: user._id,
            date: todayDateString
        }).lean();

        if (todayNutrition.length > 0) {
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
            }, { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });

            const nutritionResult = calculateNutritionXP(dailyTotals, user.nutritionGoals || {});
            totalXP += nutritionResult.totalXP;
            breakdown.nutrition = nutritionResult;

            const streakBonus = calculateStreakBonus(user, 'nutrition', true);
            if (streakBonus > 0) totalXP += streakBonus;
        } else {
            calculateStreakBonus(user, 'nutrition', false);
        }

        // 3. Update User
        // Reset daily earned if new day
        const lastCalcDate = user.levelUpMode.lastDailyCalculationDate ? new Date(user.levelUpMode.lastDailyCalculationDate) : null;
        const isNewDay = !lastCalcDate ||
            (lastCalcDate.getDate() !== new Date().getDate() || lastCalcDate.getMonth() !== new Date().getMonth());

        if (isNewDay) {
            user.levelUpMode.dailyXPEarned = 0;
        }

        const currentlyEarned = user.levelUpMode.dailyXPEarned || 0;
        const xpToAdd = Math.max(0, totalXP - currentlyEarned);

        if (xpToAdd > 0) {
            user.levelUpMode.xp += xpToAdd;
            user.levelUpMode.dailyXPEarned = totalXP;
            user.levelUpMode.lastXpUpdate = new Date();

            // Log History (Simplified for Demo)
            await XPHistory.create({
                user: user._id,
                amount: xpToAdd,
                type: 'GAIN',
                reason: 'Demo Daily Activity',
                category: 'MIXED'
            });
        }

        user.levelUpMode.lastDailyCalculationDate = new Date();

        // Recalculate Rank
        const newRank = calculateRank(user.levelUpMode.xp);
        user.levelUpMode.rank = newRank;

        await user.save();
        console.log(`[DEMO SEED] XP Updated. Total: ${totalXP}, Added: ${xpToAdd}`);

    } catch (err) {
        console.error('Error calculating daily XP in demo seed:', err);
    }
}

module.exports = router;
