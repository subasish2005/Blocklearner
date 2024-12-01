
import styles from './FeatureCard.module.css';

// eslint-disable-next-line react/prop-types
export function FeatureCard({ icon, title, description, buttonText, buttonIcon }) {
  return (
    <article className={styles.card}>
      <div className={styles.content}>
        <img loading="lazy" src={icon} alt="" className={styles.icon} />
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>
      </div>
      <div className={styles.actionWrapper}>
        <button className={styles.button}>
          <span className={styles.buttonText}>{buttonText}</span>
          <img loading="lazy" src={buttonIcon} alt="" className={styles.buttonIcon} />
        </button>
      </div>
    </article>
  );
}