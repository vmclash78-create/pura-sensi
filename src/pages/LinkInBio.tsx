import { Instagram } from "lucide-react";
import { motion } from "framer-motion";
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
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const LinkInBio = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <img
        src={bgLightning}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden
      />
      <div className="absolute inset-0 bg-background/40" />

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
          className="w-56 md:w-64 mb-4 drop-shadow-2xl"
          variants={item}
        />

        {/* Avatar */}
        <motion.div variants={item} className="mb-3">
          <div className="w-20 h-20 rounded-full border-2 border-primary overflow-hidden shadow-lg shadow-primary/30">
            <img
              src={PROFILE.avatar}
              alt={PROFILE.name}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Name */}
        <motion.h1
          variants={item}
          className="text-2xl md:text-3xl font-bold tracking-[0.25em] text-foreground mb-2"
        >
          {PROFILE.name}
        </motion.h1>

        {/* Social */}
        <motion.div variants={item} className="mb-8">
          <a
            href={PROFILE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/70 hover:text-primary transition-colors"
          >
            <Instagram size={22} />
          </a>
        </motion.div>

        {/* Links */}
        <div className="w-full space-y-3">
          {LINKS.map((link, i) => (
            <motion.a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              variants={item}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 w-full px-5 py-4 rounded-xl bg-card/70 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:bg-card/90 transition-all group"
            >
              <span className="text-2xl w-8 flex-shrink-0 text-center">
                {link.icon}
              </span>
              <div className="flex-1 text-center pr-8">
                <span className="text-sm font-semibold tracking-wider text-foreground group-hover:text-primary transition-colors">
                  {link.label}
                </span>
                {link.subtitle && (
                  <span className="block text-xs text-muted-foreground">
                    {link.subtitle}
                  </span>
                )}
              </div>
            </motion.a>
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
