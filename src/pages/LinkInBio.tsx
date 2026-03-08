import { Instagram } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import bgLightning from "@/assets/bg-lightning.jpg";
import logo from "@/assets/logo.png";

const PROFILE = {
  name: "Pares Xiter",
  avatar: "https://i.pravatar.cc/150?img=12",
  instagram: "https://instagram.com/pares.xiter",
};

const LINKS = [
  { label: "AUXÍLIO VIP", url: "#", icon: "🎯" },
  { label: "PAINEL PERMANENTE", url: "#", icon: "🤖", subtitle: "Android" },
  { label: "PAINEL PERMANENTE", url: "#", icon: "📱", subtitle: "iOS" },
  { label: "PAINEL MENSAL", url: "#", icon: "🤖", subtitle: "Android" },
  { label: "PAINEL MENSAL", url: "#", icon: "📱", subtitle: "iOS" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const item = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const logoAnim = {
  hidden: { opacity: 0, scale: 0.7, filter: "blur(12px)" },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// Floating particles component
const Particles = () => {
  const particles = Array.from({ length: 20 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/40"
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, `${Math.random() * 100}%`, `${Math.random() * 100}%`],
            x: [null, `${Math.random() * 100}%`, `${Math.random() * 100}%`],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 8 + 6,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 4,
          }}
        />
      ))}
    </div>
  );
};

// Interactive link card
const LinkCard = ({ link, index }: { link: typeof LINKS[0]; index: number }) => {
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useTransform(mouseX, (v) => `${v}px`);
  const glowY = useTransform(mouseY, (v) => `${v}px`);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setTimeout(() => setRipple(null), 600);
    },
    []
  );

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      variants={item}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="relative flex items-center gap-4 w-full px-5 py-4 rounded-xl bg-card/60 backdrop-blur-md border border-border/40 hover:border-primary/60 transition-all group overflow-hidden"
      style={{ willChange: "transform" }}
    >
      {/* Glow follow cursor */}
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-primary/20 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ left: glowX, top: glowY, x: "-50%", y: "-50%" }}
      />

      {/* Ripple effect */}
      {ripple && (
        <motion.span
          className="absolute rounded-full bg-primary/30 pointer-events-none"
          initial={{ width: 0, height: 0, opacity: 0.6 }}
          animate={{ width: 300, height: 300, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            left: ripple.x,
            top: ripple.y,
            x: "-50%",
            y: "-50%",
          }}
        />
      )}

      {/* Shine sweep on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden rounded-xl pointer-events-none">
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      </div>

      <motion.span
        className="relative text-2xl w-8 flex-shrink-0 text-center"
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

      {/* Arrow indicator */}
      <motion.span
        className="absolute right-4 text-muted-foreground/40 group-hover:text-primary/70 transition-colors"
        initial={{ x: 0, opacity: 0 }}
        whileHover={{ x: 3 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 + index * 0.1 }}
      >
        ›
      </motion.span>
    </motion.a>
  );
};

const LinkInBio = () => {
  const [bgOpacity, setBgOpacity] = useState(0.4);

  // Subtle lightning flash effect
  useEffect(() => {
    const flash = () => {
      setBgOpacity(0.25);
      setTimeout(() => setBgOpacity(0.4), 150);
      setTimeout(() => setBgOpacity(0.3), 300);
      setTimeout(() => setBgOpacity(0.4), 450);
    };
    const interval = setInterval(flash, Math.random() * 4000 + 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <motion.img
        src={bgLightning}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      <motion.div
        className="absolute inset-0 bg-background"
        animate={{ opacity: bgOpacity }}
        transition={{ duration: 0.15 }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/80 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent z-[1]" />

      <Particles />

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-auto px-4 py-10 flex flex-col items-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Logo */}
        <motion.img
          src={logo}
          alt={PROFILE.name}
          className="w-56 md:w-64 mb-4 drop-shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
          variants={logoAnim}
        />

        {/* Avatar with animated ring */}
        <motion.div variants={item} className="mb-3 relative">
          {/* Rotating glow ring */}
          <motion.div
            className="absolute -inset-1 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, hsl(var(--primary)), transparent 40%, transparent 60%, hsl(var(--primary)))",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          {/* Pulse ring */}
          <motion.div
            className="absolute -inset-2 rounded-full border border-primary/30"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative w-20 h-20 rounded-full border-2 border-primary overflow-hidden shadow-lg shadow-primary/40">
            <img
              src={PROFILE.avatar}
              alt={PROFILE.name}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Name with glow */}
        <motion.h1
          variants={item}
          className="text-2xl md:text-3xl font-bold tracking-[0.25em] text-foreground mb-2 drop-shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
        >
          {PROFILE.name}
        </motion.h1>

        {/* Social */}
        <motion.div variants={item} className="mb-8">
          <motion.a
            href={PROFILE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/70 hover:text-primary transition-colors duration-300"
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Instagram size={22} />
          </motion.a>
        </motion.div>

        {/* Links */}
        <div className="w-full space-y-3">
          {LINKS.map((link, i) => (
            <LinkCard key={i} link={link} index={i} />
          ))}
        </div>

        {/* Footer */}
        <motion.p
          variants={item}
          className="mt-10 text-xs text-muted-foreground/50"
        >
          © 2026 {PROFILE.name}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LinkInBio;
