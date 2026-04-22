import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { 
  FileText, User as UserIcon, Calendar, 
  Search, Pill, History, ChevronRight,
  TrendingUp, Activity, Briefcase, Clock,
  UtensilsCrossed, X, Mail, Phone, Tag
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogDescription
} from "@/components/ui/dialog";

export default function PatientHistory() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const { data: doctor } = useQuery({
    queryKey: ["doctor-self-history", user?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/doctor/me");
      return response.data;
    },
    enabled: !!user,
  });

  const { data: appointments } = useQuery({
    queryKey: ["doctor-patient-history", doctor?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/appointments");
      return response.data || [];
    },
    enabled: !!doctor,
  });

  const patientsSeen = Array.from(new Set(appointments?.map(a => a.patientId?._id)))
    .map(id => appointments?.find(a => a.patientId?._id === id)?.patientId)
    .filter(p => p && p.fullName.toLowerCase().includes(search.toLowerCase()));

  const { data: prescriptions } = useQuery({
    queryKey: ["patient-prescriptions", selectedPatient?._id],
    queryFn: async () => {
      const response = await api.get(`/prescriptions/patient/${selectedPatient._id}`);
      return response.data || [];
    },
    enabled: !!selectedPatient,
  });

  const patientAppts = appointments?.filter(a => a.patientId?._id === selectedPatient?._id) || [];

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-black text-foreground tracking-tight"
            >
              Clinical <span className="text-primary italic">Journals</span>
            </motion.h1>
            <p className="text-muted-foreground font-medium mt-2">Comprehensive medical history and session archives.</p>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search patients by name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-14 pl-12 rounded-2xl border-border bg-card w-full md:w-80 shadow-sm focus:ring-primary/20"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {patientsSeen.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-card rounded-[3rem] border-2 border-dashed border-border">
               <UserIcon className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
               <p className="font-bold text-muted-foreground">No patient records found.</p>
            </div>
          ) : (
            patientsSeen.map((patient, i) => (
              <motion.div
                key={patient._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card 
                  className="group bg-card rounded-[2.5rem] border border-border p-8 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col items-center text-center relative overflow-hidden cursor-pointer"
                  onClick={() => setSelectedPatient(patient)}
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-primary/10 group-hover:h-full group-hover:opacity-[0.02] transition-all duration-500" />
                  
                  <div className="w-24 h-24 rounded-3xl bg-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-3xl font-black text-primary uppercase">{patient.fullName[0]}</span>
                  </div>

                  <h3 className="text-xl font-black text-foreground mb-1">{patient.fullName}</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">{patient.email?.toLowerCase()}</p>
                    
                  <div className="mt-auto flex items-center justify-between w-full text-muted-foreground text-xs font-bold">
                     <span className="flex items-center gap-2">
                        <History className="w-4 h-4 text-primary" /> 
                        {appointments?.filter(a => a.patientId?._id === patient._id).length} Sessions
                     </span>
                     <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
           <DialogContent className="max-w-5xl rounded-[3rem] p-0 overflow-hidden border-border bg-background">
               <div className="bg-primary p-12 text-primary-foreground relative">
                 <div className="flex flex-col md:flex-row items-center gap-8">
                   <div className="w-32 h-32 rounded-[2.5rem] bg-primary-foreground/10 flex items-center justify-center border border-primary-foreground/10 shrink-0">
                     <span className="text-5xl font-black text-primary-foreground">{selectedPatient?.fullName[0]}</span>
                   </div>
                   <div className="text-center md:text-left flex-1">
                    <DialogTitle className="text-4xl font-black tracking-tight">{selectedPatient?.fullName}</DialogTitle>
                    <DialogDescription className="text-xs font-bold uppercase tracking-widest mt-2 opacity-90 text-primary-foreground">
                      Comprehensive Clinical Overview & Contact Information
                    </DialogDescription>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-4 opacity-90">
                       <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-foreground">
                         <Mail className="w-4 h-4" /> {selectedPatient?.email?.toLowerCase()}
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-background dark:bg-card p-12 grid grid-cols-1 md:grid-cols-2 gap-10 overflow-y-auto max-h-[60vh]">
                 <div className="space-y-6">
                    <h4 className="text-lg font-black text-foreground flex items-center gap-3">
                       <Calendar className="w-5 h-5 text-primary" /> Appointment Logs
                    </h4>
                    <div className="space-y-4">
                       {patientAppts.map((appt, i) => (
                         <div key={i} className="flex gap-6 p-8 bg-card rounded-[2rem] border border-border shadow-sm">
                           <div className="w-16 h-16 rounded-2xl bg-primary/5 flex flex-col items-center justify-center shrink-0 border border-primary/10">
                             <span className="text-xs font-black text-primary">{new Date(appt.date).toLocaleDateString('en-US', { day: '2-digit' })}</span>
                             <span className="text-[8px] font-black uppercase text-primary/60">{new Date(appt.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                           </div>
                           <div>
                             <h4 className="font-black text-foreground mb-1">{appt.reason || "Consultation"}</h4>
                             <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-90">
                               <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {appt.time}</span>
                               <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> {appt.status}</span>
                             </div>
                           </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h4 className="text-lg font-black text-foreground flex items-center gap-3">
                       <Pill className="w-5 h-5 text-secondary" /> Issued Prescriptions
                    </h4>
                    <div className="space-y-4">
                       {prescriptions?.map((presc, i) => (
                         <Card key={i} className="p-8 bg-card rounded-[2rem] border border-border shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                               <div>
                                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Prescribed on</p>
                                  <p className="font-black text-foreground">{new Date(presc.createdAt).toLocaleDateString()}</p>
                               </div>
                               <FileText className="w-6 h-6 text-primary opacity-50" />
                            </div>
                            <div className="space-y-3">
                               {presc.medicines.map((m, idx) => (
                                 <div key={idx} className="flex justify-between items-center text-sm p-3 bg-muted/30 rounded-xl">
                                    <span className="font-bold text-foreground">Medication: {m.name}</span>
                                    <span className="text-[10px] font-black uppercase text-primary opacity-90"><UtensilsCrossed className="inline w-3 h-3 mr-1" />{m.mealTiming}</span>
                                 </div>
                               ))}
                            </div>
                         </Card>
                       ))}
                       {prescriptions?.length === 0 && (
                         <div className="p-10 text-center bg-muted/20 rounded-[2rem] border-2 border-dashed border-border opacity-80 italic text-muted-foreground text-sm">
                            No prescriptions issued yet.
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
