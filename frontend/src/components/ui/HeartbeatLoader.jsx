import React from 'react';
import { motion } from 'framer-motion';

const HeartbeatLoader = ({ className = "", size = "lg" }) => {
  const isSmall = size === "sm";
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`relative ${isSmall ? "w-12 h-8" : "w-24 h-16"}`}>
        <svg
          viewBox="0 0 100 40"
          className={`w-full h-full stroke-[#f97316] fill-none`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Static background dashed line */}
          <line 
            x1="0" y1="20" x2="100" y2="20" 
            strokeOpacity="0.1" 
            strokeWidth="1" 
            strokeDasharray="2 2" 
          />
          
          {/* Animated Heartbeat Path */}
          <motion.path
            d="M0,20 L30,20 L35,10 L40,30 L45,5 L50,35 L55,20 L100,20"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 1],
              pathOffset: [0, 0, 1],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.5, 1]
            }}
          />
          
          {/* Moving Glow Head */}
          <motion.circle
            r="2"
            fill="#f97316"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              offsetDistance: ["0%", "100%"]
            }}
            style={{ offsetPath: "path('M0,20 L30,20 L35,10 L40,30 L45,5 L50,35 L55,20 L100,20')" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </svg>
      </div>
      {!isSmall && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#f97316]"
        >
          Measuring Pulse...
        </motion.p>
      )}
    </div>
  );
};

export default HeartbeatLoader;
