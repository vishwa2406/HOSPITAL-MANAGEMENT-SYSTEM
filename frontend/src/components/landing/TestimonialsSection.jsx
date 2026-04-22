import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedSectionHeader, StaggerContainer } from "./AnimatedSection";

const tiltReveal = {
  hidden: { opacity: 0, y: 40, rotate: -2, scale: 0.95 },
  visible: { opacity: 1, y: 0, rotate: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function TestimonialsSection() {
  const { data: testimonials } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      try {
        const response = await api.get("/content/testimonials");
        return response.data && response.data.length > 0 ? response.data : [];
      } catch (e) {
        console.error("Failed to fetch testimonials:", e);
        return [];
      }
    },
  });

  const items = testimonials || [];

  return (
    <section className="py-24 bg-muted relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSectionHeader
          badge="Real Experiences"
          title="What Our Patients Say"
        />

        <StaggerContainer className="grid md:grid-cols-3 gap-8" stagger={0.15}>
          {items.map((t, i) => (
            <motion.div 
              key={t._id || i}
              variants={tiltReveal}
              whileHover={{ y: -8, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12)" }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-8 rounded-3xl bg-card shadow-sm border border-border flex flex-col relative group"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Quote className="absolute top-6 right-8 h-12 w-12 text-slate-50 group-hover:text-primary/10 transition-colors" />
              </motion.div>
              
              <div className="flex gap-1 mb-6 relative z-10">
                {Array.from({ length: 5 }).map((_, si) => (
                  <motion.div
                    key={si}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + si * 0.08, type: "spring", stiffness: 500 }}
                  >
                    <Star className={`h-4 w-4 ${si < t.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                  </motion.div>
                ))}
              </div>
              
              <p className="text-muted-foreground mb-8 leading-relaxed italic relative z-10">"{t.message}"</p>
              
              <div className="flex items-center gap-4 mt-auto">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold"
                >
                  {t.name.charAt(0)}
                </motion.div>
                <div>
                  <p className="font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{t.role || "Verified Patient"}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
