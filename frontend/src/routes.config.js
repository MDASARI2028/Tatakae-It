// frontend/src/routes.config.js
// Centralized route configuration for the entire application

const routes = [
    // Public routes
    {
        path: '/login',
        component: 'AuthPage',
        isPublic: true,
        title: 'Login - Tatakai IT'
    },
    {
        path: '/register',
        component: 'AuthPage',
        isPublic: true,
        title: 'Register - Tatakai IT'
    },

    // Protected routes (require authentication)
    {
        path: '/',
        component: 'Dashboard',
        isProtected: true,
        title: 'Dashboard - Tatakai IT',
        exact: true
    },
    {
        path: '/dashboard',
        component: 'Dashboard',
        isProtected: true,
        title: 'Dashboard - Tatakai IT'
    },
    {
        path: '/fitness',
        component: 'FitnessPage',
        isProtected: true,
        title: 'Fitness - Tatakai IT'
    },
    {
        path: '/log-workout',
        component: 'WorkoutLoggerPage',
        isProtected: true,
        title: 'Log Workout - Tatakai IT'
    },
    {
        path: '/fitness/workout-logger',
        component: 'WorkoutLoggerPage',
        isProtected: true,
        title: 'Log Workout - Tatakai IT'
    },
    {
        path: '/fitness/history',
        component: 'HistoryPage',
        isProtected: true,
        title: 'Workout History - Tatakai IT'
    },
    {
        path: '/fitness/metric-logger',
        component: 'BodyMetricLoggerPage',
        isProtected: true,
        title: 'Body Metrics - Tatakai IT'
    },
    {
        path: '/fitness/progress',
        component: 'ProgressPage',
        isProtected: true,
        title: 'Progress - Tatakai IT'
    },
    {
        path: '/nutrition',
        component: 'NutritionPage',
        isProtected: true,
        title: 'Nutrition - Tatakai IT'
    },
    {
        path: '/xp-history',
        component: 'XPHistoryPage',
        isProtected: true,
        title: 'XP History - Tatakai IT'
    },
    {
        path: '/guide',
        component: 'GuidePage',
        isProtected: true,
        title: 'The System Guide - Tatakai IT'
    }
];

export default routes;
