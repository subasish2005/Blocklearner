/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { HoverBorderGradient } from '../../../components/customcomponents/hover boarder gradient/HoverBorderGradient';
import Card3D from './Card3D';
import './FirstPage.css';

// Text animation variants
const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const textVariants = {
  hidden: { 
    opacity: 0, 
    x: -100,
    filter: "blur(8px)"
  },
  visible: { 
    opacity: 1, 
    x: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 100
    }
  }
};

// Card container animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    x: 100,
    scale: 0.8
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100
    }
  }
};

const cardData = [
  {
    title: "Community Building",
    description: "Connect with like-minded individuals and build lasting relationships within your community.",
    icon: "🤝"
  },
  {
    title: "Skill Development",
    description: "Access resources and opportunities to enhance your skills and knowledge.",
    icon: "📚"
  },
  {
    title: "Achievement System",
    description: "Track your progress and earn recognition for your contributions to the community.",
    icon: "🏆"
  }
];

// FirstPage Component
const FirstPage = () => {
  const cardsRef = useRef(null);
  const textRef = useRef(null);
  const isCardsInView = useInView(cardsRef, { once: true, margin: "-100px" });
  const isTextInView = useInView(textRef, { once: true, margin: "-100px" });

  return (
    <div className="relative min-h-screen">
      <div className="background-lines" />
      
      <div className="relative z-10">
        <section className="hero">
          <div className="hero-content">
            <motion.div 
              ref={textRef}
              className="hero-title-column"
              variants={textContainerVariants}
              initial="hidden"
              animate={isTextInView ? "visible" : "hidden"}
            >
              <motion.h1 
                className="hero-title"
                variants={textVariants}
              >
                Empower Your Community, Unlock Your Potential
              </motion.h1>
              
              <motion.p 
                className="hero-description"
                variants={textVariants}
              >
                Join our innovative platform designed to foster community development 
                and connection. Earn points, showcase your achievements, and collaborate 
                with friends to create a vibrant community.
              </motion.p>
              
              <motion.div 
                className="hero-actions"
                variants={textVariants}
              >
                <HoverBorderGradient className="join-button">
                  Join Now
                </HoverBorderGradient>
                <HoverBorderGradient className="learn-more-button">
                  Learn More
                </HoverBorderGradient>
              </motion.div>
            </motion.div>
            
            <div className="hero-content-column">
              <motion.div 
                ref={cardsRef}
                className="cards-container"
                variants={containerVariants}
                initial="hidden"
                animate={isCardsInView ? "visible" : "hidden"}
              >
                {cardData.map((card, index) => (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                  >
                    <Card3D
                      title={card.title}
                      description={card.description}
                      icon={card.icon}
                      className="feature-card"
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <section className="cards-section">
        </section>
      </div>
    </div>
  );
};

export { FirstPage };
