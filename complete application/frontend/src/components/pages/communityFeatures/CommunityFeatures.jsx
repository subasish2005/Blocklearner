import styles from './CommunityFeatures.module.css';
import { ListItem } from './components/ListItem';

const features = [
  {
    title: 'Engagement Rewards',
    description: 'Earn points and badges for completing tasks and engaging with your community.'
  },
  {
    title: 'Connect Easily',
    description: 'Share achievements and connect with friends to build a vibrant community.'
  }
];

export const CommunityFeatures = () => {
  return (
    <div className={styles.wrapper}>
      <section className={styles.layout}>
        <div className={styles.container}>
          <article className={styles.content}>
            <header className={styles.header}>
              <h1 className={styles.heading}>
                Empower Your Community with Our Innovative Development Tool
              </h1>
              <p className={styles.description}>
                Discover a platform designed to enhance community engagement and collaboration. 
                Our tool offers unique features that reward participation and foster connections.
              </p>
            </header>
            <div className={styles.featuresList}>
              <div className={styles.featuresRow}>
                {features.map((feature, index) => (
                  <ListItem
                    key={index}
                    title={feature.title}
                    description={feature.description}
                  />
                ))}
              </div>
            </div>
          </article>
          <img 
            loading="lazy" 
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/695e35fe9375ed813e9267c48b6e6e0ed2c5303c0a4eb46842040dcb8370ac1e?placeholderIfAbsent=true&apiKey=e9ee7be21485443cb29464c0cdeb06f4" 
            className={styles.featureImage}
            alt="Community development tool interface showcase" 
          />
        </div>
      </section>
    </div>
  );
};