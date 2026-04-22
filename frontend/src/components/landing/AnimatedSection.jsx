import { motion } from "framer-motion";

/**
 * Reusable animated section header with staggered reveal.
 * Wraps subtitle badge, title, divider, and description with scroll-triggered animations.
 */
export function AnimatedSectionHeader({ badge, title, description, align = "center", children }) {
  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const scaleIn = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: { scaleX: 1, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={`mb-16 ${align === "center" ? "text-center" : "text-left"}`}
    >
      {badge && (
        <motion.span variants={fadeUp} className="text-primary font-bold tracking-widest uppercase text-sm mb-3 block">
          {badge}
        </motion.span>
      )}
      {title && (
        <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
          {title}
        </motion.h2>
      )}
      <motion.div variants={scaleIn} className="h-1.5 w-20 bg-primary rounded-full mb-6" style={align === "center" ? { margin: "0 auto 1.5rem" } : {}} />
      {description && (
        <motion.p variants={fadeUp} className="text-foreground/70 max-w-2xl mx-auto text-lg leading-relaxed">
          {description}
        </motion.p>
      )}
      {children}
    </motion.div>
  );
}

/**
 * Stagger container for card grids - children animate in sequence.
 */
export function StaggerContainer({ children, className = "", stagger = 0.1, delay = 0 }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Common card animation variants */
export const cardVariants = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  },
  tiltIn: {
    hidden: { opacity: 0, y: 30, rotateX: 10 },
    visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.6, ease: "easeOut" } },
  },
};

/** Button hover/tap animation props */
export const buttonHoverTap = {
  whileHover: { scale: 1.05, transition: { type: "spring", stiffness: 400 } },
  whileTap: { scale: 0.95 },
};
