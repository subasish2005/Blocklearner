import { useEffect, useState, useCallback, useRef } from 'react';
import Navbar from './Navbar/Navbar1';
import SparklesPreview from './SparklesPreview';
import './HomePage.css';
import { FirstPage } from './pages/firstpage/FirstPage';
import { CommunityFeatures } from './pages/communityFeatures/CommunityFeatures';
import { FeaturesSection } from './pages/featuressection/FeatureSection';
import { Footer } from './pages/footer/Footer';
import { FAQSection } from './pages/faqsection/FAQSection';

const HomePage = () => {
  const [activeSection, setActiveSection] = useState(1);
  const [isScrolling, setIsScrolling] = useState(false);
  const sectionsRef = useRef([]);
  const scrollTimeout = useRef(null);

  // Throttle scroll event handler
  const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // Optimized section detection
  const handleScroll = useCallback(throttle(() => {
    if (isScrolling) return;

    const scrollPosition = window.scrollY + window.innerHeight / 2;
    
    sectionsRef.current.forEach((section, index) => {
      if (!section) return;
      
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.clientHeight;

      if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
        setActiveSection(index + 1);
        section.classList.add('scroll-active');
      } else {
        section.classList.remove('scroll-active');
      }
    });
  }, 100), [isScrolling]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Smooth scroll with animation lock
  const scrollToSection = useCallback((index) => {
    if (isScrolling) return;

    const section = sectionsRef.current[index - 1];
    if (!section) return;

    setIsScrolling(true);
    
    const targetPosition = section.offsetTop;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 1000;
    let start = null;

    const animation = (currentTime) => {
      if (!start) start = currentTime;
      const progress = currentTime - start;
      const percentage = Math.min(progress / duration, 1);

      // Easing function for smoother animation
      const easeInOutCubic = t => t < 0.5 
        ? 4 * t * t * t 
        : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

      window.scrollTo(0, startPosition + distance * easeInOutCubic(percentage));

      if (progress < duration) {
        window.requestAnimationFrame(animation);
      } else {
        // Clear any existing timeout
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
        
        // Set a new timeout to unlock scrolling
        scrollTimeout.current = setTimeout(() => {
          setIsScrolling(false);
        }, 100);
      }
    };

    window.requestAnimationFrame(animation);
  }, [isScrolling]);

  return (
    <div className="home-page">
      <Navbar />
      <div className="side-icons">
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <button
            key={num}
            className={`side-icon ${activeSection === num ? 'active' : ''}`}
            onClick={() => scrollToSection(num)}
            aria-label={`Scroll to section ${num}`}
            disabled={isScrolling}
          />
        ))}
      </div>
      <section ref={el => sectionsRef.current[0] = el}><div className="section1">
        <SparklesPreview />
      </div></section>
      <section ref={el => sectionsRef.current[1] = el}><div className='section2'><FirstPage /></div></section>
      <section ref={el => sectionsRef.current[2] = el}><div className='section3'><CommunityFeatures /></div></section>
      <section ref={el => sectionsRef.current[3] = el}><div className='section4'><FeaturesSection /></div></section>
      <section ref={el => sectionsRef.current[4] = el}><div className='section5'><FAQSection /></div></section>
      <section ref={el => sectionsRef.current[5] = el}><div className='section6'><Footer /></div></section>
    </div>
  );
};

export default HomePage;
