import React, { useState, useMemo, useContext, useEffect } from 'react';
import { useNutrition } from '../../context/NutritionContext';
import { useLevelUp } from '../../context/LevelUpContext';
import { RecipeContext } from '../../context/RecipeContext'; // Import RecipeContext
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUtensils, FaPlus, FaTimes, FaSearch, FaEgg, FaBreadSlice, FaLeaf, FaAppleAlt, FaHamburger, FaFish, FaCarrot, FaPizzaSlice, FaGem, FaWater, FaDotCircle, FaBookOpen } from 'react-icons/fa';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import './NutritionLogger.css';

// Register ChartJS components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Helper to guess icon
const getFoodIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('egg')) return <FaEgg />;
    if (n.includes('bread') || n.includes('toast')) return <FaBreadSlice />;
    if (n.includes('avocado') || n.includes('salad') || n.includes('veg')) return <FaLeaf />;
    if (n.includes('fruit') || n.includes('apple') || n.includes('banana')) return <FaAppleAlt />;
    if (n.includes('burger') || n.includes('meat') || n.includes('beef')) return <FaHamburger />;
    if (n.includes('fish') || n.includes('salmon') || n.includes('tuna')) return <FaFish />;
    if (n.includes('pizza')) return <FaPizzaSlice />;
    if (n.includes('carrot') || n.includes('root')) return <FaCarrot />;
    return <FaUtensils />;
};

const NutritionLogger = ({ selectedDate }) => {
    const { addMeal, loading, getRecentItems, nutritionLogs } = useNutrition();
    const { recipes, getRecipes } = useContext(RecipeContext); // Destructure RecipeContext
    const { calculateDailyXP } = useLevelUp();
    const { token } = useContext(AuthContext);

    const [items, setItems] = useState([]);
    const [recentItems, setRecentItems] = useState([]);
    const [mealType, setMealType] = useState('Breakfast');
    const [customForm, setCustomForm] = useState({ foodName: '', calories: '', protein: '', carbohydrates: '', fat: '' });
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [visibleRecentCount, setVisibleRecentCount] = useState(5); // Pagination for recent items

    // NEW: State for Modal Tabs
    const [modalTab, setModalTab] = useState('new'); // 'new' | 'history' | 'recipes'
    const [historySearch, setHistorySearch] = useState('');

    const handleSelectHistoryItem = (item) => {
        setCustomForm({
            foodName: item.foodName,
            calories: item.calories,
            protein: item.protein,
            carbohydrates: item.carbohydrates,
            fat: item.fat,
        });
        setModalTab('new'); // Switch back to form to confirm/edit
    };

    const handleLoadRecipe = (recipe) => {
        const recipeItems = recipe.items.map(item => ({
            tempId: Date.now() + Math.random(),
            foodName: item.foodName,
            calories: Number(item.calories) || 0,
            protein: Number(item.protein) || 0,
            carbohydrates: Number(item.carbohydrates) || 0,
            fat: Number(item.fat) || 0,
            servingSize: Number(item.servingSize) || 1,
            servingUnit: item.servingUnit || 'serving',
            icon: getFoodIcon(item.foodName),
        }));
        setItems(prev => [...prev, ...recipeItems]);
        closeCustomModal();
    };

    // Fetch recent items AND recipes on mount
    useEffect(() => {
        let isMounted = true;

        if (getRecentItems) {
            getRecentItems().then(data => {
                if (isMounted && data) setRecentItems(data);
            });
        }

        if (getRecipes) {
            getRecipes(); // Recipes populate via context state
        }

        return () => { isMounted = false; };
    }, [getRecentItems, getRecipes]);

    const handleAddRecent = (item) => {
        // Prevent duplicates in current list? Optional.
        // if (items.find(i => i.tempId === item._id)) return; // _id might be food name group id, let's just push new

        const newItem = {
            tempId: Date.now() + Math.random(), // Unique ID for frontend list
            foodName: item.foodName,
            calories: Number(item.calories) || 0,
            protein: Number(item.protein) || 0,
            carbohydrates: Number(item.carbohydrates) || 0,
            fat: Number(item.fat) || 0,
            servingSize: Number(item.servingSize) || 1,
            servingUnit: item.servingUnit || 'serving',
            icon: getFoodIcon(item.foodName),
        };
        setItems(prev => [...prev, newItem]);
    };

    const handleRemoveItem = (index) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const openCustomModal = () => setShowCustomModal(true);
    const closeCustomModal = () => setShowCustomModal(false);

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        const newItem = {
            tempId: Date.now(),
            foodName: customForm.foodName,
            calories: Number(customForm.calories) || 0,
            protein: Number(customForm.protein) || 0,
            carbohydrates: Number(customForm.carbohydrates) || 0,
            fat: Number(customForm.fat) || 0,
            servingSize: 1,
            servingUnit: 'portion',
            icon: <FaUtensils />,
        };
        setItems(prev => [...prev, newItem]);
        setCustomForm({ foodName: '', calories: '', protein: '', carbohydrates: '', fat: '' });
        closeCustomModal();
    };

    // Calculate totals: Daily Logged + Current Staged Items
    const totals = useMemo(() => {
        // 1. Sum up already logged meals from context
        const loggedTotals = nutritionLogs.reduce((acc, log) => {
            // Each log has an array of items
            if (!log.items) return acc;
            log.items.forEach(it => {
                acc.calories += Number(it.calories) || 0;
                acc.protein += Number(it.protein) || 0;
                acc.carbohydrates += Number(it.carbohydrates) || 0;
                acc.fat += Number(it.fat) || 0;
            });
            return acc;
        }, { calories: 0, protein: 0, carbohydrates: 0, fat: 0 });

        // 2. Add current staged items
        return items.reduce((acc, it) => ({
            calories: acc.calories + (Number(it.calories) || 0),
            protein: acc.protein + (Number(it.protein) || 0),
            carbohydrates: acc.carbohydrates + (Number(it.carbohydrates) || 0),
            fat: acc.fat + (Number(it.fat) || 0)
        }), loggedTotals);
    }, [items, nutritionLogs]);

    const handleSubmit = () => {
        if (items.length === 0) return;

        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        const mealData = {
            date: formattedDate,
            mealType,
            items: items.map(i => ({
                foodName: i.foodName,
                calories: i.calories,
                protein: i.protein,
                carbohydrates: i.carbohydrates,
                fat: i.fat,
                servingSize: i.servingSize,
                servingUnit: i.servingUnit
            }))
        };

        addMeal(mealData).then(() => {
            setItems([]);
            if (calculateDailyXP) calculateDailyXP(true);
        });
    };

    // Chart Data
    const chartData = {
        labels: ['PROTEIN', 'CARBS', 'FATS'],
        datasets: [
            {
                label: 'Macro Balance',
                data: [totals.protein, totals.carbohydrates, totals.fat],
                backgroundColor: 'rgba(21, 53, 212, 0.2)', // Deep Blue transparent
                borderColor: '#1535D4',
                borderWidth: 2,
                pointBackgroundColor: '#06b6d4', // Cyan dots
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#06b6d4',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                pointLabels: {
                    color: '#94a3b8',
                    font: { size: 10, weight: '700' }
                },
                ticks: { display: false, backdropColor: 'transparent' }
            }
        },
        plugins: {
            legend: { display: false }
        }
    };

    return (
        <div className="nutrition-logger-shell">
            {/* LEFT PANEL */}
            <motion.div className="logger-left" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                {/* Header */}
                <div className="logger-header">
                    <div className="title-group">
                        <div className="food-icon-sq"><FaUtensils /></div>
                        <div>
                            <h3>Log Meal</h3>
                            <p>Search and add items to your log</p>
                        </div>
                    </div>

                    {/* Meal Type Toggle */}
                    <div className="meal-type-toggle">
                        {['Breakfast', 'Lunch', 'Dinner'].map(t => (
                            <button
                                key={t}
                                className={`type-btn ${mealType === t ? 'active' : ''}`}
                                onClick={() => setMealType(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search */}
                <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        className="search-input-modern"
                        placeholder="Search foods, brands or scan barcode..."
                        readOnly // Mock for now
                        onClick={() => alert("Search is currently disabled. Use 'Add Custom' or suggested items.")}
                    />
                </div>

                {/* Items List (Mixed Recent + Added) */}
                <div className="section-label">Recent Items</div>
                <div className="items-scroll-area">
                    {/* Show recent items from backend */}
                    {recentItems.length === 0 && items.length === 0 && (
                        <div className="text-sm text-slate-500 text-center py-4 italic">
                            No recent history found. Add a custom item to get started.
                        </div>
                    )}

                    {recentItems.slice(0, visibleRecentCount).map((item, idx) => {
                        // Optimization: in a real app, use IDs. Here we use name similarity or index
                        return (
                            <div key={`recent-${item._id || idx}`} className="food-item-modern" onClick={() => handleAddRecent(item)}>
                                <div className="item-icon-circle">{getFoodIcon(item.foodName)}</div>
                                <div className="item-info">
                                    <span className="item-name">{item.foodName}</span>
                                    <span className="item-desc">{item.calories} kcal • {item.servingSize} {item.servingUnit}</span>
                                </div>
                                <div className="item-actions">
                                    <button className="text-xs font-bold text-slate-500 hover:text-white transition-colors">
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {recentItems.length > visibleRecentCount && (
                        <button
                            onClick={() => setVisibleRecentCount(prev => prev + 5)}
                            className="w-full py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-white/10 mb-4"
                        >
                            SHOW {Math.min(5, recentItems.length - visibleRecentCount)} MORE
                        </button>
                    )}

                    {/* SEPARATE 'ADDED' SECTION for clarity if items > 0 */}
                    {items.length > 0 && (
                        <>
                            <div className="section-label mt-4" style={{ color: '#06b6d4' }}>Ready to Commit ({items.length})</div>
                            {items.map((item, idx) => (
                                <div key={item.tempId || idx} className="food-item-modern" style={{ borderColor: '#06b6d4' }}>
                                    <div className="item-icon-circle" style={{ color: '#06b6d4' }}>{item.icon || <FaUtensils />}</div>
                                    <div className="item-info">
                                        <span className="item-name">{item.foodName}</span>
                                        <span className="item-desc" style={{ color: '#06b6d4' }}>{item.calories} kcal • Added</span>
                                    </div>
                                    <div className="item-actions">
                                        <button
                                            className="btn-remove-x"
                                            onClick={() => handleRemoveItem(idx)}
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="logger-footer">
                    <button className="btn-outline" onClick={openCustomModal}>
                        <FaPlus /> Add Custom
                    </button>

                    <div className="macro-mini-summary">
                        <div className="macro-item kcal">
                            <span className="label">KCAL</span>
                            <span className="val">{totals.calories}</span>
                        </div>
                        <div className="macro-item p">
                            <span className="label">P</span>
                            <span className="val">{totals.protein}<small>g</small></span>
                        </div>
                        <div className="macro-item c">
                            <span className="label">C</span>
                            <span className="val">{totals.carbohydrates}<small>g</small></span>
                        </div>
                        <div className="macro-item f">
                            <span className="label">F</span>
                            <span className="val">{totals.fat}<small>g</small></span>
                        </div>
                    </div>

                    <button
                        className="btn-commit"
                        onClick={handleSubmit}
                        disabled={loading || items.length === 0}
                        style={{ opacity: items.length === 0 ? 0.5 : 1 }}
                    >
                        {loading ? '...' : 'Commit Meal'}
                    </button>
                </div>

                {/* Custom Modal with Sci-Fi UI */}
                <AnimatePresence>
                    {showCustomModal && (
                        <motion.div
                            className="nl-modal-overlay"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="nl-modal-window"
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                {/* Header */}
                                <div className="nl-modal-header">
                                    <h3>ADD NUTRITION</h3>
                                    <div className="nl-tabs-container">
                                        {['new', 'history', 'recipes'].map(tab => (
                                            <button
                                                key={tab}
                                                className={`nl-tab-btn ${modalTab === tab ? 'active' : ''}`}
                                                onClick={() => setModalTab(tab)}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="nl-modal-body">
                                    {modalTab === 'new' ? (
                                        /* CREATE NEW FORM */
                                        <div className="nl-form-section">
                                            <input
                                                className="nl-input-modern full-width"
                                                placeholder="Food Name (e.g., Grilled Chicken)"
                                                value={customForm.foodName}
                                                onChange={e => setCustomForm({ ...customForm, foodName: e.target.value })}
                                                autoFocus
                                            />
                                            <div className="nl-macro-grid">
                                                <div className="nl-input-wrapper">
                                                    <input
                                                        type="number"
                                                        className="nl-input-modern"
                                                        placeholder="0"
                                                        value={customForm.calories}
                                                        onChange={e => setCustomForm({ ...customForm, calories: e.target.value })}
                                                    />
                                                    <span className="nl-input-label">KCAL</span>
                                                </div>
                                                <div className="nl-input-wrapper">
                                                    <input
                                                        type="number"
                                                        className="nl-input-modern"
                                                        placeholder="0"
                                                        value={customForm.protein}
                                                        onChange={e => setCustomForm({ ...customForm, protein: e.target.value })}
                                                    />
                                                    <span className="nl-input-label">PRO</span>
                                                </div>
                                                <div className="nl-input-wrapper">
                                                    <input
                                                        type="number"
                                                        className="nl-input-modern"
                                                        placeholder="0"
                                                        value={customForm.carbohydrates}
                                                        onChange={e => setCustomForm({ ...customForm, carbohydrates: e.target.value })}
                                                    />
                                                    <span className="nl-input-label">CARB</span>
                                                </div>
                                                <div className="nl-input-wrapper">
                                                    <input
                                                        type="number"
                                                        className="nl-input-modern"
                                                        placeholder="0"
                                                        value={customForm.fat}
                                                        onChange={e => setCustomForm({ ...customForm, fat: e.target.value })}
                                                    />
                                                    <span className="nl-input-label">FAT</span>
                                                </div>
                                            </div>
                                            <div className="nl-modal-actions">
                                                <button className="nl-btn-cancel" onClick={closeCustomModal}>CANCEL</button>
                                                <button className="nl-btn-confirm" onClick={handleCustomSubmit}>ADD TO LOG</button>
                                            </div>
                                        </div>
                                    ) : modalTab === 'history' ? (
                                        /* HISTORY LIST */
                                        <div className="nl-list-section">
                                            <div className="nl-search-bar-mini">
                                                <FaSearch />
                                                <input
                                                    placeholder="Search history data..."
                                                    value={historySearch}
                                                    onChange={e => setHistorySearch(e.target.value)}
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="nl-scroll-box">
                                                {recentItems.length === 0 && <div className="nl-empty-msg">No history data found.</div>}
                                                {recentItems
                                                    .filter(item => item.foodName.toLowerCase().includes(historySearch.toLowerCase()))
                                                    .map((item, idx) => (
                                                        <div
                                                            key={`hist-${idx}`}
                                                            className="nl-list-item"
                                                            onClick={() => handleSelectHistoryItem(item)}
                                                        >
                                                            <div className="nl-item-icon">{getFoodIcon(item.foodName)}</div>
                                                            <div className="nl-item-details">
                                                                <div className="nl-item-name">{item.foodName}</div>
                                                                <div className="nl-item-meta">{item.calories} kcal • {item.protein}p {item.carbohydrates}c {item.fat}f</div>
                                                            </div>
                                                            <FaPlus className="nl-item-add" />
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ) : (
                                        /* RECIPES LIST */
                                        <div className="nl-list-section">
                                            <div className="nl-section-title">SAVED RECIPES</div>
                                            <div className="nl-scroll-box">
                                                {(!recipes || recipes.length === 0) && <div className="nl-empty-msg">No recipes available.</div>}
                                                {recipes && recipes.map((recipe) => {
                                                    const rCals = recipe.items.reduce((s, i) => s + (i.calories || 0), 0);
                                                    const rPro = recipe.items.reduce((s, i) => s + (i.protein || 0), 0);
                                                    return (
                                                        <div
                                                            key={recipe._id}
                                                            className="nl-list-item blueprint"
                                                            onClick={() => handleLoadRecipe(recipe)}
                                                        >
                                                            <div className="nl-item-icon blueprint"><FaBookOpen /></div>
                                                            <div className="nl-item-details">
                                                                <div className="nl-item-name">{recipe.name}</div>
                                                                <div className="nl-item-meta">{recipe.items.length} Items • {rCals} kcal</div>
                                                            </div>
                                                            <span className="nl-badge-load">LOAD</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* RIGHT PANEL: DAILY OVERVIEW */}
            <motion.div className="logger-right" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="elemental-container">
                    {/* Header */}
                    <div className="elemental-header">
                        <h2>Daily Overview</h2>
                        <span className="phase-badge">Today's Progress</span>
                    </div>

                    {/* 3 Macro Cards */}
                    <div className="elemental-grid">
                        <div className="elemental-card protein">
                            <div className="icon-glow-container">
                                <div className="glow-backdrop blue"></div>
                                <FaGem className="macro-icon blue" />
                            </div>
                            <span className="macro-label">PROTEIN</span>
                            <span className="macro-val">{totals.protein}g</span>
                        </div>
                        <div className="elemental-card carbs">
                            <div className="icon-glow-container">
                                <div className="glow-backdrop green"></div>
                                <FaWater className="macro-icon green" />
                            </div>
                            <span className="macro-label">CARBS</span>
                            <span className="macro-val">{totals.carbohydrates}g</span>
                        </div>
                        <div className="elemental-card fats">
                            <div className="icon-glow-container">
                                <div className="glow-backdrop orange"></div>
                                <FaDotCircle className="macro-icon orange" />
                            </div>
                            <span className="macro-label">FATS</span>
                            <span className="macro-val">{totals.fat}g</span>
                        </div>
                    </div>

                    {/* Energy Balance (Formerly Synergy Chamber) */}
                    <div className="synergy-chamber">
                        <div className="sc-header">ENERGY BALANCE</div>

                        <div className="sc-center">
                            {/* Circular Progress */}
                            <div className="circular-gauge">
                                <svg viewBox="0 0 100 100" className="gauge-svg">
                                    {/* Track */}
                                    <circle cx="50" cy="50" r="45" className="gauge-track" />
                                    {/* Progress - 2500 kcal target approx */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        className="gauge-fill"
                                        strokeDasharray="283"
                                        strokeDashoffset={283 - (Math.min(totals.calories / 2500, 1) * 283)}
                                        transform="rotate(-90 50 50)"
                                    />
                                </svg>
                                <div className="gauge-content">
                                    <span className="gauge-val">{totals.calories}</span>
                                    <span className="gauge-unit">KCAL</span>
                                </div>
                            </div>
                        </div>

                        <div className="sc-bars">
                            {/* Protein Ratio */}
                            <div className="sc-bar-group">
                                <div className="sc-bar-label">PROTEIN RATIO</div>
                                <div className="sc-bar-track">
                                    <div
                                        className="sc-bar-fill blue"
                                        style={{ width: `${Math.min((totals.protein / (totals.protein + totals.carbohydrates + totals.fat || 1)) * 100 * 2, 100)}%` }} // Arbitrary scaling for visual
                                    ></div>
                                </div>
                            </div>
                            {/* Calorie Density */}
                            <div className="sc-bar-group">
                                <div className="sc-bar-label">CALORIE DENSITY</div>
                                <div className="sc-bar-track">
                                    <div
                                        className="sc-bar-fill orange"
                                        style={{ width: `${Math.min((totals.calories / 1000) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Staged Items List */}
                    <div className="infusion-list">
                        {items.length === 0 ? (
                            <div className="empty-infusion">Select items to build your meal...</div>
                        ) : (
                            items.map((item, idx) => (
                                <motion.div
                                    className="infusion-item"
                                    key={item.tempId || idx}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="ii-left">
                                        <div className={`ii-dot ${getDotColor(item)}`}></div>
                                        <span className="ii-name">{item.servingSize > 1 ? `${item.servingSize}x ` : ''}{item.foodName}</span>
                                    </div>
                                    <div className="ii-right">{item.calories} kcal</div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// Helper for dot color based on dominant macro
const getDotColor = (item) => {
    if (item.protein > item.carbohydrates && item.protein > item.fat) return 'blue';
    if (item.carbohydrates > item.protein && item.carbohydrates > item.fat) return 'green';
    return 'orange'; // Fat or balanced
};

const MeterBox = ({ label, color, percent }) => (
    <div className="meter-box">
        <span className="meter-label" style={{ color: color }}>{label}</span>
        <div className="meter-bar">
            <div
                className="meter-fill"
                style={{ width: `${percent}%`, background: color }}
            ></div>
        </div>
    </div>
);

export default NutritionLogger;