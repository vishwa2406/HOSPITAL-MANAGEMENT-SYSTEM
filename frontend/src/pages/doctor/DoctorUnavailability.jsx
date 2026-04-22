import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Calendar, Clock, Trash2, 
  Sun, CalendarDays, Hourglass
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function DoctorUnavailability() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [mode, setMode] = useState("full-day"); // 'full-day' | 'time-block' | 'multi-day'
  const [selectionPhase, setSelectionPhase] = useState("start");
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: ""
  });

  const timeOptions = [
    "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00"
  ];

  const handleTimeClick = (t) => {
    if (selectionPhase === "start" || !formData.startTime) {
      setFormData({...formData, startTime: t, endTime: ""});
      setSelectionPhase("end");
    } else {
      if (t <= formData.startTime) {
        setFormData({...formData, startTime: t, endTime: ""});
        setSelectionPhase("end");
      } else {
        setFormData({...formData, endTime: t});
        setSelectionPhase("start");
      }
    }
  };

  const { data: unavailabilities, isLoading } = useQuery({
    queryKey: ["doctor-unavailability"],
    queryFn: async () => {
      const response = await api.get("/appointments/doctor/unavailability");
      return response.data;
    }
  });

  const setMutation = useMutation({
    mutationFn: async (data) => {
      await api.post("/appointments/doctor/unavailability", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-unavailability"] });
      toast({ title: "Schedule Updated", description: "Your unavailability has been recorded successfully." });
      setFormData({ startDate: "", endDate: "", startTime: "09:00", endTime: "17:00" });
    },
    onError: (err) => {
      toast({ title: "Failed to Update", description: err.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/appointments/doctor/unavailability/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-unavailability"] });
      toast({ title: "Restriction Removed", description: "Your schedule has been cleared for that period." });
    }
  });

  const handleSubmit = () => {
    if (mode === "full-day") {
      setMutation.mutate({
        type: "Within a Day",
        startDate: formData.startDate,
        endDate: formData.startDate,
        startTime: "00:00",
        endTime: "23:59"
      });
    } else if (mode === "time-block") {
      setMutation.mutate({
        type: "Within a Day",
        startDate: formData.startDate,
        endDate: formData.startDate,
        startTime: formData.startTime,
        endTime: formData.endTime
      });
    } else if (mode === "multi-day") {
      setMutation.mutate({
        type: "Multiple Days",
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: "00:00",
        endTime: "23:59"
      });
    }
  };

  const isFormValid = () => {
    if (mode === "full-day" || mode === "time-block") return !!formData.startDate && (mode === "full-day" || (!!formData.startTime && !!formData.endTime));
    if (mode === "multi-day") return !!formData.startDate && !!formData.endDate;
    return false;
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-10">
        <header>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-foreground tracking-tight"
          >
            Leave <span className="text-primary italic">& Schedule</span>
          </motion.h1>
          <p className="text-muted-foreground font-medium mt-2">Easily manage your clinical blackouts so patients know when you aren't available.</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
          <div className="xl:col-span-8 flex flex-col gap-6">
            
            {/* Mode Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => { setMode("full-day"); setFormData({...formData, startTime: "00:00", endTime: "23:59"}); }}
                className={cn("p-6 rounded-3xl border-2 transition-all duration-300 text-left flex flex-col items-start gap-4 hover:shadow-xl", mode === "full-day" ? "bg-primary text-white border-primary shadow-primary/20 scale-[1.02]" : "bg-card border-border hover:border-primary/50")}
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", mode === "full-day" ? "bg-white/20" : "bg-primary/10 text-primary")}>
                  <Sun className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Full Day Off</h3>
                  <p className={cn("text-xs font-medium mt-1 opacity-80", mode === "full-day" ? "text-white" : "text-muted-foreground")}>Take whole day leave</p>
                </div>
              </button>
              
              <button 
                onClick={() => { setMode("time-block"); setFormData({...formData, startTime: "", endTime: ""}); setSelectionPhase("start"); }}
                className={cn("p-6 rounded-3xl border-2 transition-all duration-300 text-left flex flex-col items-start gap-4 hover:shadow-xl", mode === "time-block" ? "bg-primary text-white border-primary shadow-primary/20 scale-[1.02]" : "bg-card border-border hover:border-primary/50")}
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", mode === "time-block" ? "bg-white/20" : "bg-primary/10 text-primary")}>
                  <Hourglass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Specific Hours</h3>
                  <p className={cn("text-xs font-medium mt-1 opacity-80", mode === "time-block" ? "text-white" : "text-muted-foreground")}>Block a few hours</p>
                </div>
              </button>
              
              <button 
                onClick={() => { setMode("multi-day"); setFormData({...formData, startTime: "00:00", endTime: "23:59"}); }}
                className={cn("p-6 rounded-3xl border-2 transition-all duration-300 text-left flex flex-col items-start gap-4 hover:shadow-xl", mode === "multi-day" ? "bg-primary text-white border-primary shadow-primary/20 scale-[1.02]" : "bg-card border-border hover:border-primary/50")}
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", mode === "multi-day" ? "bg-white/20" : "bg-primary/10 text-primary")}>
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Multi-Day Trip</h3>
                  <p className={cn("text-xs font-medium mt-1 opacity-80", mode === "multi-day" ? "text-white" : "text-muted-foreground")}>Long term vacation</p>
                </div>
              </button>
            </div>

            <Card className="border-none shadow-sm rounded-[3rem] overflow-hidden bg-card mt-2">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black text-foreground">Configure Details</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      {mode === "multi-day" ? "Vacation Starts On" : "Select Date"}
                    </Label>
                    <Input 
                      type="date" 
                      min={today}
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="h-16 rounded-2xl border-border bg-muted/40 font-bold border-2 focus:ring-primary shadow-sm" 
                    />
                  </div>
                  
                  {mode === "multi-day" && (
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Vacation Ends On</Label>
                      <Input 
                        type="date"
                        min={formData.startDate || today}
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="h-16 rounded-2xl border-border bg-muted/40 font-bold border-2 focus:ring-primary shadow-sm" 
                      />
                    </div>
                  )}

                  {mode === "time-block" && (
                    <div className="col-span-1 md:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                          <Clock className="w-4 h-4" /> 
                          {selectionPhase === "start" || !formData.startTime 
                            ? "Step 1: Select Start Time" 
                            : !formData.endTime 
                            ? "Step 2: Select End Time"
                            : "Time Range Selected"}
                        </Label>
                        {(formData.startTime || formData.endTime) && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-[10px] uppercase font-bold text-muted-foreground hover:text-red-500"
                            onClick={() => {
                              setFormData({...formData, startTime: "", endTime: ""});
                              setSelectionPhase("start");
                            }}
                          >
                            Reset
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 max-h-[220px] overflow-y-auto p-4 border-2 border-muted bg-muted/10 rounded-3xl custom-scrollbar shadow-inner">
                        {timeOptions.map((t) => {
                          const isStart = formData.startTime === t;
                          const isEnd = formData.endTime === t;
                          const isBetween = formData.startTime && formData.endTime && t > formData.startTime && t < formData.endTime;
                          const isPastStart = formData.startTime && t <= formData.startTime && selectionPhase === "end";
                          const isSelectingEnd = selectionPhase === "end" && formData.startTime && t > formData.startTime;

                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => handleTimeClick(t)}
                              className={cn(
                                "h-12 rounded-xl font-black text-xs transition-all duration-300 border-2 select-none",
                                isStart || isEnd 
                                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-105" 
                                  : isBetween 
                                  ? "bg-primary/20 text-primary border-primary/20"
                                  : isSelectingEnd
                                  ? "bg-card text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                                  : isPastStart
                                  ? "bg-muted text-muted-foreground border-transparent opacity-50 cursor-not-allowed"
                                  : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                              )}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                      
                      {formData.startTime && formData.endTime && (
                        <div className="flex items-center justify-center p-3 bg-primary/10 rounded-2xl border border-primary/20 mt-4">
                          <p className="text-sm font-bold text-primary">
                            Selected Block: <span className="text-foreground mx-2">{formData.startTime}</span> to <span className="text-foreground mx-2">{formData.endTime}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={handleSubmit}
                    disabled={setMutation.isPending || !isFormValid()}
                    className="w-full md:w-auto px-10 h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-sm shadow-xl transition-all hover:scale-[1.02]"
                  >
                    {setMutation.isPending ? "Configuring..." : "Confirm Leave"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-4 space-y-6">
             <div className="bg-card rounded-[3rem] border border-border p-8 shadow-sm h-full max-h-[800px] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-xl font-black text-foreground">Leave History</h2>
                   <Badge className="bg-primary/10 text-primary border-none font-bold px-3 py-1">
                      {unavailabilities?.length || 0} Records
                   </Badge>
                </div>

                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
                   {unavailabilities?.map((u, i) => (
                      <motion.div 
                        key={u._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-5 bg-muted/30 rounded-3xl border border-border group hover:bg-muted/60 transition-all flex items-center justify-between"
                      >
                         <div className="space-y-1.5 flex-1">
                            {u.type === 'Multiple Days' ? (
                              <p className="font-bold text-foreground text-sm tracking-tight">{new Date(u.startDate).toLocaleDateString()} <span className="opacity-50 mx-1">to</span> {new Date(u.endDate).toLocaleDateString()}</p>
                            ) : (
                              <p className="font-bold text-foreground tracking-tight">{new Date(u.startDate).toLocaleDateString()}</p>
                            )}
                            <div className="flex flex-wrap gap-2">
                               <Badge variant="outline" className="text-[9px] font-black uppercase bg-background rounded-lg">
                                 {u.type === 'Multiple Days' ? 'Vacation' : u.startTime === '00:00' && u.endTime === '23:59' ? 'Full Day Leave' : 'Hourly Block'}
                               </Badge>
                               {!(u.startTime === '00:00' && u.endTime === '23:59') && (
                                  <Badge variant="secondary" className="text-[9px] font-bold text-primary bg-primary/5 border-none rounded-lg flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" /> {u.startTime} to {u.endTime}
                                  </Badge>
                               )}
                            </div>
                         </div>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="rounded-2xl h-10 w-10 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 flex-shrink-0 ml-2 shadow-sm border border-transparent hover:border-red-500/20"
                           disabled={deleteMutation.isPending}
                           onClick={() => {
                             if (confirm("Are you sure you want to cancel this leave block?")) {
                               deleteMutation.mutate(u._id)
                             }
                           }}
                         >
                            <Trash2 className="w-4 h-4" />
                         </Button>
                      </motion.div>
                   ))}
                   {unavailabilities?.length === 0 && (
                      <div className="text-center py-16 grayscale opacity-60">
                         <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                         <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">No Upcoming Leaves</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
