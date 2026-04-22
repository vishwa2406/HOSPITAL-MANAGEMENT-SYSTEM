import { Shield, Clock, Award, Users, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedSectionHeader, StaggerContainer, cardVariants } from "./AnimatedSection";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";

const listItemVariant = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.12, duration: 0.4, ease: "easeOut" },
  }),
};

export default function AboutSection() {
  const { data: dbStats } = useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => {
      try {
        const response = await api.get("/content/stats");
        return response.data;
      } catch (e) {
        console.error("Failed to fetch stats:", e);
        return null;
      }
    },
  });

  const displayStats = [
    { icon: <Users className="h-7 w-7" />, value: `${dbStats?.patients?.toLocaleString() || "1,000"}+`, label: "Patients Treated", color: "bg-blue-500" },
    { icon: <Award className="h-7 w-7" />, value: `${dbStats?.doctors || "5"}+`, label: "Expert Doctors", color: "bg-emerald-500" },
    { icon: <Clock className="h-7 w-7" />, value: "24/7", label: "Emergency Care", color: "bg-rose-500" },
    { icon: <Shield className="h-7 w-7" />, value: "15+", label: "Years of Service", color: "bg-amber-500" },
  ];

  return (
    <section id="about" className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="text-primary font-bold tracking-widest uppercase text-sm mb-3 block">Our Institutions</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6 leading-tight">
              A Legacy of Healthcare <br />
              <span className="text-primary">Excellence & Innovation</span>
            </h2>
            <p className="text-foreground/70 text-lg mb-8 leading-relaxed">
              At LIOHNS Hospital, we believe that healthcare is not merely about treating ailments, but about nurturing lives with compassion, precision, and innovation. Established with a commitment to deliver world-class healthcare solutions, we stand as one of Ahmedabad's leading multi-specialty hospitals, trusted by patients and families alike.
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                "State-of-the-art medical equipment",
                "Compassionate and skilled nursing staff",
                "World-renowned specialist doctors",
                "24/7 emergency and intensive care"
              ].map((item, i) => (
                <motion.li
                  key={i}
                  custom={i}
                  variants={listItemVariant}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex items-center gap-3 text-foreground/80 font-medium"
                >
                  <motion.div
                    whileHover={{ scale: 1.3, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  </motion.div>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl bg-slate-100 overflow-hidden shadow-2xl relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800&h=800" 
                alt="Hospital Interior" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating stats card with bounce */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6, type: "spring", bounce: 0.4 }}
              whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
              className="absolute -bottom-10 -left-10 bg-card p-8 rounded-2xl shadow-2xl z-20 hidden md:block border border-border"
            >
               <div className="flex items-center gap-4">
                 <motion.div
                   animate={{ rotate: [0, 5, -5, 0] }}
                   transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                   className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white"
                 >
                   <Award className="h-6 w-6" />
                 </motion.div>
                 <div>
                   <p className="text-2xl font-bold text-foreground">#1 Ranked</p>
                   <p className="text-sm text-foreground/60 font-medium">Medical Hub in Region</p>
                 </div>
               </div>
            </motion.div>
            {/* Background pattern with pulse */}
            <motion.div
              animate={{ scale: [1, 1.02, 1], opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 w-full h-full border-2 border-primary/20 rounded-3xl -z-0 translate-x-4 translate-y-4"
            />
          </motion.div>
        </div>

        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-8" stagger={0.12}>
          {displayStats.map((s, i) => (
            <motion.div 
              key={s.label}
              variants={cardVariants.fadeUp}
              whileHover={{ y: -8, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.15)" }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-center p-8 rounded-2xl bg-muted hover:bg-card transition-all duration-300 group border border-transparent hover:border-border cursor-default"
            >
              <motion.div
                whileHover={{ scale: 1.15, rotate: 10 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-background text-foreground shadow-sm mb-6"
              >
                <span className="text-primary">{s.icon}</span>
              </motion.div>
              <div className="text-3xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{s.value}</div>
              <div className="text-sm font-semibold text-foreground/60 uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
