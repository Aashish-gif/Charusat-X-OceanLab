import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const WelcomeCloud: React.FC = () => {
  const navigate = useNavigate();
  const [showCanvasBtn, setShowCanvasBtn] = useState(false);

  useEffect(() => {
    // Show button after 4 seconds of black hole animation
    const timer = setTimeout(() => {
      setShowCanvasBtn(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden relative font-sans">
      
      {/* Black Hole Singularity */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Accretion disk */}
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-t-4 border-r-4 border-emerald-500/80 shadow-[0_0_60px_20px_rgba(16,185,129,0.5)]"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-4 rounded-full border-b-4 border-l-4 border-teal-400/80 shadow-[0_0_40px_10px_rgba(45,212,191,0.5)]"
        />
        
        {/* Core singularity */}
        <div className="absolute w-20 h-20 bg-black rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,1)] z-10" />
        
        {/* Particles spiraling in */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0, x: Math.cos(i * 18) * 150, y: Math.sin(i * 18) * 150 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [1, 0.5, 0],
              x: 0, 
              y: 0 
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeIn'
            }}
            className="absolute w-2 h-2 bg-white rounded-full blur-[1px]"
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-12 text-center z-20"
      >
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500 mb-4">
          Welcome to Cloud World
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Your infrastructure has been captured by the singularity. Fabricating resources now...
        </p>
      </motion.div>

      {showCanvasBtn && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="mt-8 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-medium shadow-[0_0_20px_rgba(16,185,129,0.4)] z-20"
        >
          Enter the Canvas
        </motion.button>
      )}

    </div>
  );
};

export default WelcomeCloud;
