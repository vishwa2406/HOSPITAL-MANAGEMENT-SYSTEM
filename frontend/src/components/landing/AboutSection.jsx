import { Shield, Clock, Award, Users, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { icon: <Users className="h-7 w-7" />, value: "50,000+", label: "Patients Treated", color: "bg-blue-500" },
  { icon: <Award className="h-7 w-7" />, value: "100+", label: "Expert Doctors", color: "bg-emerald-500" },
  { icon: <Clock className="h-7 w-7" />, value: "24/7", label: "Emergency Care", color: "bg-rose-500" },
  { icon: <Shield className="h-7 w-7" />, value: "15+", label: "Years of Service", color: "bg-amber-500" },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primary font-bold tracking-widest uppercase text-sm mb-3 block">Our Institutions</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6 leading-tight">
              A Legacy of Healthcare <br />
              <span className="text-primary">Excellence & Innovation</span>
            </h2>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              LIOHNS Hospital is a premier healthcare institution committed to delivering world-class medical services. 
              Our team of experienced professionals ensures personalized care with cutting-edge technology 
              and a heart for service.
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                "State-of-the-art medical equipment",
                "Compassionate and skilled nursing staff",
                "World-renowned specialist doctors",
                "24/7 emergency and intensive care"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  {item}
                </li>
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
            {/* Floating stats card */}
            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-2xl shadow-2xl z-20 hidden md:block border border-slate-100">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
                   <Award className="h-6 w-6" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold text-slate-900">#1 Ranked</p>
                   <p className="text-sm text-slate-500 font-medium">Medical Hub in Region</p>
                 </div>
               </div>
            </div>
            {/* Background pattern */}
            <div className="absolute -top-10 -right-10 w-full h-full border-2 border-primary/20 rounded-3xl -z-0 translate-x-4 translate-y-4" />
          </motion.div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-8 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 group border border-transparent hover:border-slate-100"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white text-slate-900 shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-primary">{s.icon}</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{s.value}</div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
