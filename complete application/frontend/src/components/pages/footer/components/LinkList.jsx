// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from '../Footer.module.css';

export const LinkList = ({ links }) => {
  const listRef = useRef(null);

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

    const links = listRef.current.querySelectorAll('a');
    links.forEach((link, index) => {
      link.style.transitionDelay = `${index * 0.1}s`;
      observer.observe(link);
    });

    return () => {
      links.forEach(link => observer.unobserve(link));
    };
  }, []);

  return (
    <nav className={styles.linkList} ref={listRef}>
      {links.map((link, index) => (
        <a href="#" key={index} className={`${styles.link} ${styles.slideIn}`}>
          {link}
        </a>
      ))}
    </nav>
  );
};

// Prop validation
LinkList.propTypes = {
  links: PropTypes.arrayOf(PropTypes.string).isRequired,
};
