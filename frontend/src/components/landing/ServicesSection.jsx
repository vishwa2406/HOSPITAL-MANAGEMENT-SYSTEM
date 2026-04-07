import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Heart, Brain, Bone, Baby, Eye, Stethoscope, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const iconMap = {
  Heart: <Heart className="h-7 w-7" />,
  Brain: <Brain className="h-7 w-7" />,
  Bone: <Bone className="h-7 w-7" />,
  Baby: <Baby className="h-7 w-7" />,
  Eye: <Eye className="h-7 w-7" />,
  Stethoscope: <Stethoscope className="h-7 w-7" />,
};

const fallbackServices = [
  { id: "1", title: "Cardiology", description: "Advanced heart care and diagnostics using the latest technology.", icon: "Heart" },
  { id: "2", title: "Neurology", description: "Expert brain, spine and nervous system treatment for all ages.", icon: "Brain" },
  { id: "3", title: "Orthopedics", description: "Comprehensive bone and joint care from specialists.", icon: "Bone" },
  { id: "4", title: "Pediatrics", description: "Compassionate child healthcare from birth through adolescence.", icon: "Baby" },
  { id: "5", title: "Ophthalmology", description: "Premium eye care and surgical vision services.", icon: "Eye" },
  { id: "6", title: "General Medicine", description: "Primary healthcare services for your entire family.", icon: "Stethoscope" },
];

export default function ServicesSection() {
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      try {
        const response = await api.get("/content/services");
        return response.data && response.data.length > 0 ? response.data : fallbackServices;
      } catch (e) {
        return fallbackServices;
      }
    },
  });

  const items = services || fallbackServices;

  return (
    <section id="services" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full -ml-32 -mb-32 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-widest uppercase text-sm mb-3 block">What We Offer</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">Our Medical Services</h2>
          <div className="h-1.5 w-20 bg-primary mx-auto rounded-full mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            We provide a wide range of medical specialties, each staffed by 
            experienced professionals dedicated to your health.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((s, i) => (
            <motion.div 
              key={s.id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                {iconMap[s.icon || "Stethoscope"] || <Stethoscope className="h-7 w-7" />}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{s.title}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed text-sm">{s.description}</p>
              <Link to={`/services/${s.id || s._id || i}`} className="flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all">
                Learn More <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
