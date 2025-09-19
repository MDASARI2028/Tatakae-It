import React, { useMemo,useState,useContext } from 'react';
import { useNutrition } from '../../context/NutritionContext';
import { RecipeContext } from '../../context/RecipeContext'; // Import the new context
import './NutritionHistory.css';
import EditMealModal from './EditMealModal'; // Import the new modal

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
        <div className="nutrition-history-container">
            {/* Daily Totals Summary Card */}
            <div className="daily-totals-card">
                <h3>Daily Totals</h3>
                <div className="totals-grid">
                    <div className="total-item">
                        <p>{dailyTotals.calories.toFixed(0)}</p>
                        <span>KCAL</span>
                    </div>
                    <div className="total-item">
                        <p>{dailyTotals.protein.toFixed(1)}g</p>
                        <span>Protein</span>
                    </div>
                    <div className="total-item">
                        <p>{dailyTotals.carbohydrates.toFixed(1)}g</p>
                        <span>Carbs</span>
                    </div>
                    <div className="total-item">
                        <p>{dailyTotals.fat.toFixed(1)}g</p>
                        <span>Fat</span>
                    </div>
                </div>
            </div>

            {/* List of Meal Cards */}
            {nutritionLogs.map(log => (
                <div key={log._id} className="meal-card">
                    <header className="meal-card-header">
                        <div>
                            <h4>{log.mealType}</h4>
                            {log.mealName && <span>{log.mealName}</span>}
                        </div>
                        <div className="meal-card-controls">
                            <button onClick={() => handleSaveAsRecipe(log)} className="save-btn">Save</button>
                            <button onClick={() => setEditingMeal(log)} className="edit-btn">Edit</button>
                            <button onClick={() => deleteMeal(log._id)} className="delete-meal-btn">Delete</button>
                        </div>
                        <button onClick={() => deleteMeal(log._id)} className="delete-meal-btn">Delete</button>
                    </header>
                    <table className="meal-items-table">
                        <thead>
                            <tr>
                                <th>Food</th>
                                <th className="col-numeric">Serving</th>
                                <th className="col-numeric">Kcal</th>
                                <th className="col-numeric">Protein</th>
                                <th className="col-numeric">Carbs</th>
                                <th className="col-numeric">Fat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {log.items.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.foodName}</td>
                                    <td className="col-numeric">{item.servingSize} {item.servingUnit}</td>
                                    <td className="col-numeric">{Number(item.calories).toFixed(0)}</td>
                                    <td className="col-numeric">{Number(item.protein).toFixed(1)}g</td>
                                    <td className="col-numeric">{Number(item.carbohydrates).toFixed(1)}g</td>
                                    <td className="col-numeric">{Number(item.fat).toFixed(1)}g</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
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