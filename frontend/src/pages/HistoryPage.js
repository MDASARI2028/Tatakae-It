// frontend/src/pages/HistoryPage.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import WorkoutHistory from '../components/WorkoutHistory';
import BodyMetricHistory from '../components/BodyMetricHistory';
import EditWorkoutModal from '../components/EditWorkoutModal';
import './HistoryPage.css';

const HistoryPage = () => {
    const { token } = useContext(AuthContext);
    const [metrics, setMetrics] = useState([]);
    const [filterDate, setFilterDate] = useState('');
    
    // State for the modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState(null);

    const handleOpenEditModal = (workout) => {
        setEditingWorkout(workout);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setEditingWorkout(null);
        setIsModalOpen(false);
    };

    useEffect(() => {
        const fetchMetrics = async () => {
            if (!token) return;
            try {
                const response = await fetch('/api/metrics', {
                    headers: { 'x-auth-token': token },
                });
                if (response.ok) {
                    const data = await response.json();
                    setMetrics(data);
                }
            } catch (error) {
                console.error('Failed to fetch metrics:', error);
            }
        };
        fetchMetrics();
    }, [token]);

    const displayedMetrics = filterDate 
        ? metrics.filter(m => new Date(m.date).toISOString().slice(0, 10) === filterDate)
        : metrics.slice(0, 1);

    return (
        <div>
            <div className="filter-controls">
                <label htmlFor="date-filter">Filter by Date:</label>
                <input 
                    type="date" 
                    id="date-filter" 
                    className="form-input"
                    value={filterDate} 
                    onChange={e => setFilterDate(e.target.value)} 
                />
                <button className="system-button btn-secondary" onClick={() => setFilterDate('')}>Clear</button>
            </div>
            <div className="history-grid-container">
                <div className="history-section">
                    <h3>Workout History</h3>
                    <WorkoutHistory 
                        filterDate={filterDate} 
                        onEdit={handleOpenEditModal}
                    />
                </div>
                <div className="history-section">
                    <h3>Body Metric History</h3>
                    <BodyMetricHistory metrics={displayedMetrics} />
                </div>
            </div>

            {isModalOpen && (
                <EditWorkoutModal 
                    workout={editingWorkout} 
                    onClose={handleCloseModal} 
                />
            )}
        </div>
    );
};

export default HistoryPage;