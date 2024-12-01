// eslint-disable-next-line no-unused-vars
import React from 'react';
import styles from '../Footer.module.css';

// eslint-disable-next-line react/prop-types
export const SocialIcon = ({ src, alt }) => (
  <img loading="lazy" src={src} alt={alt} className={styles.socialIcon} />
);