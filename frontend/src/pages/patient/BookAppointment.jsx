import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

export default function BookAppointment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: doctors } = useQuery({
    queryKey: ["doctors-for-booking"],
    queryFn: async () => {
      const response = await api.get("/appointments/doctors");
      return response.data || [];
    },
  });

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await api.post("/appointments/appointments", {
        doctorId,
        appointmentDate: date,
        appointmentTime: time,
        notes,
      });
      toast({ title: "Appointment booked!", description: "You'll be notified once the doctor approves." });
      navigate("/patient/appointments");
    } catch (err) {
      toast({ title: "Failed to book", description: err.message || "An error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctor = doctors?.find((d) => d._id === doctorId);

  return (
    <DashboardLayout role="patient">
      <h1 className="text-2xl font-bold text-foreground mb-6">Book an Appointment</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-card p-6 rounded-xl border border-border shadow-card space-y-4">
          <div>
            <Label>Select Doctor</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors?.map((d) => (
                  <SelectItem key={d._id} value={d._id}>
                    {d.userId?.fullName || "Doctor"} — {d.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required min={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <Label>Time</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe your symptoms or reason for visit..." />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !doctorId || !date || !time}>
            {loading ? "Booking..." : "Book Appointment"}
          </Button>
        </form>

        {selectedDoctor && (
          <div className="bg-card p-6 rounded-xl border border-border shadow-card text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              {selectedDoctor.profileImage ? (
                <img src={selectedDoctor.profileImage} alt={selectedDoctor.userId?.fullName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <h3 className="font-semibold text-foreground">{selectedDoctor.userId?.fullName}</h3>
            <p className="text-sm text-primary">{selectedDoctor.specialization}</p>
            <p className="text-xs text-muted-foreground mt-1">{selectedDoctor.experience}+ years experience</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
