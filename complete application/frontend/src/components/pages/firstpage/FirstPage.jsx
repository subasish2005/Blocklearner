import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HoverBorderGradient } from '../../../components/customcomponents/hover boarder gradient/HoverBorderGradient';
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
    description: "Connect with like-minded individuals, collaborate on projects, and grow your knowledge in the Web3 space.",
    icon: "🤝"
  },
  {
    title: "Event Participation",
    description: "Take part in exclusive Web3 events, AMAs, hackathons, and more. Stay informed and connected to the latest trends in blockchain.",
    icon: "📚"
  },
  {
    title: "Achievement System",
    description: "Gain points for completing simple to advanced tasks. From participating in community discussions to coding challenges, every effort earns you recognition.",
    icon: "🏆"
  }
];

// FirstPage Component
const FirstPage = () => {
  const navigate = useNavigate();
  const cardsRef = useRef(null);
  const textRef = useRef(null);
  const isCardsInView = useInView(cardsRef, { once: true, margin: "-100px" });
  const isTextInView = useInView(textRef, { once: true, margin: "-100px" });

  const handleJoinClick = () => {
    navigate('/login');
  };

  return (
    <div className="page-container">
      <div className="background-lines" />
      
      <div className="content-wrapper">
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
               Shape the Future of Web3
              </motion.h1>
              
              <motion.p 
                className="hero-description"
                variants={textVariants}
              >
               At BlockLearner, we believe in empowering individuals and communities to play an active role in shaping the decentralized future.
               Start your Web3 journey with us today!
              </motion.p>
              
              <motion.div 
                className="hero-actions"
                variants={textVariants}
              >
                <HoverBorderGradient className="join-button" onClick={handleJoinClick}>
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
                    className="hero-feature-card"
                  >
                    <div className="hero-feature-card-icon">{card.icon}</div>
                    <h3 className="hero-feature-card-title">{card.title}</h3>
                    <p className="hero-feature-card-description">{card.description}</p>
                    <div className="hero-feature-card-shine"></div>
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
