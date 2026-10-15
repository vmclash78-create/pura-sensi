import { motion, useReducedMotion } from "framer-motion";

const particles = [
  { left: "12%", top: "18%", duration: 12, delay: 0 },
  { left: "82%", top: "14%", duration: 15, delay: 1 },
  { left: "24%", top: "42%", duration: 13, delay: 2 },
  { left: "74%", top: "38%", duration: 16, delay: 0.5 },
  { left: "16%", top: "68%", duration: 14, delay: 3 },
  { left: "88%", top: "72%", duration: 12, delay: 1.5 },
  { left: "48%", top: "28%", duration: 17, delay: 2.5 },
  { left: "58%", top: "82%", duration: 15, delay: 0.8 },
];

const Particles = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/40"
          style={{ left: particle.left, top: particle.top }}
          initial={false}
          animate={
            reduceMotion
              ? { opacity: 0.35 }
              : {
                  x: [0, 12, -8, 0],
                  y: [0, -20, 10, 0],
                  opacity: [0.15, 0.65, 0.25, 0.15],
                }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: particle.duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: particle.delay,
                }
          }
        />
      ))}
    </div>
  );
};

export default Particles;
