// frontend/src/components/PageHeader.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './PageHeader.css';

const PageHeader = ({ title }) => {
    return (
        <div className="page-header">
            <Link to="/fitness" className="back-link">
                <FaArrowLeft />
                <span>Back to Fitness Menu</span>
            </Link>
            <h2>{title}</h2>
        </div>
    );
};

export default PageHeader;