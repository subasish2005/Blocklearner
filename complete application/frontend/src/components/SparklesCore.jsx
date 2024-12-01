import { useId, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { motion, useAnimation } from "framer-motion";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const SparklesCore = ({
  id,
  className = "",
  background = "#0d47a1",
  minSize = 0.6,
  maxSize = 1.4,
  speed = 1,
  particleColor = "#ffffff",
  particleDensity = 100, // Higher density for better visual concentration
}) => {
  const [init, setInit] = useState(false);
  const controls = useAnimation();
  const generatedId = useId();

  useEffect(() => {
    const initializeEngine = async () => {
      await initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      });
      setInit(true);
    };

    initializeEngine();
  }, []);

  const handleParticlesLoaded = (container) => {
    if (container) {
      controls.start({
        opacity: 1,
        transition: { duration: 1 },
      });
    }
  };

  return (
    <motion.div
      animate={controls}
      className={`opacity-0 ${className}`}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      {init && (
        <Particles
          id={id || generatedId}
          className="particles-background"
          particlesLoaded={handleParticlesLoaded}
          options={{
            background: {
              color: { value: background },
            },
            fullScreen: {
              enable: false,
              zIndex: 1,
            },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: { enable: false, mode: "push" },
                onHover: { enable: false, mode: "repulse" },
                resize: true,
              },
              modes: {
                push: { quantity: 6 },
                repulse: { distance: 60, duration: 0.2 },
              },
            },
            particles: {
              number: {
                value: particleDensity,
                density: {
                  enable: true,
                  width:400,
                  height: 400 // Smaller area for higher concentration
                },
              },
              color: {
                value: particleColor,
              },
              shape: {
                type: "circle",
              },
              opacity: {
                value: { min: 0.2, max: 1 },
                animation: {
                  enable: true,
                  speed: 1.5,
                  sync: false,
                },
              },
              size: {
                value: { min: minSize, max: maxSize },
                animation: {
                  enable: true,
                  speed: 3,
                  minimumValue: minSize,
                  sync: false,
                },
              },
              move: {
                enable: true,
                speed: { min: 0.1, max: speed },
                direction: "none",
                random: true,
                straight: false,
                outModes: {
                  default: "out",
                },
              },
            },
            detectRetina: true,
          }}
        />
      )}
    </motion.div>
  );
};

SparklesCore.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  background: PropTypes.string,
  minSize: PropTypes.number,
  maxSize: PropTypes.number,
  speed: PropTypes.number,
  particleColor: PropTypes.string,
  particleDensity: PropTypes.number,
};

export default SparklesCore;

