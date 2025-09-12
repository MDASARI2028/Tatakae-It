// frontend/src/pages/WorkoutLoggerPage.js

import React, { useState, useContext } from 'react';
import WorkoutLogger from '../components/WorkoutLogger';
import Card from '../components/Card';
import { TemplateContext } from '../context/TemplateContext';
import PageHeader from '../components/PageHeader'; // <-- ADD THIS IMPORT

const WorkoutLoggerPage = () => {
    // Get templates directly from our new context!
    const { templates } = useContext(TemplateContext);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const handleTemplateChange = (e) => {
        const templateId = e.target.value;
        const template = templates.find(t => t._id === templateId);
        setSelectedTemplate(template);
    };

    return (
        <div>
            <PageHeader title="System Quest: Log Workout" /> {/* <-- ADD THIS */}
        <Card>
            <h2>System Quest: Log Workout</h2>
            
            {templates && templates.length > 0 && (
                <div className="template-selector">
                    <label htmlFor="template-select">Load from Template:</label>
                    <select id="template-select" className="form-select" onChange={handleTemplateChange} defaultValue="">
                        <option value="" disabled>Select a template...</option>
                        {templates.map(t => (
                            <option key={t._id} value={t._id}>{t.templateName}</option>
                        ))}
                    </select>
                </div>
            )}
            
            <WorkoutLogger template={selectedTemplate} />
        </Card>
        </div>

    );
};

export default WorkoutLoggerPage;