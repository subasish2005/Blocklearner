import  { useState } from 'react';
import styles from './FAQSection.module.css';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "What is BlockLearner?",
    answer: "BlockLearner is an innovative learning platform that combines blockchain technology with educational content. We offer a unique approach to learning with Web3 integration and community-driven features."
  },
  {
    question: "How do I earn rewards?",
    answer: "You can earn rewards by completing courses, participating in community discussions, helping other learners, and achieving learning milestones. Our point-based system tracks your progress and automatically distributes rewards."
  },
  {
    question: "What makes BlockLearner different?",
    answer: "BlockLearner stands out through its Web3 integration, community-driven learning approach, and unique reward system. We combine traditional learning with blockchain technology to create an engaging and rewarding educational experience."
  },
  {
    question: "How do I get started?",
    answer: "Getting started is easy! Simply sign up for an account, complete your profile, and start exploring our courses. You can join communities, participate in discussions, and begin earning rewards right away."
  },
  {
    question: "Are the courses free?",
    answer: "We offer both free and premium courses. Many of our basic courses and community features are free to access. Premium courses offer additional features, in-depth content, and exclusive rewards."
  },
  {
    question: "How does the reward system work?",
    answer: "Our reward system is based on points and achievements. You earn points through various activities like completing courses, helping others, and contributing to discussions. These points can be converted into rewards or used to unlock premium content."
  }
];

// eslint-disable-next-line react/prop-types
const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className={`${styles.faqItem} ${isOpen ? styles.open : ''}`}>
      <button className={styles.questionButton} onClick={onClick}>
        <span className={styles.questionText}>{question}</span>
        <motion.span 
          className={styles.icon}
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.answerWrapper}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className={styles.answer}>{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const handleClick = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Frequently Asked Questions</h2>
        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => handleClick(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
