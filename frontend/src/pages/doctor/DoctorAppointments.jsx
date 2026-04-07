import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

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

export default function DoctorAppointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: doctor } = useQuery({
    queryKey: ["doctor-self-appt", user?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/doctor/me");
      return response.data;
    },
    enabled: !!user,
  });

  const { data: appointments } = useQuery({
    queryKey: ["doctor-all-appointments", doctor?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/appointments");
      return response.data || [];
    },
    enabled: !!doctor,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.put(`/appointments/appointments/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-all-appointments"] });
      toast({ title: "Updated" });
    },
  });

  return (
    <DashboardLayout role="doctor">
      <h1 className="text-2xl font-bold text-foreground mb-6">My Appointments</h1>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Time</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Notes</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {appointments?.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No appointments</td></tr>
              )}
               {appointments?.map((a) => (
                <tr key={a._id}>
                  <td className="p-3 text-foreground">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="p-3 text-foreground">{a.time}</td>
                  <td className="p-3 text-muted-foreground text-xs">{a.notes || "—"}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      a.status === "approved" ? "bg-success/10 text-success" :
                      a.status === "rejected" ? "bg-destructive/10 text-destructive" :
                      "bg-warning/10 text-warning"
                    }`}>{a.status}</span>
                  </td>
                  <td className="p-3">
                    {a.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 text-xs text-success border-success/20 hover:bg-success/10" onClick={() => updateStatus.mutate({ id: a._id, status: "approved" })}>Approve</Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => updateStatus.mutate({ id: a._id, status: "rejected" })}>Reject</Button>
                      </div>
                    )}
                    {a.status === "approved" && (
                      <div className="flex gap-2">
                        <Link to={`/chat/${a._id}`}>
                          <Button size="sm" variant="outline" className="h-8 text-xs border-primary/20 text-primary hover:bg-primary/5">
                            <MessageSquare className="h-3 w-3 mr-1" /> Chat
                          </Button>
                        </Link>
                        {isPastAppointment(a.date, a.time) ? (
                          <Button size="sm" className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => updateStatus.mutate({ id: a._id, status: "completed" })}>Complete</Button>
                        ) : (
                          <Button size="sm" variant="outline" className="h-8 text-xs text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => updateStatus.mutate({ id: a._id, status: "cancelled" })}>Cancel</Button>
                        )}
                      </div>
                    )}
                    {["completed", "rejected", "cancelled"].includes(a.status) && (
                      <span className="text-xs text-muted-foreground font-medium">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
