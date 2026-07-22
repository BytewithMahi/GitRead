import { motion } from 'framer-motion';
import { Github, Sun, Moon } from 'lucide-react';


interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Navbar = ({ isDark, onToggleTheme }: NavbarProps) => {

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-50 glass-panel px-6 py-4 rounded-2xl flex items-center justify-between"
    >
      <div className="flex items-center space-x-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 rounded-xl bg-gradient-to-tr from-gravity-purple to-gravity-cyan flex items-center justify-center font-bold text-white text-sm"
        >
          G
        </motion.div>
        <span className="font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          GitRead
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="relative w-12 h-6 rounded-full bg-gray-800 border border-white/10 flex items-center px-1 transition-all duration-300"
        >
          <motion.div
            layout
            className="w-4 h-4 rounded-full bg-gradient-to-tr from-gravity-purple to-gravity-cyan flex items-center justify-center"
          >
            {isDark ? <Moon size={10} className="text-white" /> : <Sun size={10} className="text-white" />}
          </motion.div>
        </button>

        {/* GitHub Link */}
        <motion.a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.1, y: -2 }}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-gravity-cyan/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all duration-300"
        >
          <Github size={18} className="text-white" />
        </motion.a>
      </div>
    </motion.header>
  );
};
