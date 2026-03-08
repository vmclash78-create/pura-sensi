import { useState, useCallback, ReactNode } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

const item = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export interface LinkData {
  label: string;
  icon: ReactNode;
  subtitle?: string;
  price: number;
}

interface LinkCardProps {
  link: LinkData;
  index: number;
  onClick: () => void;
}

const LinkCard = ({ link, index, onClick }: LinkCardProps) => {
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useTransform(mouseX, (v) => `${v}px`);
  const glowY = useTransform(mouseY, (v) => `${v}px`);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setTimeout(() => setRipple(null), 600);
      onClick();
    },
    [onClick]
  );

  return (
    <motion.button
      type="button"
      variants={item}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="relative flex items-center gap-4 w-full px-5 py-4 rounded-xl bg-card/60 backdrop-blur-md border border-border/40 hover:border-primary/60 transition-all group overflow-hidden text-left cursor-pointer"
      style={{ willChange: "transform" }}
    >
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-primary/20 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ left: glowX, top: glowY, x: "-50%", y: "-50%" }}
      />

      {ripple && (
        <motion.span
          className="absolute rounded-full bg-primary/30 pointer-events-none"
          initial={{ width: 0, height: 0, opacity: 0.6 }}
          animate={{ width: 300, height: 300, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ left: ripple.x, top: ripple.y, x: "-50%", y: "-50%" }}
        />
      )}

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden rounded-xl pointer-events-none">
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      </div>

      <motion.span
        className="relative w-8 flex-shrink-0 flex items-center justify-center"
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.2 }}
        transition={{ duration: 0.4 }}
      >
        {link.icon}
      </motion.span>
      <div className="relative flex-1 text-center pr-8">
        <span className="text-sm font-semibold tracking-wider text-foreground group-hover:text-primary transition-colors duration-300">
          {link.label}
        </span>
        {link.subtitle && (
          <span className="block text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
            {link.subtitle}
          </span>
        )}
      </div>

      <motion.span
        className="absolute right-4 text-muted-foreground/40 group-hover:text-primary/70 transition-colors"
        initial={{ x: 0, opacity: 0 }}
        whileHover={{ x: 3 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 + index * 0.1 }}
      >
        ›
      </motion.span>
    </motion.button>
  );
};

export default LinkCard;
