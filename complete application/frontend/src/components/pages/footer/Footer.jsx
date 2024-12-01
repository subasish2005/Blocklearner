// eslint-disable-next-line no-unused-vars
import React from 'react';
import { SocialIcon } from './components/SocialIcon';
import { LinkList } from './components/LinkList';
import styles from './Footer.module.css';

const socialIcons = [
  { src: "https://cdn.builder.io/api/v1/image/assets/TEMP/51ccee6ea62ebeef1ebb6e87c0902ba438e48fa10b851a6a4be37450142ca2a4?placeholderIfAbsent=true&apiKey=e9ee7be21485443cb29464c0cdeb06f4", alt: "Social media icon" },
  { src: "https://cdn.builder.io/api/v1/image/assets/TEMP/4117019bd4077c68ffdaa93c6b070ce8e1bb91147398de89c3e32453203a0974?placeholderIfAbsent=true&apiKey=e9ee7be21485443cb29464c0cdeb06f4", alt: "Social media icon" },
  { src: "https://cdn.builder.io/api/v1/image/assets/TEMP/3dbefda36a1b21740a0d6101178a9f4767b73664f8928baacee2099b1419cedf?placeholderIfAbsent=true&apiKey=e9ee7be21485443cb29464c0cdeb06f4", alt: "Social media icon" },
  { src: "https://cdn.builder.io/api/v1/image/assets/TEMP/8ca22054cbc30cf58b1edaedb525ba9cf34da76d2ab3cf722119440263927673?placeholderIfAbsent=true&apiKey=e9ee7be21485443cb29464c0cdeb06f4", alt: "Social media icon" },
  { src: "https://cdn.builder.io/api/v1/image/assets/TEMP/7abc729ae4ce0c5052cb1e30d419110e107075654daee5a961d65a853074d1cf?placeholderIfAbsent=true&apiKey=e9ee7be21485443cb29464c0cdeb06f4", alt: "Social media icon" }
];

const firstColumnLinks = [
  "Community Hub",
  "User Rewards", 
  "Support Center",
  "About Us",
  "Contact Us"
];

const secondColumnLinks = [
  "Feedback Form",
  "Blog Posts",
  "Events Calendar", 
  "FAQs Page",
  "User Guide"
];

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <section className={styles.companyInfo}>
          <img 
            loading="lazy" 
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/251a9e9a57bf3adeec6df23f037ca468389ba0076ed76315ef4b5fa0c11548c1?placeholderIfAbsent=true&apiKey=e9ee7be21485443cb29464c0cdeb06f4" 
            alt="Company logo" 
            className={styles.logo}
          />
          <address className={styles.contactInfo}>
            <div className={styles.addressSection}>
              <h3 className={styles.addressTitle}>Address:</h3>
              <p className={styles.addressText}>
                park street WestBengal kolkata
              </p>
            </div>
            <div className={styles.contactSection}>
              <h3 className={styles.contactTitle}>Contact:</h3>
              <a href="tel:1800123456" className={styles.phoneNumber}>1800 123 4567</a>
              <a href="mailto:info@relume.io" className={styles.email}>Blocklearner.io</a>
            </div>
          </address>
          <div className={styles.socialLinks}>
            {socialIcons.map((icon, index) => (
              <SocialIcon key={index} {...icon} />
            ))}
          </div>
        </section>
        
        <nav className={styles.navigationColumns}>
          <LinkList links={firstColumnLinks} />
          <LinkList links={secondColumnLinks} />
        </nav>
      </div>

      <div className={styles.footerBottom}>
        <hr className={styles.divider} />
        <div className={styles.bottomContent}>
          <p className={styles.copyright}>All rights reserved.</p>
          <nav className={styles.legalLinks}>
            <a href="#" className={styles.legalLink}>Privacy Policy</a>
            <a href="#" className={styles.legalLink}>Terms of Service</a>
            <a href="#" className={styles.legalLink}>Cookies Settings</a>
          </nav>
        </div>
      </div>
    </footer>
  );
};