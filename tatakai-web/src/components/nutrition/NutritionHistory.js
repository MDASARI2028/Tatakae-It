import React, { useMemo,useState,useContext } from 'react';
import { useNutrition } from '../../context/NutritionContext';
import { RecipeContext } from '../../context/RecipeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHistory, FaSave, FaEdit, FaTrash } from 'react-icons/fa';
import './NutritionHistory.css';
import EditMealModal from './EditMealModal';

const NutritionHistory = () => {
    const { nutritionLogs, loading, error, deleteMeal } = useNutrition();
    const [editingMeal, setEditingMeal] = useState(null);
    const { addRecipe } = useContext(RecipeContext); // Use the RecipeContext
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
            // Sanitize items to match the recipe schema (remove _id, __v if they exist)
            const recipeItems = meal.items.map(({ foodName, calories, protein, carbohydrates, fat, servingSize, servingUnit }) => 
                ({ foodName, calories, protein, carbohydrates, fat, servingSize, servingUnit }));
            
            addRecipe({ name: recipeName, items: recipeItems });
        }
    };

    if (loading) {
        return <p>Loading history...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (nutritionLogs.length === 0) {
        return <p>No meals logged for this day. Use the 'Meal Logger' tab to add one!</p>;
    }

    return (
        <motion.div className="nutrition-history-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="daily-totals-card" initial={{ y: -12 }} animate={{ y: 0 }}>
                <div className="totals-header">
                    <FaHistory className="history-icon" />
                    <h3>Daily Summary</h3>
                </div>
                <div className="totals-grid">
                    <motion.div className="total-item" whileHover={{ scale: 1.05 }}>
                        <p>{dailyTotals.calories.toFixed(0)}</p>
                        <span>Calories</span>
                    </motion.div>
                    <motion.div className="total-item" whileHover={{ scale: 1.05 }}>
                        <p>{dailyTotals.protein.toFixed(1)}g</p>
                        <span>Protein</span>
                    </motion.div>
                    <motion.div className="total-item" whileHover={{ scale: 1.05 }}>
                        <p>{dailyTotals.carbohydrates.toFixed(1)}g</p>
                        <span>Carbs</span>
                    </motion.div>
                    <motion.div className="total-item" whileHover={{ scale: 1.05 }}>
                        <p>{dailyTotals.fat.toFixed(1)}g</p>
                        <span>Fat</span>
                    </motion.div>
                </div>
            </motion.div>

            <AnimatePresence>
                {nutritionLogs.map((log, idx) => (
                    <motion.div key={log._id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: idx * 0.05 }} className="meal-card">
                        <div className="meal-card-header">
                            <div className="header-left">
                                <h4>{log.mealType}</h4>
                                {log.mealName && <span className="meal-name">{log.mealName}</span>}
                            </div>
                            <div className="meal-card-controls">
                                <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleSaveAsRecipe(log)} className="control-btn save-btn" title="Save as recipe"><FaSave/></motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setEditingMeal(log)} className="control-btn edit-btn" title="Edit meal"><FaEdit/></motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} onClick={() => deleteMeal(log._id)} className="control-btn delete-btn" title="Delete meal"><FaTrash/></motion.button>
                            </div>
                        </div>
                        <div className="meal-items">
                            {log.items.map((item, index) => (
                                <motion.div key={index} className="meal-item-row" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.02 * index }}>
                                    <div className="item-name">{item.foodName}</div>
                                    <div className="item-details">
                                        <span className="serving">{item.servingSize}{item.servingUnit}</span>
                                        <span className="nutrient">{Number(item.calories).toFixed(0)} kcal</span>
                                        <span className="nutrient">{Number(item.protein).toFixed(1)}P</span>
                                        <span className="nutrient">{Number(item.carbohydrates).toFixed(1)}C</span>
                                        <span className="nutrient">{Number(item.fat).toFixed(1)}F</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            {editingMeal && (
                <EditMealModal 
                    meal={editingMeal} 
                    onClose={() => setEditingMeal(null)} 
                />
            )}
        </motion.div>
    );
};

export default NutritionHistory;