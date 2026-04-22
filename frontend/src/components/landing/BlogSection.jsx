import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedSectionHeader, StaggerContainer, cardVariants, buttonHoverTap } from "./AnimatedSection";

export default function BlogSection() {
  const navigate = useNavigate();
  const { data: blogs } = useQuery({
    queryKey: ["blogs-public"],
    queryFn: async () => {
      try {
        const response = await api.get("/content/blogs");
        return response.data && response.data.length > 0 ? response.data.slice(0, 3) : [];
      } catch (e) {
        console.error("Failed to fetch blogs:", e);
        return [];
      }
    },
  });

  const items = blogs || [];

  return (
    <section id="blog" className="py-24 bg-muted relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <motion.span
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
              className="text-primary font-bold tracking-widest uppercase text-sm mb-3 block"
            >
              Health Insights
            </motion.span>
            <motion.h2
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
              className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4"
            >
              Latest From Our Blog
            </motion.h2>
            <motion.div
              variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { duration: 0.5 } } }}
              className="h-1.5 w-20 bg-primary rounded-full origin-left"
            />
          </div>
          <motion.div
            variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}
            {...buttonHoverTap}
          >
            <Button 
              onClick={() => navigate("/blogs")}
              variant="ghost" className="text-primary font-bold hover:bg-primary/5 rounded-full px-6 group"
            >
              View All Posts <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>

        <StaggerContainer className="grid md:grid-cols-3 gap-8" stagger={0.15}>
          {items.map((b, i) => (
            <motion.div 
              key={b.id || i}
              variants={cardVariants.tiltIn}
              whileHover={{ y: -8, rotateX: -2, rotateY: 2, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.12)" }}
              transition={{ type: "spring", stiffness: 300 }}
              className="rounded-3xl bg-card shadow-sm overflow-hidden border border-border group"
              style={{ perspective: "1000px" }}
            >
              <Link to={`/blog/${b.id || b._id}`}>
                <div className="h-56 bg-slate-200 overflow-hidden relative">
                  <img 
                    src={b.image || "https://images.unsplash.com/photo-1505751172107-19598f4bc1e2?auto=format&fit=crop&q=80&w=600&h=400"} 
                    alt={b.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    loading="lazy" 
                  />
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="absolute top-4 left-4"
                  >
                     <span className="px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs font-bold text-primary shadow-sm flex items-center gap-1.5">
                       <BookOpen className="h-3 w-3" /> Blog
                     </span>
                  </motion.div>
                </div>
              </Link>
              
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {new Date(b.created_at || b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <span className="text-xs font-bold text-foreground/50">By {b.author || "Medical Staff"}</span>
                </div>
                
                <Link to={`/blog/${b.id || b._id}`}>
                  <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {b.title}
                  </h3>
                </Link>
                
                <p className="text-foreground/60 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {b.content}
                </p>
                
                <motion.div {...buttonHoverTap} className="inline-block">
                  <Link to={`/blog/${b.id || b._id}`} className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide hover:gap-3 transition-all">
                    Read Full Article <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
