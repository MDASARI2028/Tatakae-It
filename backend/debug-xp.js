const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const User = require('./models/user.model');
const XPHistory = require('./models/XPHistory.model');

// Load env
dotenv.config();

const runDebug = async () => {
    const results = { users: [] };

    try {
        await mongoose.connect(process.env.MONGO_URI);

        const users = await User.find({ 'levelUpMode.enabled': true });

        for (const user of users) {
            const history = await XPHistory.find({ user: user._id }).sort({ date: -1 }).limit(10).lean();

            results.users.push({
                username: user.username,
                xp: user.levelUpMode.xp,
                rank: user.levelUpMode.rank,
                streaks: user.levelUpMode.streaks,
                dailyEarned: user.levelUpMode.dailyXPEarned,
                history: history.map(h => ({
                    date: h.date,
                    amount: h.amount,
                    reason: h.reason,
                    category: h.category
                }))
            });
        }

        fs.writeFileSync('debug_result.json', JSON.stringify(results, null, 2));

    } catch (err) {
        fs.writeFileSync('debug_error.txt', err.toString());
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

runDebug();
