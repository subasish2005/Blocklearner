import { FlipWords } from "./ui/FlipWords";
import SparklesCore from "./SparklesCore";
import { motion } from "framer-motion";
import "./SparklesPreview.css";

function SparklesPreview() {
  return (
    <div className="sparkles-preview-container">
      {/* Title */}
      <h1 className="sparkles-title">BlockLearner</h1>

      {/* Sparkles Content */}
      <div className="sparkles-content">
        {/* Gradients */}
        <div className="gradient gradient1"></div>
        <div className="gradient gradient2"></div>
        <div className="gradient gradient3"></div>
        <div className="gradient gradient4"></div>

        {/* Sparkles Core */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1500}
          className="sparkles-core"
          particleColor="#FFFFFF"
        />

        {/* Radial Gradient Overlay */}
        <div className="radial-gradient-overlay"></div>
      </div>

      {/* FlipWords Section (Lower Left) */}
      <motion.div
        className="sparkles-flip-text-container"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 30, damping: 15 }}
      >
        <h1>
           Empowering
          </h1>
          <h2> Blockchain Minds to{" "}
          <FlipWords
            words={["Grow", "Innovate", "Engage", "Build", "Learn", "Earn"]}
            duration={1500}
          />
        </h2>
        <p>
          Enabling seamless web3 experiences through a suite of AI, digital
          identity, and blockchain solutions.
        </p>
      </motion.div>

      {/* Hello World Section (Lower Right) */}
      <motion.div
        className="hello-world-section"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 40, damping: 15 }}
      >
        <h1>Hello World</h1>
        <p>Edit this section later for your content.</p>
      </motion.div>

      {/* Trusted Partners Section */}
      <div className="trusted-partners-section">
        <div className="partners-scroll">
          <span>Binance</span>
          <span>Coinbase</span>
          <span>Amex</span>
          <span>Wormhole</span>
          <span>Binance</span>
          <span>Coinbase</span>
          <span>Amex</span>
          <span>Wormhole</span>
        </div>
      </div>
    </div>
  );
}

export default SparklesPreview;







