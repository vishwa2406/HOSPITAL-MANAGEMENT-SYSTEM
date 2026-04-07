import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Phone, CalendarPlus, ShieldCheck, Star, Users } from "lucide-react";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero-hospital.jpg";

export default function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[700px] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          src={heroImg} 
          alt="LIOHNS Hospital" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/70 to-transparent z-0" />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium mb-6 backdrop-blur-sm border border-blue-400/30">
              Trusted by 50,000+ Patients
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight mb-6 tracking-tight">
              Modern Care <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-emerald-300">With Compassion</span>
            </h1>
            <p className="text-xl text-blue-100/90 mb-10 max-w-lg leading-relaxed">
              Experience the next generation of healthcare. Book appointments, consult top specialists,
              and get AI-driven health insights instantly.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 px-8 h-14 text-lg font-semibold shadow-xl hover:scale-105 transition-transform" onClick={() => navigate("/patient/book")}>
                <CalendarPlus className="mr-2 h-5 w-5" /> Book Appointment
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 h-14 text-lg">
                <Phone className="mr-2 h-5 w-5" /> Emergency
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <span className="font-bold text-lg">ISO Certified</span>
                </div>
                <p className="text-xs text-blue-200">Safety standards</p>
              </div>
              <div className="text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="font-bold text-lg">4.9/5 Rating</span>
                </div>
                <p className="text-xs text-blue-200">Patient satisfaction</p>
              </div>
              <div className="text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-5 w-5 text-blue-300" />
                  <span className="font-bold text-lg">100+ Doctors</span>
                </div>
                <p className="text-xs text-blue-200">Expert specialists</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 right-0 p-10 hidden lg:block overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-96 h-96 rounded-full border-[32px] border-white/5 -mb-48 -mr-48" 
        />
      </div>
    </section>
  );
}
