import { motion } from 'framer-motion';
import { useRef } from 'react';
import './FeatureSection.css';

const features = [
  {
    title: 'Task-Based Engagement',
    description: 'Complete community tasks, contribute to discussions, and build projects tailored to your skill level.',
    icon: '🎯'
  },
  {
    title: 'Points & Badges',
    description: 'Earn points and unlock badges that showcase your expertise and contributions in the Web3 space.Badges can grant access to special events, exclusive rewards, or early opportunities.',
    icon: '🏆'
  },
  {
    title: 'Community Events',
    description: 'Participate in exclusive Web3 events, AMAs, and hackathons to stay connected with the latest trends.',
    icon: '🌟'
  },
  {
    title: 'Learn & Grow',
    description: 'Access educational resources, join study groups, and collaborate with peers to accelerate your Web3 journey.',
    icon: '📚'
  },
  {
    title: 'NFT Rewards',
    description: 'Earn exclusive NFTs for your achievements and contributions, creating a verifiable portfolio of your expertise and access to early token releases and Discounts on Web3 tools and resources.',
    icon: '🎨'
  },
  {
    title: 'Networking Hub',
    description: 'Connect with industry experts, mentors, and fellow learners to build valuable relationships in the Web3 ecosystem.Discover and collaborate with like-minded individuals on blockchain projects, DAOs, or research initiatives',
    icon: '🤝'
  }
];

export function FeaturesSection() {
  const sectionRef = useRef(null);

  return (
    <section className="features-section" ref={sectionRef}>
      <div className="features-wrapper">
        <motion.h2 
          className="features-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Discover our innovative community development features designed for engagement and growth.
        </motion.h2>
        
        <motion.div 
          className="features-content"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <span className="feature-icon">{feature.icon}</span>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}