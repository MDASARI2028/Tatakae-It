import React, { useMemo, useState, useContext } from 'react';
import { useNutrition } from '../../context/NutritionContext';
import { RecipeContext } from '../../context/RecipeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSave, FaEdit, FaTrash, FaUtensils, FaFire, FaGem, FaTint, FaBullseye } from 'react-icons/fa';
import { HiViewGrid } from 'react-icons/hi';
import './NutritionHistory.css';
import EditMealModal from './EditMealModal';

const NutritionHistory = () => {
    const { nutritionLogs, loading, error, deleteMeal } = useNutrition();
    const [editingMeal, setEditingMeal] = useState(null);
    const { addRecipe } = useContext(RecipeContext);

    const dailyTotals = useMemo(() => {
        const totals = { calories: 0, protein: 0, carbohydrates: 0, fat: 0 };
        nutritionLogs.forEach(log => {
            log.items.forEach(item => {
                totals.calories += Number(item.calories) || 0;
                totals.protein += Number(item.protein) || 0;
                totals.carbohydrates += Number(item.carbohydrates) || 0;
                totals.fat += Number(item.fat) || 0;
            });
        });
        return totals;
    }, [nutritionLogs]);

    const handleSaveAsRecipe = (meal) => {
        const recipeName = prompt("Enter a name for this recipe:", meal.mealName || `My ${meal.mealType}`);
        if (recipeName) {
            const recipeItems = meal.items.map(({ foodName, calories, protein, carbohydrates, fat, servingSize, servingUnit }) =>
                ({ foodName, calories, protein, carbohydrates, fat, servingSize, servingUnit }));
            addRecipe({ name: recipeName, items: recipeItems });
        }
    };

    if (loading) {
        return <p className="nh-loading">Loading history...</p>;
    }

    if (error) {
        return <p className="nh-error">{error}</p>;
    }

    if (nutritionLogs.length === 0) {
        return <p className="nh-empty">No meals logged for this day. Use the 'Meal Logger' tab to add one!</p>;
    }

    const goals = { calories: 2500, protein: 180, carbohydrates: 300, fat: 80 };


    return (
        <div className="nh-container">
            {/* Daily Summary Header */}
            <div className="nh-section-header">
                <span className="nh-glow-dot"></span>
                <h2>DAILY SUMMARY</h2>
            </div>

            {/* Summary Cards Grid */}
            <div className="nh-cards-grid">
                {/* Calories Card */}
                <motion.div className="nh-card" whileHover={{ y: -4 }}>
                    <div className="nh-card-top">
                        <div className="nh-icon-box blue"><FaFire /></div>
                        <span className="nh-goal">GOAL: {goals.calories}</span>
                    </div>
                    <div className="nh-card-value">{dailyTotals.calories.toFixed(0)}</div>
                    <div className="nh-card-label">CALORIES</div>
                    <div className="nh-progress-track">
                        <div className="nh-progress-fill blue" style={{ width: `${Math.min((dailyTotals.calories / goals.calories) * 100, 100)}%` }}></div>
                    </div>
                </motion.div>

                {/* Protein Card */}
                <motion.div className="nh-card" whileHover={{ y: -4 }}>
                    <div className="nh-card-top">
                        <div className="nh-icon-box blue"><FaGem /></div>
                        <span className="nh-goal">GOAL: {goals.protein}G</span>
                    </div>
                    <div className="nh-card-value">{dailyTotals.protein.toFixed(1)}g</div>
                    <div className="nh-card-label">PROTEIN</div>
                    <div className="nh-progress-track">
                        <div className="nh-progress-fill blue" style={{ width: `${Math.min((dailyTotals.protein / goals.protein) * 100, 100)}%` }}></div>
                    </div>
                </motion.div>

                {/* Carbs Card */}
                <motion.div className="nh-card" whileHover={{ y: -4 }}>
                    <div className="nh-card-top">
                        <div className="nh-icon-box cyan"><FaTint /></div>
                        <span className="nh-goal">GOAL: {goals.carbohydrates}G</span>
                    </div>
                    <div className="nh-card-value">{dailyTotals.carbohydrates.toFixed(1)}g</div>
                    <div className="nh-card-label">CARBS</div>
                    <div className="nh-progress-track">
                        <div className="nh-progress-fill cyan" style={{ width: `${Math.min((dailyTotals.carbohydrates / goals.carbohydrates) * 100, 100)}%` }}></div>
                    </div>
                </motion.div>

                {/* Fat Card */}
                <motion.div className="nh-card" whileHover={{ y: -4 }}>
                    <div className="nh-card-top">
                        <div className="nh-icon-box orange"><FaBullseye /></div>
                        <span className="nh-goal">GOAL: {goals.fat}G</span>
                    </div>
                    <div className="nh-card-value">{dailyTotals.fat.toFixed(1)}g</div>
                    <div className="nh-card-label">FAT</div>
                    <div className="nh-progress-track">
                        <div className="nh-progress-fill orange" style={{ width: `${Math.min((dailyTotals.fat / goals.fat) * 100, 100)}%` }}></div>
                    </div>
                </motion.div>
            </div>

            {/* Meal Cards */}
            <div className="nh-meals-list">
                <AnimatePresence>
                    {nutritionLogs.map((log, idx) => (
                        <motion.div
                            key={log._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className="nh-meal-card"
                        >
                            <div className="nh-meal-header">
                                <div className="nh-meal-header-left">
                                    <FaUtensils className="nh-meal-icon" />
                                    <h3>{log.mealName || log.mealType}</h3>
                                </div>
                                <div className="nh-meal-actions">
                                    <button onClick={() => handleSaveAsRecipe(log)} title="Save Recipe"><FaSave /></button>
                                    <button onClick={() => setEditingMeal(log)} title="Edit"><FaEdit /></button>
                                    <button onClick={() => deleteMeal(log._id)} title="Delete"><FaTrash /></button>
                                </div>
                            </div>

                            <div className="nh-meal-items">
                                {log.items.map((item, index) => (
                                    <div key={index} className="nh-item-row">
                                        <div className="nh-item-left">
                                            <div className="nh-item-icon"><HiViewGrid /></div>
                                            <div className="nh-item-text">
                                                <span className="nh-item-name">{item.foodName}</span>
                                                <span className="nh-item-cat">MAIN COURSE</span>
                                            </div>
                                        </div>

                                        <div className="nh-item-right">
                                            <span className="nh-portion-badge">1 PORTION</span>
                                            <div className="nh-macros">
                                                <div className="nh-macro">
                                                    <span className="nh-macro-label">KCAL</span>
                                                    <span className="nh-macro-value white">{Number(item.calories).toFixed(0)}</span>
                                                </div>
                                                <div className="nh-macro">
                                                    <span className="nh-macro-label">P</span>
                                                    <span className="nh-macro-value blue">{Number(item.protein).toFixed(0)}g</span>
                                                </div>
                                                <div className="nh-macro">
                                                    <span className="nh-macro-label">C</span>
                                                    <span className="nh-macro-value cyan">{Number(item.carbohydrates).toFixed(0)}g</span>
                                                </div>
                                                <div className="nh-macro">
                                                    <span className="nh-macro-label">F</span>
                                                    <span className="nh-macro-value orange">{Number(item.fat).toFixed(0)}g</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="nh-footer">
                TACTICAL NUTRITION OS // V4.0.2
                <div className="nh-footer-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>

            {editingMeal && (
                <EditMealModal
                    meal={editingMeal}
                    onClose={() => setEditingMeal(null)}
                />
            )}
        </div>
    );
};

export default NutritionHistory;