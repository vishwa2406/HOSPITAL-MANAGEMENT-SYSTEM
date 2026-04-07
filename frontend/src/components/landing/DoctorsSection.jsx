import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

const fallbackDoctors = [
  { _id: "1", userId: { fullName: "Dr. Sarah Johnson" }, specialization: "Cardiologist", experience: 15, profileImage: "https://images.unsplash.com/photo-1559839734-2b71cc197ec2?auto=format&fit=crop&q=80&w=300&h=400" },
  { _id: "2", userId: { fullName: "Dr. Michael Chen" }, specialization: "Neurologist", experience: 12, profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=400" },
  { _id: "3", userId: { fullName: "Dr. Emily Williams" }, specialization: "Orthopedic Surgeon", experience: 10, profileImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=400" },
  { _id: "4", userId: { fullName: "Dr. James Anderson" }, specialization: "Pediatrician", experience: 8, profileImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=400" },
];

export default function DoctorsSection() {
  const { data: doctors } = useQuery({
    queryKey: ["doctors-public"],
    queryFn: async () => {
      try {
        const response = await api.get("/appointments/doctors");
        return response.data && response.data.length > 0 ? response.data : fallbackDoctors;
      } catch (e) {
        return fallbackDoctors;
      }
    },
  });

  const items = doctors || fallbackDoctors;

  return (
    <section id="doctors" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-widest uppercase text-sm mb-3 block">Expert Team</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">Meet Our Specialists</h2>
          <div className="h-1.5 w-20 bg-primary mx-auto rounded-full mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Our doctors are leaders in their fields, committed to providing 
            personalized and compassionate care to every patient.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.slice(0, 8).map((d, i) => (
            <div 
              key={d._id || i} 
              className="group relative bg-card rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-border flex flex-col h-full"
            >
              <div className="relative h-64 overflow-hidden">
                {d.profileImage ? (
                  <img 
                    src={d.profileImage} 
                    alt={d.userId?.fullName} 
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                    loading="lazy" 
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <User className="h-20 w-20 text-slate-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <Button variant="secondary" className="w-full bg-background/90 backdrop-blur-sm border-none text-foreground hover:bg-background">
                    Book Appointment
                  </Button>
                </div>
              </div>
              
              <div className="p-6 text-center flex-1 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  {d.userId?.fullName || "Specialist Doctor"}
                </h3>
                <p className="text-primary font-medium text-sm mt-1">{d.specialization}</p>
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-center gap-2 text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">{d.experience}+ Years Experience</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Button variant="outline" className="rounded-full px-8 hover:bg-primary hover:text-white transition-all duration-300 border-primary text-primary">
            View All Specialists
          </Button>
        </div>
      </div>
    </section>
  );
}
