import { Wifi, ShieldCheck, Microscope, Ambulance, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const facilities = [
  { icon: <Microscope className="h-7 w-7" />, title: "Advanced Lab", desc: "State-of-the-art diagnostic laboratory with 24/7 report delivery.", color: "blue" },
  { icon: <Ambulance className="h-7 w-7" />, title: "Emergency Care", desc: "Fully equipped mobile ICUs and rapid response trauma services.", color: "rose" },
  { icon: <ShieldCheck className="h-7 w-7" />, title: "Modern ICU", desc: "Specialized intensive care units with individual patient monitoring.", color: "emerald" },
  { icon: <Wifi className="h-7 w-7" />, title: "Digital Health", desc: "Paperless health records and online consultation infrastructure.", color: "amber" },
];

export default function FacilitiesSection() {
  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.1"/>
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl text-left">
            <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-sm mb-4">
              <Sparkles className="h-4 w-4" />
              <span>World-Class Infrastructure</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 italic">Equipped for Excellence</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Our hospital is equipped with the latest medical technology and 
              infrastructure to provide the best possible care for our patients.
            </p>
          </div>
          <div className="hidden lg:block">
             <div className="h-16 w-[1px] bg-white/20 mx-auto" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {facilities.map((f, i) => (
            <motion.div 
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary transition-all duration-300 text-primary group-hover:text-white">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
