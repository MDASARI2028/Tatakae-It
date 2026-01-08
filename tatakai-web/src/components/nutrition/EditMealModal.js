import React, { useState, useEffect } from 'react';
import { useNutrition } from '../../context/NutritionContext';
import './EditMealModal.css';

const EditMealModal = ({ meal, onClose }) => {
    const { updateMeal, loading } = useNutrition();

    // Initialize state for the form fields
    const [mealTitle, setMealTitle] = useState('');
    const [mealType, setMealType] = useState('Breakfast');
    const [items, setItems] = useState([]);

    // This useEffect hook pre-fills the form whenever a new 'meal' is passed to the modal
    useEffect(() => {
        if (meal) {
            setMealTitle(meal.mealName || '');
            setMealType(meal.mealType);
            // We need to remove the internal __v and _id properties Mongoose adds to sub-documents
            setItems(meal.items.map(({ foodName, calories, protein, carbohydrates, fat, servingSize, servingUnit }) => 
                ({ foodName, calories, protein, carbohydrates, fat, servingSize, servingUnit }))
            );
        }
    }, [meal]);

    if (!meal) return null;

    // These functions are similar to the logger, but operate on this modal's state
    const handleItemChange = (index, event) => {
        const updatedItems = [...items];
        updatedItems[index][event.target.name] = event.target.value;
        setItems(updatedItems);
    };
    const handleAddItem = () => setItems([...items, { foodName: '', calories: '', protein: '', carbohydrates: '', fat: '', servingSize: '', servingUnit: '' }]);
    const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));

    const handleSubmit = (e) => {
        e.preventDefault();
        const mealData = {
            mealName: mealTitle,
            mealType,
            items: items.filter(item => item.foodName && item.calories && item.servingSize),
        };
        updateMeal(meal._id, mealData).then(() => {
            onClose(); // Close the modal on success
        });
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Edit Meal</h2>
                <form onSubmit={handleSubmit} className="edit-meal-form">
                    {/* This form is a mirror of your new NutritionLogger component */}
                    <div className="form-row">
                         <div className="form-group-inline">
                            <label htmlFor="mealType">Meal Type</label>
                            <select id="mealType" value={mealType} onChange={(e) => setMealType(e.target.value)}>
                                <option>Breakfast</option>
                                <option>Lunch</option>
                                <option>Dinner</option>
                                <option>Snacks</option>
                            </select>
                        </div>
                        <div className="form-group-inline">
                            <label htmlFor="mealTitle">Meal Title (Optional)</label>
                            <input type="text" id="mealTitle" value={mealTitle} onChange={(e) => setMealTitle(e.target.value)} />
                        </div>
                    </div>
                    <div className="items-list">
                         {items.map((item, index) => (
                            <div key={index} className="food-item-row">
                                <input type="text" name="foodName" placeholder="Food Name" value={item.foodName} onChange={e => handleItemChange(index, e)} required className="food-name-input"/>
                                <input type="number" name="servingSize" placeholder="Size" value={item.servingSize} onChange={e => handleItemChange(index, e)} required />
                                <input type="text" name="servingUnit" placeholder="Unit" value={item.servingUnit} onChange={e => handleItemChange(index, e)} required />
                                <input type="number" name="calories" placeholder="kcal" value={item.calories} onChange={e => handleItemChange(index, e)} required />
                                <input type="number" name="protein" placeholder="P (g)" value={item.protein} onChange={e => handleItemChange(index, e)} />
                                <input type="number" name="carbohydrates" placeholder="C (g)" value={item.carbohydrates} onChange={e => handleItemChange(index, e)} />
                                <input type="number" name="fat" placeholder="F (g)" value={item.fat} onChange={e => handleItemChange(index, e)} />
                                <button type="button" className="remove-item-btn" onClick={() => handleRemoveItem(index)}>×</button>
                            </div>
                        ))}
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="add-item-btn" onClick={handleAddItem}>+ Add Item</button>
                        <div>
                            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn-save" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMealModal;