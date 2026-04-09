import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, Clock, Stethoscope, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select as ShadSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

// 9 AM to 5 PM only
const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM"
];

const isPastAppointment = (dateStr, timeStr) => {
  const timeMatch = timeStr?.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!timeMatch) return new Date(dateStr) < new Date();
  let [_, hours, minutes, modifier] = timeMatch;
  hours = parseInt(hours, 10);
  if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
  if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
  const apptDate = new Date(dateStr);
  apptDate.setHours(hours, parseInt(minutes, 10), 0, 0);
  return apptDate < new Date();
};

const statusConfig = {
  approved: { label: "Approved", classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  rejected: { label: "Rejected", classes: "bg-destructive/10 text-destructive border-destructive/20" },
  completed: { label: "Completed", classes: "bg-primary/10 text-primary border-primary/20" },
  cancelled: { label: "Cancelled", classes: "bg-muted text-muted-foreground border-border" },
  pending_reschedule: { label: "Pending Approval", classes: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" },
  pending: { label: "Pending", classes: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" },
};

export default function PatientAppointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rescheduleData, setRescheduleData] = useState(null);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["patient-all-appointments", user?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/appointments");
      return response.data || [];
    },
    enabled: !!user,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.put(`/appointments/appointments/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-all-appointments"] });
      toast({ title: "Appointment Cancelled" });
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/appointments/appointments/${rescheduleData.id}/reschedule`, {
        date: rescheduleData.date,
        time: rescheduleData.time,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-all-appointments"] });
      toast({ title: "Reschedule request submitted!", description: "Waiting for doctor approval." });
      setRescheduleData(null);
    },
    onError: (err) => {
      toast({ title: "Reschedule Failed", description: err.response?.data?.message || err.message, variant: "destructive" });
    }
  });

  return (
    <DashboardLayout role="patient">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground">My Appointments</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage and track all your medical appointments</p>
          </div>
          <Link to="/patient/book">
            <Button className="rounded-2xl h-10 px-5 text-sm font-bold bg-primary text-white shadow-md">
              + Book New
            </Button>
          </Link>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="text-left p-4 font-bold text-muted-foreground text-xs uppercase tracking-widest">Doctor</th>
                  <th className="text-left p-4 font-bold text-muted-foreground text-xs uppercase tracking-widest">Specialization</th>
                  <th className="text-left p-4 font-bold text-muted-foreground text-xs uppercase tracking-widest">Date</th>
                  <th className="text-left p-4 font-bold text-muted-foreground text-xs uppercase tracking-widest">Time</th>
                  <th className="text-left p-4 font-bold text-muted-foreground text-xs uppercase tracking-widest">Status</th>
                  <th className="text-left p-4 font-bold text-muted-foreground text-xs uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : appointments?.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">No appointments found. <Link to="/patient/book" className="text-primary font-bold">Book one now</Link></td></tr>
                ) : (
                  appointments?.map((a) => {
                    const cfg = statusConfig[a.status] || statusConfig.pending;
                    return (
                      <tr key={a._id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-bold text-foreground">{a.doctorId?.userId?.fullName || "Doctor"}</td>
                        <td className="p-4 text-muted-foreground text-sm">{a.doctorId?.specialization || "General"}</td>
                        <td className="p-4 text-foreground text-sm">{new Date(a.date).toLocaleDateString()}</td>
                        <td className="p-4 text-foreground font-medium text-sm">{a.time}</td>
                        <td className="p-4">
                          <span className={`inline-block text-xs px-3 py-1 rounded-full border font-bold ${cfg.classes}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 flex-wrap">
                            {a.status === "approved" && (
                              <Link to={`/chat/${a._id}`}>
                                <Button size="sm" variant="outline" className="h-8 text-xs border-primary/20 text-primary hover:bg-primary/5 rounded-xl">
                                  <MessageSquare className="h-3 w-3 mr-1" /> Chat
                                </Button>
                              </Link>
                            )}
                            {["pending", "approved"].includes(a.status) && !isPastAppointment(a.date, a.time) && (
                              <>
                                <Button size="sm" variant="outline" className="h-8 text-xs hover:bg-muted rounded-xl"
                                  onClick={() => setRescheduleData({ id: a._id, date: a.date.split("T")[0], time: a.time })}>
                                  Reschedule
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="h-8 text-xs text-destructive border-destructive/20 hover:bg-destructive/10 rounded-xl">
                                      Cancel
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="rounded-2xl">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                                      <AlertDialogDescription className="text-muted-foreground">
                                        Are you sure you want to cancel your appointment with Dr. {a.doctorId?.userId?.fullName}? This cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="rounded-xl">No, keep it</AlertDialogCancel>
                                      <AlertDialogAction className="rounded-xl bg-destructive hover:bg-destructive/90"
                                        onClick={() => updateStatus.mutate({ id: a._id, status: "cancelled" })}>
                                        Yes, cancel
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                            {["completed", "rejected", "cancelled"].includes(a.status) && (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-2xl" />)
          ) : appointments?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No appointments. <Link to="/patient/book" className="text-primary font-bold">Book one</Link>
            </div>
          ) : appointments?.map((a) => {
            const cfg = statusConfig[a.status] || statusConfig.pending;
            return (
              <motion.div
                key={a._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-black text-foreground">Dr. {a.doctorId?.userId?.fullName}</p>
                    <p className="text-xs text-muted-foreground">{a.doctorId?.specialization}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border font-bold ${cfg.classes}`}>{cfg.label}</span>
                </div>
                <div className="flex gap-4 text-sm text-foreground">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(a.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {a.time}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {a.status === "approved" && (
                    <Link to={`/chat/${a._id}`}>
                      <Button size="sm" variant="outline" className="h-8 text-xs border-primary/20 text-primary rounded-xl">
                        <MessageSquare className="h-3 w-3 mr-1" /> Chat
                      </Button>
                    </Link>
                  )}
                  {["pending", "approved"].includes(a.status) && !isPastAppointment(a.date, a.time) && (
                    <>
                      <Button size="sm" variant="outline" className="h-8 text-xs rounded-xl"
                        onClick={() => setRescheduleData({ id: a._id, date: a.date.split("T")[0], time: a.time })}>
                        Reschedule
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="h-8 text-xs text-destructive border-destructive/20 rounded-xl">
                            Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                            <AlertDialogDescription>Cancel with Dr. {a.doctorId?.userId?.fullName}?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">No</AlertDialogCancel>
                            <AlertDialogAction className="rounded-xl bg-destructive" onClick={() => updateStatus.mutate({ id: a._id, status: "cancelled" })}>
                              Yes, cancel
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={!!rescheduleData} onOpenChange={(open) => !open && setRescheduleData(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">Reschedule Appointment</DialogTitle>
          </DialogHeader>
          {rescheduleData && (
            <div className="grid gap-5 py-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">New Date</Label>
                <Input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">New Time (9 AM – 5 PM)</Label>
                <ShadSelect value={rescheduleData.time} onValueChange={(v) => setRescheduleData({ ...rescheduleData, time: v })}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {timeSlots.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </ShadSelect>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRescheduleData(null)} className="rounded-xl">Cancel</Button>
            <Button
              onClick={() => rescheduleMutation.mutate()}
              disabled={rescheduleMutation.isPending || !rescheduleData?.date || !rescheduleData?.time}
              className="rounded-xl bg-primary text-white"
            >
              {rescheduleMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
