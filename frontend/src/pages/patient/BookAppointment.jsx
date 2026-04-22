import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  User, Calendar as CalendarIcon, Clock,
  Info, AlertCircle, CalendarX
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

// Strictly 9 AM to 5 PM only
const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM"
];

const convertTo24h = (timeStr) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

const isTimeInRange = (slot, range) => {
  const slot24 = convertTo24h(slot);
  return slot24 >= range.start && slot24 <= range.end;
};

export default function BookAppointment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [searchParams] = useSearchParams();
  const preSelectedDoctorId = searchParams.get("doctor_id");

  useEffect(() => {
    if (preSelectedDoctorId) {
      setDoctorId(preSelectedDoctorId);
    }
  }, [preSelectedDoctorId]);

  const { data: doctors } = useQuery({
    queryKey: ["doctors-for-booking"],
    queryFn: async () => {
      const response = await api.get("/appointments/doctors");
      return response.data || [];
    },
  });

  const { data: slotData } = useQuery({
    queryKey: ["booked-slots", doctorId, date],
    queryFn: async () => {
      const response = await api.get(`/appointments/doctor/${doctorId}/booked-slots?date=${date}`);
      return response.data;
    },
    enabled: !!doctorId && !!date,
  });

  useEffect(() => {
    if (slotData?.isFullyBlocked) {
      setShowBlockedModal(true);
      setTime("");
    }
  }, [slotData, date]);

  // Booking Mutation
  const bookingMutation = useMutation({
    mutationFn: async (appointmentData) => {
      const response = await api.post("/appointments/appointments", appointmentData);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Appointment Requested!", description: "You'll be notified once the doctor approves." });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["booked-slots"] });
      navigate("/patient/appointments");
    },
    onError: (err) => {
      toast({ title: "Failed to book", description: err.response?.data?.message || err.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user || !time || !doctorId) {
      toast({ title: "Missing fields", description: "Please select a doctor, date and time.", variant: "destructive" });
      return;
    }
    
    bookingMutation.mutate({
      doctorId,
      appointmentDate: date,
      appointmentTime: time,
      notes,
    });
  };

  const loading = bookingMutation.isPending;
  const selectedDoctor = doctors?.find((d) => d._id === doctorId);

  const getSlotStatus = (slot) => {
    const isToday = date === new Date().toISOString().split("T")[0];
    if (isToday) {
      const now = new Date();
      const current24 = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const slot24 = convertTo24h(slot);
      if (slot24 < current24) return "past";
    }

    if (slotData?.booked?.includes(slot)) return "booked";
    const isUnavailable = slotData?.unavailableRanges?.some(range => isTimeInRange(slot, range));
    if (isUnavailable) return "unavailable";
    return "available";
  };

  return (
    <DashboardLayout role="patient">
      <div className="max-w-6xl mx-auto py-4 px-2 sm:px-4">
        <header className="mb-8 text-center lg:text-left">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl lg:text-4xl font-black text-foreground tracking-tight"
          >
            Book <span className="text-primary italic">Consultation</span>
          </motion.h1>
          <p className="text-muted-foreground font-medium mt-2 text-sm">Schedule your appointment with top-tier medical specialists. Available: 9:00 AM - 5:00 PM</p>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 space-y-6"
          >
            {/* Step 1: Doctor & Date */}
            <div className="bg-card p-6 rounded-3xl shadow-sm border border-border flex flex-col md:flex-row gap-5 transition-colors duration-300">
              <div className="flex-1 space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Specialist</Label>
                <Select value={doctorId} onValueChange={(val) => { setDoctorId(val); setTime(""); }}>
                  <SelectTrigger className="h-13 rounded-2xl border-border bg-muted/20 focus:ring-primary/20 text-foreground text-sm">
                    <SelectValue placeholder="Choose your doctor" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border bg-card">
                    {doctors?.map((d) => (
                      <SelectItem key={d._id} value={d._id} className="rounded-xl text-sm">
                        {d.userId?.fullName} - {d.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-56 space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Session Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setTime(""); }}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="h-13 rounded-2xl border-border bg-muted/20 focus:ring-primary/20 text-foreground text-sm"
                />
              </div>
            </div>

            {/* Step 2: Time Slots */}
            <AnimatePresence mode="wait">
              {doctorId && !slotData?.isFullyBlocked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-card p-6 lg:p-8 rounded-3xl shadow-sm border border-border transition-colors duration-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" /> Select Time Slot
                    </h3>
                    <div className="flex gap-3 text-[10px] font-black uppercase tracking-tighter">
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-green-500 rounded-full" />Available</div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-red-500 rounded-full" />Booked</div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />Unavailable</div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-sky-400 rounded-full" />Selected</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {timeSlots.map((t) => {
                      const status = getSlotStatus(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={status !== "available"}
                          onClick={() => setTime(t)}
                          className={cn(
                            "h-14 rounded-2xl font-black text-xs transition-all duration-300 border-2",
                            status === "available" && time === t
                              ? "bg-sky-400 text-white border-sky-500 shadow-lg shadow-sky-200 scale-105"
                              : status === "available"
                              ? "bg-green-500 text-white border-green-600 hover:bg-green-600 hover:scale-102"
                              : status === "booked"
                              ? "bg-red-500 text-white border-red-600 cursor-not-allowed opacity-80"
                              : status === "unavailable"
                              ? "bg-orange-500 text-white border-orange-600 cursor-not-allowed opacity-80"
                              : "bg-slate-100 text-slate-500 border-slate-300 cursor-not-allowed opacity-80"
                          )}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fully Blocked */}
            <AnimatePresence>
              {slotData?.isFullyBlocked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 bg-orange-500/10 rounded-3xl border-2 border-dashed border-orange-500/20 text-center space-y-3"
                >
                  <CalendarX className="w-14 h-14 text-orange-400 mx-auto" />
                  <h3 className="text-lg font-black text-orange-500 uppercase tracking-tight">Physician Unavailable</h3>
                  <p className="text-orange-500/70 font-medium text-sm max-w-md mx-auto">
                    The doctor is unavailable on the selected date. Please choose another date.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Notes & Submit */}
            {time && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border p-6 lg:p-8 rounded-3xl space-y-6"
              >
                <div className="p-4 bg-primary/10 rounded-2xl flex items-center gap-3">
                  <Info className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-sm text-primary font-semibold">
                    Appointment with <strong>{selectedDoctor?.userId?.fullName}</strong> on <strong>{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong> at <strong>{time}</strong>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Symptoms / Notes (Optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe your symptoms or reason for visit..."
                    className="rounded-2xl min-h-[100px] font-medium text-sm"
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-all duration-300 font-black text-base shadow-xl shadow-primary/20"
                >
                  {loading ? "Submitting..." : "Confirm & Book Appointment"}
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Doctor Card */}
          <div className="lg:col-span-4 space-y-4">
            <AnimatePresence>
              {selectedDoctor ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card p-8 rounded-3xl border border-border shadow-sm sticky top-6 text-center transition-colors duration-300"
                >
                  <div className="w-24 h-24 rounded-3xl bg-primary/10 border-4 border-card shadow-xl overflow-hidden mx-auto mb-4">
                    {selectedDoctor.profileImage ? (
                      <img src={selectedDoctor.profileImage} alt={selectedDoctor.userId?.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary text-3xl font-black">
                        {selectedDoctor.userId?.fullName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-foreground">{selectedDoctor.userId?.fullName}</h3>
                  <p className="text-primary font-black uppercase tracking-widest text-xs mt-1">{selectedDoctor.specialization}</p>
                  {selectedDoctor.experience && (
                    <p className="text-muted-foreground text-sm mt-2">{selectedDoctor.experience} years experience</p>
                  )}
                  {selectedDoctor.consultationFee && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-2xl">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Consultation Fee</p>
                      <p className="text-lg font-black text-foreground">Rs. {selectedDoctor.consultationFee}</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="bg-muted/30 border-2 border-dashed border-border rounded-3xl p-10 text-center text-muted-foreground">
                  <CalendarIcon className="w-8 h-8 opacity-50 mx-auto mb-3" />
                  <p className="text-xs font-black uppercase tracking-widest">Select a Physician</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AlertDialog open={showBlockedModal} onOpenChange={setShowBlockedModal}>
        <AlertDialogContent className="rounded-3xl border-border bg-card p-8 shadow-2xl">
          <AlertDialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
            <AlertDialogTitle className="text-xl font-black text-foreground">Physician Unavailable</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium text-sm">
              Doctor is unavailable on the selected date. Please choose another date or specialist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogAction className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest border-none">
              Acknowledged
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
