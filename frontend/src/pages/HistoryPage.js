// frontend/src/pages/HistoryPage.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import WorkoutHistory from '../components/WorkoutHistory';
import BodyMetricHistory from '../components/BodyMetricHistory';
import EditWorkoutModal from '../components/EditWorkoutModal';
import { ToastContainer } from '../components/Toast';
import useToast from '../hooks/useToast';
import BackButton from '../components/common/BackButton';
import './HistoryPage.css';

const HistoryPage = () => {
    const { token } = useContext(AuthContext);
    const [metrics, setMetrics] = useState([]);
    const [filterDate, setFilterDate] = useState('');
    const { toasts, addToast, removeToast } = useToast();

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
                const response = await fetch('/api/metrics?limit=100', {
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

    // Helper function to normalize date to YYYY-MM-DD format
    const normalizeDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const displayedMetrics = filterDate
        ? metrics.filter(m => normalizeDate(m.date) === filterDate)
        : metrics.slice(0, 1);

    return (
        <div>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <div className="history-page-header" style={{ marginBottom: '1rem' }}>
                <BackButton />
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
                        showToast={addToast}
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
                    showToast={addToast}
                />
            )}
        </div>
    );
};

export default HistoryPage;