import  { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

// eslint-disable-next-line react/prop-types
const Card3D = ({ title, description, icon, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Mouse position values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring animation config
  const springConfig = { damping: 20, stiffness: 300 };
  
  // Smooth springs for each transform value
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), springConfig);
  const scale = useSpring(isHovered ? 1.1 : 1, springConfig);
  const translateZ = useSpring(isHovered ? 20 : 0, springConfig);

  // Shadow intensity based on hover state
  const boxShadow = useSpring(
    isHovered ? '0px 20px 30px rgba(0, 0, 0, 0.35)' : '0px 10px 15px rgba(0, 0, 0, 0.2)',
    springConfig
  );

  // Reflection effect
  const reflection = useSpring(
    isHovered ? 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(0,0,0,0.1))' : 'none',
    springConfig
  );

  // Enhanced lighting effect
  const lightingEffect = useSpring(
    isHovered ? 'linear-gradient(145deg, rgba(255,255,255,0.2), rgba(0,0,0,0.2))' : 'none',
    springConfig
  );

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Convert mouse position to normalized values (-0.5 to 0.5)
    x.set((mouseX - width / 2) / width);
    y.set((mouseY - height / 2) / height);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={cn("card-3d", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        scale,
        z: translateZ,
        boxShadow,
        background: reflection,
        backgroundImage: lightingEffect,
        transformStyle: "preserve-3d",
        fontFamily: "'Montserrat', sans-serif",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: "easeOut"
      }}
    >
      <motion.div 
        className="card-content"
        style={{
          transformStyle: "preserve-3d",
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        <motion.div 
          className="card-icon"
          style={{
            scale: useSpring(isHovered ? 1.2 : 1, springConfig),
            rotateZ: useSpring(isHovered ? 10 : 0, springConfig),
            z: 40
          }}
        >
          {icon}
        </motion.div>
        <motion.h3 
          className="card-title"
          style={{
            z: 30,
            scale: useSpring(isHovered ? 1.1 : 1, springConfig),
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#fff',
            padding: '0.5rem',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </motion.h3>
        <motion.p 
          className="card-description"
          style={{
            z: 20,
            opacity: useSpring(isHovered ? 0.9 : 0.7, springConfig),
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '1rem',
            fontWeight: '400',
            color: '#eee',
            padding: '0.5rem',
            letterSpacing: '0.01em',
            lineHeight: 1.6,
          }}
        >
          {description}
        </motion.p>
      </motion.div>

      {/* 3D lighting effect */}
      <motion.div
        className="card-shine"
        style={{
          opacity: useSpring(isHovered ? 0.15 : 0, springConfig),
          rotateX: useTransform(y, [-0.5, 0.5], [-20, 20]),
          rotateY: useTransform(x, [-0.5, 0.5], [20, -20]),
        }}
      />
    </motion.div>
  );
};

export default Card3D;
