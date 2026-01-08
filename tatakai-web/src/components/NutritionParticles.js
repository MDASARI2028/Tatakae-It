// frontend/src/components/NutritionParticles.js
import React, { useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const NutritionParticles = () => {
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    const options = React.useMemo(() => ({
        fullScreen: {
            enable: true,
            zIndex: 0
        },
        particles: {
            number: {
                value: 30, // Decreased density
                density: { enable: true, value_area: 800 }
            },
            color: { value: "#ffffff" },
            shape: {
                type: "image",
                image: [
                    {
                        src: "/icons/nutrition/heartbeat.svg",
                        width: 100,
                        height: 100
                    },
                    {
                        src: "/icons/nutrition/water-small.svg",
                        width: 100,
                        height: 100
                    },
                    {
                        src: "/icons/nutrition/utensils.svg",
                        width: 100,
                        height: 100
                    }
                ]
            },
            opacity: { value: 1, random: false },
            size: { value: 14, random: true }, // Slightly smaller
            links: {
                enable: true,
                distance: 100, // Matched Dashboard
                color: "#ffffff", // Matched Dashboard
                opacity: 0.6, // Matched Dashboard
                width: 2, // Matched Dashboard
            },
            move: {
                enable: true,
                speed: 0.65, // Matched Dashboard
                direction: "none",
                out_mode: "out",
            },
        },
        interactivity: {
            events: {
                onhover: {
                    enable: true,
                    mode: "grab", // Matched Dashboard
                },
            },
            modes: {
                grab: {
                    distance: 200, // Matched Dashboard
                    links: {
                        opacity: 1,
                        color: "#14b8a6" // Changed to Teal for Nutrition theme, but kept behavior
                    }
                },
            },
        },
        detectRetina: true,
    }), []);

    return <Particles id="nutrition-particles" init={particlesInit} options={options} />;
};

export default NutritionParticles;
