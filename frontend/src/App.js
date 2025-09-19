import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { WorkoutProvider } from './context/WorkoutContext';
import { TemplateProvider } from './context/TemplateContext';
import { NutritionProvider } from './context/NutritionContext';
import { RecipeProvider } from './context/RecipeContext';

// --- Component & Page Imports ---
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import FitnessPage from './pages/FitnessPage';
import NutritionPage from './pages/nutrition/NutritionPage';
import AuthPage from './pages/AuthPage';
// Add any other page imports you have here

// --- Routing Imports ---
import PrivateRoute from './routing/PrivateRoute';
import PublicRoute from './routing/PublicRoute';

const AppRoutes = () => {
    const { loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading System...</div>;
    }

    return (
        <Routes>
            <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><AuthPage /></PublicRoute>} />

            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="fitness" element={<FitnessPage />} />
                <Route path="nutrition" element={<NutritionPage />} />
                {/* Ensure all your other page routes are nested here if they use the Layout */}
            </Route>
            
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};


function App() {
    return (
        // ✅ CORRECTED PROVIDER STRUCTURE
        <Router>
            <AuthProvider>
                <WorkoutProvider>
                    <TemplateProvider>
                        <NutritionProvider>
                            <RecipeProvider>
                                <div className="site-wrapper">
                                    <AppRoutes />
                                </div>
                            </RecipeProvider>
                        </NutritionProvider>
                    </TemplateProvider>
                </WorkoutProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;