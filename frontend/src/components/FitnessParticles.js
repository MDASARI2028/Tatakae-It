// frontend/src/components/FitnessParticles.js
import React, { useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const FitnessParticles = () => {
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
                        src: "/icons/fitness/dumbbell.svg",
                        width: 100,
                        height: 100
                    },
                    {
                        src: "/icons/fitness/weight.svg",
                        width: 100,
                        height: 100
                    },
                    {
                        src: "/icons/fitness/barbell.svg",
                        width: 100,
                        height: 100
                    },
                    {
                        src: "/icons/fitness/kettlebell.svg",
                        width: 100,
                        height: 100
                    }
                ]
            },
            opacity: { value: 1, random: false }, // Matched Dashboard
            size: { value: 16, random: true }, // Increased for icon visibility
            links: {
                enable: true,
                distance: 100, // Matched Dashboard
                color: "#FF4D6D", // Pinkish Red
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
                        color: "#FF4D6D" // Pinkish Red
                    }
                },
            },
        },
        detectRetina: true,
    }), []);

    return <Particles id="fitness-particles" init={particlesInit} options={options} />;
};

export default FitnessParticles;
