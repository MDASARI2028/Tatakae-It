import React, { useState, useEffect, useContext } from 'react';
import { useNutrition } from '../../context/NutritionContext';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './NutritionLogger.css';

const NutritionLogger = ({ selectedDate }) => {
    const { addMeal, loading } = useNutrition();
    const { token } = useContext(AuthContext);
    
    const [items, setItems] = useState([]);
    const [mealType, setMealType] = useState('Breakfast');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!token || searchQuery.length < 3) {
            setSearchResults([]);
            return;
        }
        const delayDebounce = setTimeout(async () => {
            setIsSearching(true);
            try {
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get(`/api/food-search?query=${searchQuery}`, config);
                setSearchResults(res.data);
            } catch (error) { 
                console.error("Search failed:", error); 
                setSearchResults([]); 
            }
            setIsSearching(false);
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchQuery, token]);

    const handleAddItemFromSearch = (food) => {
        const newItem = {
            foodName: food.label,
            calories: Math.round(food.calories) || 0,
            protein: Math.round(food.protein) || 0,
            carbohydrates: Math.round(food.carbs) || 0,
            fat: Math.round(food.fat) || 0,
            servingSize: 1, 
            servingUnit: 'serving',
        };
        setItems(prevItems => [...prevItems, newItem]);
        setSearchQuery('');
        setSearchResults([]);
    };
    
    const handleAddBlankItem = () => {
        const blankItem = { foodName: '', calories: '', protein: '', carbohydrates: '', fat: '', servingSize: '', servingUnit: ''};
        setItems(prevItems => [...prevItems, blankItem]);
    };

    const handleRemoveItem = (indexToRemove) => {
        setItems(items.filter((_, index) => index !== indexToRemove));
    };

    const handleItemChange = (e, index) => {
        const { name, value } = e.target;
        const list = [...items];
        list[index][name] = value;
        setItems(list);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (items.length === 0) {
            alert('Please add at least one food item.');
            return;
        }
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const mealData = {
            date: formattedDate,
            mealType,
            items: items.filter(item => item.foodName && item.calories && item.servingSize),
        };

        if (mealData.items.length === 0) {
            alert('Please fill out at least one item completely.');
            return;
        }

        addMeal(mealData).then(() => {
            setItems([]);
        });
    };

    return (
        <div className="epic-logger">
            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="System Search: Find a food to add..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                />
                {isSearching && <div className="spinner"></div>}
                {searchResults.length > 0 && (
                    <motion.ul className="search-results">
                        {searchResults.slice(0, 5).map(food => (
                            <motion.li 
                                key={food.foodId} 
                                onClick={() => handleAddItemFromSearch(food)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                whileHover={{ scale: 1.02, backgroundColor: '#764be0', color: '#fff' }}
                            >
                                {food.label}
                                <span>{Math.round(food.calories)} kcal</span>
                            </motion.li>
                        ))}
                    </motion.ul>
                )}
            </div>
            
            <form onSubmit={handleSubmit} className="log-form">
                <div className="items-list-container">
                    <AnimatePresence>
                        {items.map((item, index) => (
                            <motion.div
                                key={index}
                                layout
                                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -300, transition: { duration: 0.2 } }}
                                className="food-item-row epic editable"
                            >
                                <input type="text" name="foodName" value={item.foodName} onChange={(e) => handleItemChange(e, index)} className="item-input food-name" placeholder="Food Name"/>
                                <input type="number" name="servingSize" value={item.servingSize} onChange={(e) => handleItemChange(e, index)} className="item-input" placeholder="Size" required/>
                                <input type="text" name="servingUnit" value={item.servingUnit} onChange={(e) => handleItemChange(e, index)} className="item-input" placeholder="Unit" required/>
                                <input type="number" name="calories" value={item.calories} onChange={(e) => handleItemChange(e, index)} className="item-input" placeholder="kcal" required/>
                                <input type="number" name="protein" value={item.protein} onChange={(e) => handleItemChange(e, index)} className="item-input" placeholder="P (g)" />
                                <input type="number" name="carbohydrates" value={item.carbohydrates} onChange={(e) => handleItemChange(e, index)} className="item-input" placeholder="C (g)" />
                                <input type="number" name="fat" value={item.fat} onChange={(e) => handleItemChange(e, index)} className="item-input" placeholder="F (g)" />
                                <button type="button" className="remove-item-btn epic" onClick={() => handleRemoveItem(index)}>×</button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <motion.div 
                    className="form-actions-epic"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <button type="button" className="add-custom-btn" onClick={handleAddBlankItem}>+ Add Custom Item</button>
                    {items.length > 0 && (
                        <div className="submit-actions">
                            <select className="meal-type-select" value={mealType} onChange={(e) => setMealType(e.target.value)}>
                                <option>Breakfast</option>
                                <option>Lunch</option>
                                <option>Dinner</option>
                                <option>Snacks</option>
                            </select>
                            <button type="submit" className="submit-meal-btn-epic" disabled={loading}>
                                {loading ? 'COMMITTING...' : 'COMMIT LOG'}
                            </button>
                        </div>
                    )}
                </motion.div>
            </form>
        </div>
    );
};

export default NutritionLogger;