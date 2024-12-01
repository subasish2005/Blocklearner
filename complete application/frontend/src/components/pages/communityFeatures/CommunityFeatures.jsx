import styles from './CommunityFeatures.module.css';
import { ListItem } from './components/ListItem';
import CommunityDashboard3D from './components/CommunityDashboard3D';

const features = [
  {
    title: 'Engagement Rewards',
    description: 'Complete tasks, participate in events, earn badges and points as you contribute to the community showcasing your expertise and commitment.'
  },
  {
    title: 'Connect Easily',
    description: 'Share achievements and connect with like-minded individuals to create a supportive and inclusive environment to build a vibrant community.'
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
                Empower Your Community with Our Innovative Development Tools
              </h1>
              <p className={styles.description}>
                Whether you are a Web3 expert or just starting out, we provide the tools and incentives you need to thrive.
                Our platform transforms community participation into meaningful rewards, making your Web3 journey both educational and rewarding.
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
          <div className={styles.featureImage}>
            <CommunityDashboard3D />
          </div>
        </div>
      </section>
    </div>
  );
};