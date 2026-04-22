import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Search, Calendar, User, ArrowRight, BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "@/components/ui/BackButton";
import ClearableSearch from "@/components/ui/ClearableSearch";

export default function AllBlogs() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data: blogs, isLoading } = useQuery({
    queryKey: ["all-blogs-public"],
    queryFn: async () => {
      const response = await api.get("/content/blogs");
      return response.data || [];
    },
  });

  const filteredBlogs = blogs?.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/30 transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <header className="mb-20">
          {/* Back Button */}
          <BackButton label="Back to Home" className="mb-8" />
          <div className="max-w-3xl">
            <span className="text-secondary font-black tracking-[0.3em] uppercase text-xs mb-4 block">Medical Insights</span>
            <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tighter leading-[0.9] uppercase">Health <span className="text-secondary italic font-serif lowercase">Knowledge</span> <br />Base</h1>
            <p className="text-muted-foreground font-medium mt-6 text-xl leading-relaxed">Expert articles, clinical updates, and health tips from our medical team.</p>
          </div>
          
          <div className="mt-10 max-w-xl mx-auto bg-card p-1.5 rounded-[2rem] shadow-lg shadow-primary/5 border border-border group focus-within:border-primary/30 transition-all duration-500">
            <ClearableSearch
              value={search}
              onChange={setSearch}
              placeholder="Search medical archives..."
              leftIcon={Search}
              className="w-full"
              inputClassName="h-14 bg-transparent border-none focus:bg-transparent shadow-none text-lg font-bold placeholder:text-muted-foreground/30 text-foreground"
            />
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[500px] bg-muted rounded-[3rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <AnimatePresence>
              {filteredBlogs?.map((b, i) => (
                <motion.div
                  key={b._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group flex flex-col h-full bg-card rounded-[3rem] border border-border hover:border-primary/20 hover:bg-card hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden"
                >
                  <Link to={`/blog/${b._id}`} className="block relative h-72 overflow-hidden">
                    <img 
                      src={b.image || "https://images.unsplash.com/photo-1576091160550-217359f42f8c?w=800"} 
                      alt={b.title} 
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                    />
                    <div className="absolute top-6 left-6">
                      <span className="px-4 py-2 bg-primary/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm border border-primary/10">
                        Article
                      </span>
                    </div>
                  </Link>
                  <div className="p-10 flex flex-col flex-1">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <Calendar className="w-3 h-3 text-secondary" />
                        {new Date(b.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <User className="w-3 h-3 text-secondary" />
                        {b.author || "Medical Staff"}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-black text-foreground leading-tight mb-4 group-hover:text-secondary transition-colors">
                      {b.title}
                    </h3>
                    
                    <p className="text-muted-foreground font-medium text-sm line-clamp-3 mb-8 leading-relaxed">
                      {b.content}
                    </p>
                    
                    <div className="mt-auto">
                      <Link to={`/blog/${b._id}`} className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-foreground group-hover:gap-5 transition-all">
                        Read Investigation <ArrowRight className="w-4 h-4 text-secondary" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && filteredBlogs?.length === 0 && (
          <div className="text-center py-40 grayscale opacity-50">
             <BookOpen className="w-20 h-20 mx-auto mb-6 text-foreground" />
            <p className="text-xl font-black uppercase tracking-[0.3em] text-foreground">No Publications Found</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
