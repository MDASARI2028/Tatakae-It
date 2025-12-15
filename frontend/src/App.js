import React, { useContext, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { WorkoutProvider } from './context/WorkoutContext';
import { TemplateProvider } from './context/TemplateContext';
import { NutritionProvider } from './context/NutritionContext';
import { RecipeProvider } from './context/RecipeContext';
import { LevelUpProvider } from './context/LevelUpContext';

// --- Routing Configuration ---
import routes from './routes.config';
import PrivateRoute from './routing/PrivateRoute';
import PublicRoute from './routing/PublicRoute';

// --- Always-loaded components ---
import Layout from './components/Layout';
import LoadingFallback from './components/LoadingFallback';

// --- Lazy-loaded pages for better performance ---
const Dashboard = lazy(() => import('./components/Dashboard'));
const FitnessPage = lazy(() => import('./pages/FitnessPage'));
const NutritionPage = lazy(() => import('./pages/nutrition/NutritionPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const WorkoutLoggerPage = lazy(() => import('./pages/WorkoutLoggerPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const BodyMetricLoggerPage = lazy(() => import('./pages/BodyMetricLoggerPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const XPHistoryPage = lazy(() => import('./pages/XPHistoryPage'));
const GuidePage = lazy(() => import('./pages/GuidePage'));

// Component mapping for lazy loading
const componentMap = {
    Dashboard,
    FitnessPage,
    NutritionPage,
    AuthPage,
    WorkoutLoggerPage,
    HistoryPage,
    BodyMetricLoggerPage,
    ProgressPage,
    XPHistoryPage,
    GuidePage
};

const AppRoutes = () => {
    const { loading } = useContext(AuthContext);

    if (loading) {
        return <LoadingFallback />;
    }

    // Separate public and protected routes
    const publicRoutes = routes.filter(route => route.isPublic);
    const protectedRoutes = routes.filter(route => route.isProtected);

    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                {/* Public routes */}
                {publicRoutes.map((route) => {
                    const Component = componentMap[route.component];
                    return (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={
                                <PublicRoute>
                                    <Component />
                                </PublicRoute>
                            }
                        />
                    );
                })}

                {/* Protected routes with Layout */}
                <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                    {protectedRoutes.map((route) => {
                        const Component = componentMap[route.component];
                        return (
                            <Route
                                key={route.path}
                                path={route.path === '/' ? '' : route.path}
                                element={<Component />}
                            />
                        );
                    })}
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Suspense>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <LevelUpProvider>
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
                </LevelUpProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;