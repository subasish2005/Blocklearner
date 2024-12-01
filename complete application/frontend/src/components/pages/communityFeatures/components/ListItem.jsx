// eslint-disable-next-line no-unused-vars
import React from 'react';
import styles from './ListItem.module.css';

// eslint-disable-next-line react/prop-types
export const ListItem = ({ title, description }) => {
  return (
    <article className={styles.listItem}>
      <h3 className={styles.subheading}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </article>
  );
};