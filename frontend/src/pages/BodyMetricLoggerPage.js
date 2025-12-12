// frontend/src/pages/BodyMetricLoggerPage.js

import React from 'react'; // Removed useState
import BodyMetricLogger from '../components/BodyMetricLogger';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader'; // <-- ADD THIS IMPORT

const BodyMetricLoggerPage = () => {
    // The useState and handleLog functions are no longer needed here.
    // The onMetricLogged prop is also no longer needed.

    return (
        <div>
        <PageHeader title="System Quest: Log Workout" /> {/* <-- ADD THIS */}
        <Card>
            <h2>System Task: Log Body Metrics</h2>
            <BodyMetricLogger />
        </Card>
        </div>
    );
};

export default BodyMetricLoggerPage;