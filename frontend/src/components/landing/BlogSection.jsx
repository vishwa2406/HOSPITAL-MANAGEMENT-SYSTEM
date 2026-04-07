import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const fallbackBlogs = [
  { id: "1", title: "10 Tips for a Healthy Heart", content: "Regular exercise, balanced diet, and stress management are key to maintaining heart health in your daily routine...", image: "https://images.unsplash.com/photo-1505751172107-19598f4bc1e2?auto=format&fit=crop&q=80&w=600&h=400", created_at: "2025-01-15", author: "Dr. Sarah J." },
  { id: "2", title: "Understanding Diabetes", content: "Diabetes management requires consistent monitoring, lifestyle adjustments, and regular consults with specialists...", image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=600&h=400", created_at: "2025-02-10", author: "Dr. Michael C." },
  { id: "3", title: "Mental Health Matters", content: "Taking care of your mental health is just as important as physical health. Learn how to manage stress effectively...", image: "https://images.unsplash.com/photo-1527137342181-19aab11a8ee1?auto=format&fit=crop&q=80&w=600&h=400", created_at: "2025-03-05", author: "Emily Ross" },
];

export default function BlogSection() {
  const { data: blogs } = useQuery({
    queryKey: ["blogs-public"],
    queryFn: async () => {
      try {
        const response = await api.get("/content/blogs");
        return response.data && response.data.length > 0 ? response.data.slice(0, 3) : fallbackBlogs;
      } catch (e) {
        return fallbackBlogs;
      }
    },
  });

  const items = blogs || fallbackBlogs;

  return (
    <section id="blog" className="py-24 bg-muted relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-primary font-bold tracking-widest uppercase text-sm mb-3 block">Health Insights</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">Latest From Our Blog</h2>
            <div className="h-1.5 w-20 bg-primary rounded-full" />
          </div>
          <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 rounded-full px-6 group">
            View All Posts <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((b, i) => (
            <motion.div 
              key={b.id || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-3xl bg-card shadow-sm overflow-hidden border border-border group hover:translate-y-[-8px] transition-all duration-500"
            >
              <div className="h-56 bg-slate-200 overflow-hidden relative">
                <img 
                  src={b.image || "https://images.unsplash.com/photo-1505751172107-19598f4bc1e2?auto=format&fit=crop&q=80&w=600&h=400"} 
                  alt={b.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  loading="lazy" 
                />
                <div className="absolute top-4 left-4">
                   <span className="px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs font-bold text-primary shadow-sm flex items-center gap-1.5">
                     <BookOpen className="h-3 w-3" /> Blog
                   </span>
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <span className="text-xs font-bold text-slate-300">By {b.author || "Medical Staff"}</span>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {b.title}
                </h3>
                
                <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {b.content}
                </p>
                
                <button className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide group/btn hover:gap-3 transition-all">
                  Read Full Article <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
