import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select as ShadSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM",
];

export default function PatientAppointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [rescheduleData, setRescheduleData] = useState(null); // { id, date, time }

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
      toast({ title: "Rescheduled Successfully!" });
      setRescheduleData(null);
    },
    onError: (err) => {
      toast({ title: "Reschedule Failed", description: err.response?.data?.message || err.message, variant: "destructive" });
    }
  });

  const statusColor = (s) => {
    switch (s) {
      case "approved": return "bg-success/10 text-success border-success/20";
      case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
      case "completed": return "bg-primary/10 text-primary border-primary/20";
      case "cancelled": return "bg-muted text-muted-foreground border-border";
      default: return "bg-warning/10 text-warning border-warning/20";
    }
  };

  return (
    <DashboardLayout role="patient">
      <h1 className="text-2xl font-bold text-foreground mb-6">My Appointments</h1>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Doctor</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Specialization</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Time</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : appointments?.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No appointments found</td></tr>
              ) : (
                appointments?.map((a) => (
                  <tr key={a._id}>
                     <td className="p-3 font-medium text-foreground">{a.doctorId?.userId?.fullName || "Doctor"}</td>
                     <td className="p-3 text-muted-foreground">{a.doctorId?.specialization || "General"}</td>
                     <td className="p-3 text-foreground">{new Date(a.date).toLocaleDateString()}</td>
                     <td className="p-3 text-foreground">{a.time}</td>
                     <td className="p-3">
                       <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${statusColor(a.status)}`}>
                         {a.status}
                       </span>
                     </td>
                     <td className="p-3">
                       {["pending", "approved"].includes(a.status) && !isPastAppointment(a.date, a.time) ? (
                         <div className="flex gap-2">
                           <Button size="sm" variant="outline" className="h-8 text-xs hover:bg-muted" onClick={() => setRescheduleData({ id: a._id, date: a.date.split("T")[0], time: a.time })}>
                             Reschedule
                           </Button>
                           <Button size="sm" variant="outline" className="h-8 text-xs text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => updateStatus.mutate({ id: a._id, status: "cancelled" })}>
                             Cancel
                           </Button>
                         </div>
                       ) : (
                         <span className="text-xs text-muted-foreground font-medium">—</span>
                       )}
                     </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!rescheduleData} onOpenChange={(open) => !open && setRescheduleData(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>
          {rescheduleData && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input
                  id="date"
                  type="date"
                  className="col-span-3"
                  min={new Date().toISOString().split("T")[0]}
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">Time</Label>
                <ShadSelect value={rescheduleData.time} onValueChange={(v) => setRescheduleData({ ...rescheduleData, time: v })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </ShadSelect>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleData(null)}>Cancel</Button>
            <Button 
               onClick={() => rescheduleMutation.mutate()} 
               disabled={rescheduleMutation.isPending || !rescheduleData?.date || !rescheduleData?.time}
            >
              {rescheduleMutation.isPending ? "Updating..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
