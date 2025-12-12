import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNutrition } from '../../context/NutritionContext';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { FaUtensils, FaPlus, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './NutritionLogger.css';

const NutritionLogger = ({ selectedDate }) => {
    const { addMeal, loading } = useNutrition();
    const { token } = useContext(AuthContext);

    const [items, setItems] = useState([]);
    const [mealType, setMealType] = useState('Breakfast');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // FOOD SEARCH TEMPORARILY DISABLED - Database not working
    // useEffect(() => {
    //     if (!token || searchQuery.length < 2) {
    //         console.log('[NUTRITION LOGGER] Search blocked - Token:', token ? 'present' : 'missing', 'Query length:', searchQuery.length);
    //         setSearchResults([]);
    //         return;
    //     }
    //     const delayDebounce = setTimeout(async () => {
    //         setIsSearching(true);
    //         try {
    //             console.log('[NUTRITION LOGGER] Searching for:', searchQuery);
    //             console.log('[NUTRITION LOGGER] Token preview:', token.substring(0, 20) + '...');
    //             const config = { headers: { 'x-auth-token': token } };
    //             console.log('[NUTRITION LOGGER] Request config:', config);
    //             const res = await api.get(`/api/food-search?query=${encodeURIComponent(searchQuery)}`, config);
    //             console.log('Food search results:', res.data);
    //             setSearchResults(Array.isArray(res.data) ? res.data : []);
    //         } catch (error) {
    //             console.error('[NUTRITION LOGGER] Search error status:', error.response?.status);
    //             console.error('[NUTRITION LOGGER] Search error data:', error.response?.data);
    //             console.error('[NUTRITION LOGGER] Search error message:', error.message);
    //             setSearchResults([]);
    //         }
    //         setIsSearching(false);
    //     }, 380);
    //     return () => clearTimeout(delayDebounce);
    // }, [searchQuery, token]);

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
        const blankItem = { foodName: '', calories: '', protein: '', carbohydrates: '', fat: '', servingSize: '', servingUnit: '' };
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

    const totals = useMemo(() => {
        return items.reduce((acc, it) => {
            const c = Number(it.calories) || 0;
            acc.calories += c;
            acc.protein += Number(it.protein) || 0;
            acc.carbs += Number(it.carbohydrates) || 0;
            acc.fat += Number(it.fat) || 0;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }, [items]);

    // Custom item modal state
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customForm, setCustomForm] = useState({ foodName: '', servingSize: 1, servingUnit: 'serving', calories: '', protein: '', carbohydrates: '', fat: '' });

    const openCustomModal = () => setShowCustomModal(true);
    const closeCustomModal = () => {
        setShowCustomModal(false);
        setCustomForm({ foodName: '', servingSize: 1, servingUnit: 'serving', calories: '', protein: '', carbohydrates: '', fat: '' });
    };

    const handleCustomChange = (e) => {
        const { name, value } = e.target;
        setCustomForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        if (!customForm.foodName || !customForm.calories) return;
        const newItem = {
            foodName: customForm.foodName,
            servingSize: Number(customForm.servingSize) || 1,
            servingUnit: customForm.servingUnit || 'serving',
            calories: Number(customForm.calories) || 0,
            protein: Number(customForm.protein) || 0,
            carbohydrates: Number(customForm.carbohydrates) || 0,
            fat: Number(customForm.fat) || 0,
        };
        setItems(prev => [...prev, newItem]);
        closeCustomModal();
    };

    return (
        <div className="nutrition-logger-shell">
            <motion.div className="logger-left" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
                <div className="logger-header">
                    <div className="title">
                        <FaUtensils className="food-ico" />
                        <div>
                            <h3>Log Meal</h3>
                            <p className="hint">Create custom items to track your nutrition.</p>
                        </div>
                    </div>

                    <div className="mini-controls">
                        <div className="date-nav">
                            <button className="icon-btn" onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); /* parent handles date change elsewhere */ }}><FaChevronLeft /></button>
                            <div className="date-label">{selectedDate.toDateString()}</div>
                            <button className="icon-btn" onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); }}><FaChevronRight /></button>
                        </div>
                        <select className="meal-type-select" value={mealType} onChange={(e) => setMealType(e.target.value)}>
                            <option>Breakfast</option>
                            <option>Lunch</option>
                            <option>Dinner</option>
                            <option>Snacks</option>
                        </select>
                    </div>
                </div>

                {/* FOOD SEARCH TEMPORARILY DISABLED */}
                <div className="search-box" style={{ display: 'none' }}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search foods (min 2 chars)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoComplete="off"
                        disabled
                    />
                    {isSearching && <div className="spinner small"></div>}
                    {searchResults.length > 0 && (
                        <motion.ul className="search-results" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                            {searchResults.slice(0, 6).map((food) => (
                                <motion.li key={food.foodId || food.label} onClick={() => handleAddItemFromSearch(food)} whileHover={{ scale: 1.02 }}>
                                    <div className="sr-left">
                                        <div className="sr-title">{food.label}</div>
                                        <div className="sr-sub">{food.category || ''}</div>
                                    </div>
                                    <div className="sr-right">{Math.round(food.calories)} kcal</div>
                                </motion.li>
                            ))}
                        </motion.ul>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="log-form">
                    <div className="items-list-container">
                        <AnimatePresence>
                            {items.map((item, index) => (
                                <motion.div key={index} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="food-item-card">
                                    <div className="left-col">
                                        <input type="text" name="foodName" value={item.foodName} onChange={(e) => handleItemChange(e, index)} className="item-input food-name" placeholder="Food name" />
                                        <div className="meta-row">
                                            <input type="number" name="servingSize" value={item.servingSize} onChange={(e) => handleItemChange(e, index)} className="item-input tiny" placeholder="Size" />
                                            <input type="text" name="servingUnit" value={item.servingUnit} onChange={(e) => handleItemChange(e, index)} className="item-input tiny" placeholder="Unit" />
                                        </div>
                                    </div>
                                    <div className="right-col">
                                        <input type="number" name="calories" value={item.calories} onChange={(e) => handleItemChange(e, index)} className="item-input" placeholder="kcal" />
                                        <div className="macro-row">
                                            <input type="number" name="protein" value={item.protein} onChange={(e) => handleItemChange(e, index)} className="item-input tiny" placeholder="P" />
                                            <input type="number" name="carbohydrates" value={item.carbohydrates} onChange={(e) => handleItemChange(e, index)} className="item-input tiny" placeholder="C" />
                                            <input type="number" name="fat" value={item.fat} onChange={(e) => handleItemChange(e, index)} className="item-input tiny" placeholder="F" />
                                        </div>
                                    </div>
                                    <button type="button" className="remove-item-btn" onClick={() => handleRemoveItem(index)}><FaTrash /></button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="add-custom-btn" onClick={openCustomModal}><FaPlus /> Add Custom</button>
                        <div className="submit-block">
                            <div className="totals">
                                <div><strong>{totals.calories}</strong><span> kcal</span></div>
                                <div><strong>{totals.protein}</strong><span> g P</span></div>
                                <div><strong>{totals.carbs}</strong><span> g C</span></div>
                                <div><strong>{totals.fat}</strong><span> g F</span></div>
                            </div>
                            <button type="submit" className="submit-meal-btn" disabled={loading}>{loading ? 'Logging...' : 'Commit Meal'}</button>
                        </div>
                    </div>
                </form>
            </motion.div>

            <motion.aside className="logger-preview" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
                <div className="preview-card">
                    <h4>Meal Preview</h4>
                    <div className="preview-list">
                        {items.length === 0 && <div className="empty">No items yet — add from search or create one.</div>}
                        {items.map((it, i) => (
                            <div className="preview-row" key={i}>
                                <div className="p-name">{it.foodName || '—'}</div>
                                <div className="p-meta">{(Number(it.calories) || 0)} kcal</div>
                            </div>
                        ))}
                    </div>
                    <div className="preview-footer">
                        <div className="p-total">Total: <strong>{totals.calories} kcal</strong></div>
                        <div className="p-action">{items.length > 0 ? <button className="ghost">Ready</button> : null}</div>
                    </div>
                </div>
            </motion.aside>
            <AnimatePresence>
                {showCustomModal && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.form className="custom-modal" initial={{ scale: 0.96, y: -8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98 }} onSubmit={handleCustomSubmit}>
                            <h4>Create Custom Item</h4>
                            <div className="modal-row">
                                <input name="foodName" value={customForm.foodName} onChange={handleCustomChange} placeholder="Food name" required />
                                <input name="calories" value={customForm.calories} onChange={handleCustomChange} placeholder="Calories" required />
                            </div>
                            <div className="modal-row">
                                <input name="servingSize" value={customForm.servingSize} onChange={handleCustomChange} placeholder="Serving size" />
                                <input name="servingUnit" value={customForm.servingUnit} onChange={handleCustomChange} placeholder="Unit" />
                            </div>
                            <div className="modal-row">
                                <input name="protein" value={customForm.protein} onChange={handleCustomChange} placeholder="Protein (g)" />
                                <input name="carbohydrates" value={customForm.carbohydrates} onChange={handleCustomChange} placeholder="Carbs (g)" />
                                <input name="fat" value={customForm.fat} onChange={handleCustomChange} placeholder="Fat (g)" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn ghost" onClick={closeCustomModal}>Cancel</button>
                                <button type="submit" className="btn primary">Add Item</button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NutritionLogger;