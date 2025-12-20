// backend/routes/hydration.routes.js

const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const Hydration = require('../models/hydration.model');

// @route   POST /api/hydration
// @desc    Log a new hydration entry
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { date, amount } = req.body;

        if (!date || !amount) {
            return res.status(400).json({ msg: 'Date and amount are required.' });
        }

        const newHydrationLog = new Hydration({
            user: req.user.id,
            date,
            amount
        });

        const savedLog = await newHydrationLog.save();
        res.status(201).json(savedLog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/hydration/date/:date
// @desc    Get all hydration logs for a specific date
// @access  Private
router.get('/date/:date', auth, async (req, res) => {
    try {
        const date = new Date(req.params.date);
        const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);

        const logs = await Hydration.find({
            user: req.user.id,
            date: { $gte: startDate, $lt: endDate }
        })
            .sort({ createdAt: 'asc' })
            .lean();

        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// @route   DELETE /api/hydration/:id
// @desc    Delete a hydration log
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const log = await Hydration.findById(req.params.id);

        if (!log) {
            return res.status(404).json({ msg: 'Log not found.' });
        }

        if (log.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized.' });
        }

        // ✅ THE FIX: Changed .remove() to .deleteOne()
        await log.deleteOne();

        res.json({ msg: 'Hydration log deleted successfully.' });

    } catch (err) {
        // We'll add a temporary console.log here for better debugging
        console.error("DELETE HYDRATION ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;