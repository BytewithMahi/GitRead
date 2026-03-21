import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type CardVariant = 'purple' | 'cyan' | 'green' | 'red' | 'yellow';

interface FloatingCardProps {
  title: string;
  icon?: ReactNode;
  variant?: CardVariant;
  children: ReactNode;
  delay?: number;
}

const variantStyles: Record<CardVariant, string> = {
  purple: 'hover:border-gravity-purple/40 hover:shadow-[0_0_30px_rgba(184,41,255,0.15)] bg-gradient-to-br from-gravity-purple/5 to-transparent',
  cyan: 'hover:border-gravity-cyan/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] bg-gradient-to-br from-gravity-cyan/5 to-transparent',
  green: 'hover:border-green-500/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] bg-gradient-to-br from-green-500/5 to-transparent',
  red: 'hover:border-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] bg-gradient-to-br from-red-500/5 to-transparent',
  yellow: 'hover:border-yellow-500/30 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] bg-gradient-to-br from-yellow-500/5 to-transparent',
};

export const FloatingCard = ({ title, icon, variant = 'purple', children, delay = 0 }: FloatingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5, scale: 1.01 }}
      className={`glass-card p-6 rounded-2xl transition-all duration-300 border border-white/5 relative overflow-hidden group ${variantStyles[variant]}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-white group-hover:text-amber-500/10 transition-colors flex items-center space-x-2">
          {icon && <span className="p-1.5 rounded-lg bg-white/5 border border-white/10">{icon}</span>}
          <span>{title}</span>
        </h3>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -bottom-10 -right-10 w-24 h-24 rounded-full filter blur-2xl z-0"
          style={{ backgroundColor: variant === 'purple' ? '#b829ff' : variant === 'cyan' ? '#06b6d4' : variant === 'green' ? '#22c55e' : '#ef4444' }}
        />
      </div>
      <div className="relative z-10 text-gray-300 text-sm leading-relaxed">
        {children}
      </div>
    </motion.div>
  );
};
