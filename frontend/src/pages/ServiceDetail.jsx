import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, CalendarPlus, Heart, Brain, Bone, Baby, Eye, Stethoscope } from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { useAuth } from "@/contexts/AuthContext";

const iconMap = {
  Heart: <Heart className="h-12 w-12" />,
  Brain: <Brain className="h-12 w-12" />,
  Bone: <Bone className="h-12 w-12" />,
  Baby: <Baby className="h-12 w-12" />,
  Eye: <Eye className="h-12 w-12" />,
  Stethoscope: <Stethoscope className="h-12 w-12" />,
};

const fallbackServices = [
  { id: "1", title: "Cardiology", description: "Advanced heart care and diagnostics using the latest technology. Our cardiology department specializes in treating complex heart diseases and providing preventative care.", icon: "Heart" },
  { id: "2", title: "Neurology", description: "Expert brain, spine and nervous system treatment for all ages. We offer state-of-the-art diagnostics and therapies for neurological conditions.", icon: "Brain" },
  { id: "3", title: "Orthopedics", description: "Comprehensive bone and joint care from specialists. Recover your mobility with our world-class treatments and rehabilitation programs.", icon: "Bone" },
  { id: "4", title: "Pediatrics", description: "Compassionate child healthcare from birth through adolescence. Your child's health and happiness is our priority.", icon: "Baby" },
  { id: "5", title: "Ophthalmology", description: "Premium eye care and surgical vision services. We provide comprehensive eye exams, laser treatments, and surgical options.", icon: "Eye" },
  { id: "6", title: "General Medicine", description: "Primary healthcare services for your entire family. Routine checkups and prompt medical attention for common illnesses.", icon: "Stethoscope" },
];

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

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

  const allServices = services || fallbackServices;
  const service = allServices.find((s) => s.id === id || s._id === id);

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-bold text-foreground mb-4">Service Not Found</h1>
          <Button onClick={() => navigate("/")}>Go Back Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Header Banner */}
      <div className="bg-primary/5 py-12 md:py-20 border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <BackButton label="Back to Services" className="mb-6" />
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-24 h-24 rounded-2xl bg-card shadow-xl flex items-center justify-center text-primary flex-shrink-0">
              {iconMap[service.icon || "Stethoscope"] || <Stethoscope className="h-12 w-12" />}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">{service.title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">{service.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 max-w-4xl py-12">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">About This Specialty</h2>
              <p className="text-muted-foreground leading-relaxed">
                At LIOHNS, our {service.title} department is equipped with cutting-edge technology and staffed by internationally recognized specialists. 
                We are committed to delivering personalized and compassionate care. 
                Whether you are seeking preventative strategies, diagnostics, or advanced surgical solutions, our team is here to support your journey to health and wellness.
              </p>
            </section>
            
            <section>
              <h3 className="text-xl font-bold text-foreground mb-4">What to Expect</h3>
              <ul className="space-y-3">
                {[
                  "Comprehensive initial consultation and assessment",
                  "State-of-the-art diagnostic testing and imaging",
                  "Personalized treatment plans tailored to your specific needs",
                  "Dedicated follow-up and continuous monitoring",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="md:col-span-1">
            <div className="bg-card p-6 rounded-2xl border border-border shadow-card sticky top-24">
              <h3 className="font-bold text-foreground mb-2">Ready to take the next step?</h3>
              <p className="text-sm text-muted-foreground mb-6">Don't wait to prioritize your health. Book a consultation with our {service.title} specialists today.</p>
              {(role !== 'admin' && role !== 'doctor') && (
                <Button className="w-full h-12 text-md flex items-center justify-center gap-2" onClick={() => navigate("/patient/book")}>
                  <CalendarPlus className="h-5 w-5" /> Book Appointment
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
