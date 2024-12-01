
import styles from './Faq.module.css';

// eslint-disable-next-line react/prop-types
export const AccordionItem = ({ question, answer }) => {
  return (
    <article className={styles.accordionItem}>
      <div className={styles.questionWrapper}>
        <h3 className={styles.questionText}>{question}</h3>
        <img 
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/201cef5efa8b17b42e3b52d2505302d68153608d2a5283beededfaed746a6493?placeholderIfAbsent=true&apiKey=e9ee7be21485443cb29464c0cdeb06f4" 
          alt="" 
          className={styles.toggleIcon} 
          loading="lazy" 
        />
      </div>
      <p className={styles.answerText}>{answer}</p>
    </article>
  );
};