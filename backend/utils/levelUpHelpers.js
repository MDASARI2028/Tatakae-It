// backend/utils/levelUpHelpers.js

/**
 * Rank configuration and XP thresholds
 */
const RANK_THRESHOLDS = {
    'E': 0,
    'D': 8000,
    'C': 20000,
    'B': 40000,
    'A': 60000,
    'S': 85000,
    'National': 115000,
    'Monarch': 150000
};

const RANK_COLORS = {
    'E': '#6B7280',      // Gray
    'D': '#CD7F32',      // Bronze
    'C': '#C0C0C0',      // Silver
    'B': '#FFD700',      // Gold
    'A': '#50C878',      // Emerald
    'S': '#0F52BA',      // Sapphire
    'National': '#E0115F', // Ruby
    'Monarch': '#8A2BE2'  // Violet
};

/**
 * Calculate rank based on XP
 */
function calculateRank(xp) {
    if (xp >= 150000) return 'Monarch';
    if (xp >= 115000) return 'National';
    if (xp >= 85000) return 'S';
    if (xp >= 60000) return 'A';
    if (xp >= 40000) return 'B';
    if (xp >= 20000) return 'C';
    if (xp >= 8000) return 'D';
    return 'E';
}

/**
 * Get XP required for next rank
 */
function getNextRankXP(currentRank) {
    const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'National', 'Monarch'];
    const currentIndex = ranks.indexOf(currentRank);

    if (currentIndex === ranks.length - 1) {
        return null; // Max rank
    }

    const nextRank = ranks[currentIndex + 1];
    return RANK_THRESHOLDS[nextRank];
}

/**
 * Calculate progressive overload XP for fitness using volume comparison
 * Volume = sets × reps × weight for each exercise
 * Returns { baseXP, progressiveXP, totalXP, exerciseDetails }
 * Negative XP is awarded for decreased volume
 */
async function calculateFitnessXP(workout, previousWorkouts) {
    const baseXP = 25; // For logging
    let totalProgressXP = 0;
    const totalExercises = workout.exercises?.length || 0;
    const exerciseDetails = [];

    if (totalExercises === 0) {
        return {
            baseXP,
            progressiveXP: 0,
            totalXP: baseXP,
            exerciseDetails: [],
            summary: 'No exercises logged'
        };
    }

    // Check each exercise for progressive overload
    for (const exercise of workout.exercises) {
        // Find last performance of this exercise (within 14 days)
        const lastPerformance = findLastPerformance(exercise.name, previousWorkouts, 14);

        // Calculate current volume
        let currentVolume = 0;
        if (exercise.setsData && exercise.setsData.length > 0) {
            currentVolume = exercise.setsData.reduce((acc, set) => {
                return acc + ((Number(set.reps) || 0) * (Number(set.weight) || 0)); // Weight 0 is valid for bodyweight, but usually we want at least 1 for multiplication? 
                // Actually if weight is 0 (bodyweight), volume is 0? 
                // Usually bodyweight exercises are treated as weight 1 or bodyweight. 
                // The original code used `(Number(exercise.weight) || 1)`.
            }, 0);
            // If calculated volume is 0 (e.g. all weights 0), maybe apply logic?
            // But let's stick to the logic: if we use setsData, we sum reps*weight.
            // If weight is 0, volume is 0. This might be an issue for bodyweight squats.
            // The old code: `(Number(exercise.weight) || 1)` implies fallback to 1.
            // So: `(Number(set.weight) || 1)`
        } else {
            currentVolume = (Number(exercise.sets) || 0) *
                (Number(exercise.reps) || 0) *
                (Number(exercise.weight) || 1);
        }

        // Fix for bodyweight/empty setsData summing to 0 if logic relies on weight
        if (exercise.setsData && exercise.setsData.length > 0 && currentVolume === 0) {
            // Try assuming weight 1
            currentVolume = exercise.setsData.reduce((acc, set) => {
                return acc + ((Number(set.reps) || 0) * (Number(set.weight) || 1));
            }, 0);
        }

        if (!lastPerformance) {
            // First time doing this exercise - award 15 XP bonus (new PR)
            const detail = {
                name: exercise.name,
                change: null,
                xp: 15,
                reason: 'New exercise (PR)'
            };
            exerciseDetails.push(detail);
            totalProgressXP += 15;
            continue;
        }

        // Calculate previous volume
        // Calculate previous volume
        let previousVolume = 0;
        if (lastPerformance.setsData && lastPerformance.setsData.length > 0) {
            previousVolume = lastPerformance.setsData.reduce((acc, set) => {
                return acc + ((Number(set.reps) || 0) * (Number(set.weight) || 0));
            }, 0);
            // Fallback for bodyweight
            if (previousVolume === 0) {
                previousVolume = lastPerformance.setsData.reduce((acc, set) => {
                    return acc + ((Number(set.reps) || 0) * (Number(set.weight) || 1));
                }, 0);
            }
        } else {
            previousVolume = (Number(lastPerformance.sets) || 0) *
                (Number(lastPerformance.reps) || 0) *
                (Number(lastPerformance.weight) || 1);
        }

        if (previousVolume === 0) {
            exerciseDetails.push({
                name: exercise.name,
                change: null,
                xp: 0,
                reason: 'Previous had no volume'
            });
            continue;
        }

        // Calculate percentage change
        const changePercent = ((currentVolume - previousVolume) / previousVolume) * 100;

        // XP per exercise: +10 XP per 10% improvement, -5 XP per 10% decline
        // Capped at +25 to -15 per exercise
        let exerciseXP = 0;
        if (changePercent > 0) {
            exerciseXP = Math.min(25, Math.round(changePercent / 10) * 10);
        } else if (changePercent < 0) {
            exerciseXP = Math.max(-15, Math.round(changePercent / 20) * 5);
        }

        exerciseDetails.push({
            name: exercise.name,
            change: Math.round(changePercent),
            currentVolume,
            previousVolume,
            xp: exerciseXP,
            reason: changePercent > 0 ? 'Improved' : (changePercent < 0 ? 'Declined' : 'Same')
        });

        totalProgressXP += exerciseXP;
    }

    // Calculate final XP (base cannot go below 0)
    const finalXP = Math.max(0, baseXP + totalProgressXP);

    return {
        baseXP,
        progressiveXP: totalProgressXP,
        totalXP: finalXP,
        exerciseDetails,
        summary: `${exerciseDetails.filter(e => e.xp > 0).length}/${totalExercises} exercises improved`
    };
}

/**
 * Helper function to find last performance of an exercise
 */
function findLastPerformance(exerciseName, previousWorkouts, daysBack) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    // Sort workouts by date descending
    const sortedWorkouts = previousWorkouts
        .filter(w => new Date(w.date) >= cutoffDate)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Find the first workout containing this exercise
    for (const workout of sortedWorkouts) {
        const exercise = workout.exercises.find(
            ex => ex.name.toLowerCase() === exerciseName.toLowerCase()
        );
        if (exercise) {
            return exercise;
        }
    }

    return null;
}

/**
 * Calculate nutrition XP based on goal targets
 * Returns { baseXP, performanceXP, totalXP, targetsMet, targetsAchieved }
 */
function calculateNutritionXP(dailyTotals, userGoals) {
    const baseXP = 25; // For logging meals
    let targetsMetCount = 0;
    const targetsAchieved = [];

    // 1. Calorie Target (±10% tolerance)
    const calorieTarget = userGoals.calorieGoal || 2200;
    const calorieLower = calorieTarget * 0.9;
    const calorieUpper = calorieTarget * 1.1;
    if (dailyTotals.calories >= calorieLower && dailyTotals.calories <= calorieUpper) {
        targetsMetCount++;
        targetsAchieved.push('Calories');
    }

    // 2. Protein Target
    const proteinTarget = userGoals.proteinGoal || 150;
    if (dailyTotals.protein >= proteinTarget) {
        targetsMetCount++;
        targetsAchieved.push('Protein');
    }

    // 3. Carbs Target (±10% tolerance)
    const carbsTarget = userGoals.carbGoal || 250;
    const carbsLower = carbsTarget * 0.9;
    const carbsUpper = carbsTarget * 1.1;
    if (dailyTotals.carbs >= carbsLower && dailyTotals.carbs <= carbsUpper) {
        targetsMetCount++;
        targetsAchieved.push('Carbs');
    }

    // 4. Fats Target (±10% tolerance)
    const fatsTarget = userGoals.fatGoal || 70;
    const fatsLower = fatsTarget * 0.9;
    const fatsUpper = fatsTarget * 1.1;
    if (dailyTotals.fat >= fatsLower && dailyTotals.fat <= fatsUpper) {
        targetsMetCount++;
        targetsAchieved.push('Fats');
    }

    // 5. Water Target
    const waterTarget = userGoals.hydrationGoal || 3000;
    if (dailyTotals.water >= waterTarget) {
        targetsMetCount++;
        targetsAchieved.push('Water');
    }

    // XP = 20 per target met
    const performanceXP = targetsMetCount * 20;

    return {
        baseXP,
        performanceXP,
        totalXP: baseXP + performanceXP,
        targetsMet: targetsMetCount,
        totalTargets: 5,
        completionRate: (targetsMetCount / 5 * 100).toFixed(1) + '%',
        targetsAchieved
    };
}

/**
 * Update streak and calculate streak bonuses
 */
function calculateStreakBonus(user, activityType, hasActivity) {
    const streakData = user.levelUpMode.streaks[activityType];
    let bonusXP = 0;

    if (hasActivity) {
        // Check if already logged today to prevent double counting
        const now = new Date();
        const lastLog = streakData.lastLog ? new Date(streakData.lastLog) : null;

        const isSameDay = lastLog &&
            lastLog.getDate() === now.getDate() &&
            lastLog.getMonth() === now.getMonth() &&
            lastLog.getFullYear() === now.getFullYear();

        if (!isSameDay) {
            // Increment streak only if new day
            streakData.current++;

            // Update longest streak if current exceeds it
            if (streakData.current > streakData.longest) {
                streakData.longest = streakData.current;
            }

            // Update last log time
            streakData.lastLog = now;
        }

        // Award milestone bonuses (re-calculate even if same day to ensure we catch it if bonus logic changes, 
        // essentially ensuring consistency, but since current didn't change, bonus won't trigger repeatedly)
        // Wait, if we don't increment, 'current' stays same.
        // We should ensure bonus is only returned if it was JUST reached? 
        // Actually, if we use idempotency in dailyCalc, we just need stable 'totalXP'.
        // So we return the calculated bonus for the *current* streak value.
        // If 'current' is 7, bonus is 100. calculateDailyXP adds 100.
        // If we call it again, 'current' is still 7. Bonus is 100. TotalXP includes 100.
        // dailyEarned includes 100. xpToAdd is 0.
        // THIS IS CORRECT.

        const current = streakData.current;
        if (current === 365) bonusXP = 15000; // Monarch streak!
        else if (current === 180) bonusXP = 6000;
        else if (current === 90) bonusXP = 2500;
        else if (current === 30) bonusXP = 750;
        else if (current === 14) bonusXP = 300;
        else if (current === 7) bonusXP = 100;

        // If isSameDay, we update lastLog? No need, it's already today.
        if (isSameDay) {
            streakData.lastLog = now; // Update timestamp to latest activity
        }
    } else {
        // Streak broken
        streakData.current = 0;
    }

    return bonusXP;
}

/**
 * Check if season should reset (365 days elapsed)
 */
function checkSeasonReset(user) {
    if (!user.levelUpMode.seasonStartDate) {
        user.levelUpMode.seasonStartDate = new Date();
        return false;
    }

    const daysSinceStart = Math.floor(
        (new Date() - user.levelUpMode.seasonStartDate) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceStart >= 365) {
        // Save legacy achievement
        user.levelUpMode.legacyAchievements.push({
            season: user.levelUpMode.legacyAchievements.length + 1,
            year: new Date().getFullYear(),
            finalRank: user.levelUpMode.rank,
            finalXP: user.levelUpMode.xp,
            completedAt: new Date()
        });

        // Reset for new season
        user.levelUpMode.xp = 0;
        user.levelUpMode.rank = 'E';
        user.levelUpMode.seasonStartDate = new Date();
        user.levelUpMode.streaks.fitness.current = 0;
        user.levelUpMode.streaks.nutrition.current = 0;

        return true; // Season was reset
    }

    return false;
}

module.exports = {
    RANK_THRESHOLDS,
    RANK_COLORS,
    calculateRank,
    getNextRankXP,
    calculateFitnessXP,
    calculateNutritionXP,
    calculateStreakBonus,
    checkSeasonReset
};
