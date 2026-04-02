/* eslint-disable react-hooks/purity */
import { motion } from 'framer-motion';
import { useMemo } from 'react';

export const Background = () => {
  const particles = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      y: Math.random() * 100 + "%",
      x: Math.random() * 100 + "%",
      scale: Math.random() * 0.5 + 0.5,
      opacity: Math.random() * 0.3 + 0.1,
      duration: Math.random() * 10 + 15,
    }));
  }, []);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-gravity-dark">
      {/* Glow Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gravity-purple/20 filter blur-[80px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gravity-cyan/15 filter blur-[100px]"
      />
      
      {/* Floating Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            y: p.y,
            x: p.x,
            scale: p.scale,
            opacity: p.opacity,
          }}
          animate={{
            y: ["0%", "100%", "0%"],
            x: ["0%", "10%", "-10%", "0%"],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute w-1 h-1 bg-white rounded-full filter blur-[1px]"
        />
      ))}

      {/* Grid Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
    </div>
  );
};
