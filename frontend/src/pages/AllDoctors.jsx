import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { User, Search, MapPin, Calendar, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import BackButton from "@/components/ui/BackButton";
import ClearableSearch from "@/components/ui/ClearableSearch";

export default function AllDoctors() {
  const [search, setSearch] = useState("");
  const { role } = useAuth();
  const navigate = useNavigate();
  const isDoctor = role === "doctor";

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["all-doctors-public"],
    queryFn: async () => {
      const response = await api.get("/appointments/doctors");
      return response.data || [];
    },
  });

  const filteredDoctors = doctors?.filter(d => 
    d.userId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/30 transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <header className="mb-12 text-center">
          {/* Back Button */}
          <div className="flex justify-start mb-6">
            <BackButton label="Back to Home" />
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight mb-4 lowercase">Our <span className="text-primary italic font-serif">specialists</span></h1>
          <p className="text-muted-foreground font-medium max-w-xl mx-auto uppercase tracking-widest text-xs">A comprehensive directory of our expert medical team.</p>
          
          <div className="mt-10 max-w-xl mx-auto bg-card p-1.5 rounded-[2rem] shadow-lg shadow-primary/5 border border-border group focus-within:border-primary/30 transition-all duration-500">
            <ClearableSearch
              value={search}
              onChange={setSearch}
              placeholder="Locate your specialist..."
              leftIcon={Search}
              className="w-full"
              inputClassName="h-14 bg-transparent border-none focus:bg-transparent shadow-none text-lg font-bold placeholder:text-muted-foreground/30 text-foreground"
            />
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-96 bg-muted rounded-[2.5rem] animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredDoctors?.map((d, i) => (
              <motion.div
                key={d._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-card rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-border overflow-hidden hover:scale-[1.02] hover:shadow-primary/10 transition-all duration-700"
              >
                <div className="h-64 relative overflow-hidden">
                  {d.profileImage ? (
                    <img src={d.profileImage} alt={d.userId?.fullName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <User className="w-20 h-20 text-muted" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm border border-primary/10">
                    {d.experience}+ Years Exp
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-black text-foreground leading-tight">Dr. {d.userId?.fullName}</h3>
                  <p className="text-primary font-bold text-sm mt-1 uppercase tracking-widest">{d.specialization}</p>
                  
                  <div className="flex items-center gap-2 mt-4 text-muted-foreground">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-black text-foreground">4.9</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter ml-1 opacity-80">(120 Reviews)</span>
                  </div>

                  {role !== "doctor" && role !== "admin" && (
                    <Button 
                      onClick={() => navigate(`/patient/book?doctor_id=${d._id}`)}
                      className="w-full mt-8 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                    >
                      Book Appointment
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && filteredDoctors?.length === 0 && (
          <div className="text-center py-40 grayscale opacity-50">
            <Search className="w-20 h-20 mx-auto mb-6" />
            <p className="text-xl font-black uppercase tracking-[0.3em]">No Specialists Indexed</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
