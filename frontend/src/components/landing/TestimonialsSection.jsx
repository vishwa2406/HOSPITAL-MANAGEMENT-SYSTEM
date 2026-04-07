import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const fallbackTestimonials = [
  { _id: "1", name: "Rajesh Kumar", message: "Excellent care and professional staff. The doctors were very attentive and explained everything clearly.", rating: 5, role: "Patient" },
  { _id: "2", name: "Priya Sharma", message: "Clean facility with modern equipment. Very satisfied with the treatment and the follow-up care provided.", rating: 5, role: "Patient" },
  { _id: "3", name: "Amit Patel", message: "Quick appointment booking and efficient service. Highly recommended for specialized heart care!", rating: 4, role: "Patient" },
];

export default function TestimonialsSection() {
  const { data: testimonials } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      try {
        const response = await api.get("/content/testimonials");
        return response.data && response.data.length > 0 ? response.data : fallbackTestimonials;
      } catch (e) {
        return fallbackTestimonials;
      }
    },
  });

  const items = testimonials || fallbackTestimonials;

  return (
    <section className="py-24 bg-muted relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-widest uppercase text-sm mb-3 block">Real Experiences</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">What Our Patients Say</h2>
          <div className="h-1.5 w-20 bg-primary mx-auto rounded-full mb-6" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((t, i) => (
            <motion.div 
              key={t._id || i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-card shadow-sm border border-border flex flex-col relative group"
            >
              <Quote className="absolute top-6 right-8 h-12 w-12 text-slate-50 group-hover:text-primary/10 transition-colors" />
              
              <div className="flex gap-1 mb-6 relative z-10">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                ))}
              </div>
              
              <p className="text-muted-foreground mb-8 leading-relaxed italic relative z-10">"{t.message}"</p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{t.role || "Verified Patient"}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
