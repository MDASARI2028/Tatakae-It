// frontend/src/components/dashboard/ConstellationParticles.js
import React, { useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim"; // <-- 1. IMPORT FROM "tsparticles-slim"

const ConstellationParticles = () => {
    const particlesInit = useCallback(async (engine) => {
        // <-- 2. USE loadSlim HERE
        await loadSlim(engine);
    }, []);

    const options = {
        fullScreen: {
            enable: true,
            zIndex: 0 // place canvas above page background but below UI content
        },
        particles: {
            number: {
                value: 80, // <-- 2. REDUCED PARTICLE COUNT
                density: { enable: true, value_area: 800 }
            },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 1, random: false }, // <-- 3. INCREASED BRIGHTNESS
            size: { value: 1, random: true },
            links: {
                enable: true,
                distance: 100,
                color: "#ffffff",
                opacity: 0.6,
                width: 2,
            },
            move: {
                enable: true,
                speed: 0.65,
                direction: "none",
                out_mode: "out",
            },
        },
        interactivity: {
            events: {
                onhover: {
                    enable: true,
                    mode: "grab",
                },
            },
            modes: {
                grab: {
                    distance: 200,
                    links: {
                        opacity: 1,
                        color: "#8A2BE2"
                    }
                },
            },
        },
        detectRetina: true,
    };

    return <Particles id="constellation-particles" init={particlesInit} options={options} />;
};

export default ConstellationParticles;
