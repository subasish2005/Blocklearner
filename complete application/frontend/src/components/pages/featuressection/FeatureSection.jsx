// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef } from 'react';
import { FeatureCard } from './FeatureCard';
import styles from './FeaturesSection.module.css';

const features = [
  {
    icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/d915449bc5d790022c922770dd742e37e961d2e7a3fffa21725113afb29a2f08?placeholderIfAbsent=true&apiKey=e9ee7be21485443cb29464c0cdeb06f4',
    title: 'Engage with friends and earn rewards in our vibrant community.',
    description: 'Experience Galxe-like functionalities that enhance user interaction and community building.',
    buttonText: 'Learn More',
    buttonIcon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/dd1e06eaccd79163205ba79fde3256c4c3ae2209c23e5f8d4382270c514b2bdd?placeholderIfAbsent=true&apiKey=e9ee7be21485443cb29464c0cdeb06f4'
  },
  {
    icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/fa6119d5f81204fe6d3516d96540d57df07aacd17aae3a163ee6969b8454b114?placeholderIfAbsent=true&apiKey=e9ee7be21485443cb29464c0cdeb06f4',
    title: 'Earn points and showcase achievements with our unique badge system.',
    description: 'Our user points system rewards you for completing tasks and engaging with others.',
    buttonText: 'Sign Up',
    buttonIcon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/d4aed70e652b9a334e2a683ba9bfef5c04d880fcb9b8ad7514c3dabef58a54d7?placeholderIfAbsent=true&apiKey=e9ee7be21485443cb29464c0cdeb06f4'
  },
  {
    icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/2cddb2da30d84f8ed9a7a58c92439bd77cc4c7f4b8a4a8d5ecd57bbee3681b81?placeholderIfAbsent=true&apiKey=e9ee7be21485443cb29464c0cdeb06f4',
    title: 'Connect with friends and share your achievements effortlessly.',
    description: 'Build connections and celebrate your milestones together in our community.',
    buttonText: 'Join Us',
    buttonIcon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/a3e4b958ca4a2b72b7a82777e048df708d0c2935701e3ae3c5c2a73e9e15dc44?placeholderIfAbsent=true&apiKey=e9ee7be21485443cb29464c0cdeb06f4'
  }
];

export function FeaturesSection() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px'
      }
    );

    // Observe heading
    if (headingRef.current) {
      observer.observe(headingRef.current);
    }

    // Observe cards container
    if (cardsRef.current) {
      const cards = cardsRef.current.children;
      Array.from(cards).forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1 + 0.3}s`;
        observer.observe(card);
      });
    }

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (headingRef.current) observer.unobserve(headingRef.current);
      if (cardsRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const cards = cardsRef.current.children;
        Array.from(cards).forEach(card => observer.unobserve(card));
      }
    };
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <h2 className={`${styles.heading} ${styles.slideIn}`} ref={headingRef}>
        Discover our innovative community development features designed for engagement and growth.
      </h2>
      <div className={styles.content}>
        <div className={styles.cardGrid} ref={cardsRef}>
          {features.map((feature, index) => (
            <div key={index} className={styles.slideIn}>
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}