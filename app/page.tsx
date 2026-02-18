"use client";
import BlurText from "../components/BlurText";
import { motion } from "framer-motion";

export default function Home() {
  const handleAnimationComplete = () => {
    console.log("Animation completed!");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="text-center">
        <BlurText
          text="Welcome to Interbrew"
          delay={200}
          animateBy="words"
          direction="top"
          onAnimationComplete={handleAnimationComplete}
          className="text-6xl font-semibold mb-3"
          animationFrom={{ filter: "blur(10px)", opacity: 0, y: -50 }}
          animationTo={[
            { filter: "blur(5px)", opacity: 0.5, y: 5 },
            { filter: "blur(0px)", opacity: 1, y: 0 },
          ]}
        />

        <motion.div
          className="italic text-lg mb-6 mt-[-3]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.35, ease: "easeOut" }}
        >
          Brew Your Skills. Ace Your Interviews
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.35, ease: "easeOut" }}
        >
          <div className="text-base text-gray-200 max-w-xl mx-auto mt-6 mb-8">
            Master concepts through guided learning with AI-powered mock
            interviews and real-time performance insights.
          </div>
          <div className="flex justify-center gap-4">
            <button className="bg-[#297356] border border-[#ffffff] text-white px-6 py-2 rounded-full font-medium hover:bg-[#1f5a44] transition">
              Sign Up
            </button>
            <button className="border border-[#3f9371] text-[#ffffff] px-6 py-2 rounded-full font-medium hover:bg-[#297356]/10 transition">
              Sign In
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
