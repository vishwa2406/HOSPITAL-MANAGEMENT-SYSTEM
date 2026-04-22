import jsPDF from "jspdf";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Download, FileText, MessageSquare, Calendar as CalendarIcon, Clock } from "lucide-react";
import { generatePrescriptionPDF, generateInvoicePDF } from "@/utils/pdfGenerators";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
];

const convertTo24h = (timeStr) => {
  if (!timeStr) return "00:00";
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

export default function PatientAppointments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [rescheduleModal, setRescheduleModal] = useState({ open: false, appointment: null });
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });
  const [isRescheduling, setIsRescheduling] = useState(false);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["patient-all-appointments", user?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/appointments");
      return response.data || [];
    },
    enabled: !!user,
  });

  const doctorIdForReschedule = rescheduleModal.appointment?.doctorId?._id;
  const dateForReschedule = rescheduleData.date;

  const { data: slotData } = useQuery({
    queryKey: ["booked-slots", doctorIdForReschedule, dateForReschedule],
    queryFn: async () => {
      const response = await api.get(`/appointments/doctor/${doctorIdForReschedule}/booked-slots?date=${dateForReschedule}`);
      return response.data;
    },
    enabled: !!doctorIdForReschedule && !!dateForReschedule,
  });

  const getSlotStatus = (slot) => {
    const isToday = dateForReschedule === new Date().toISOString().split("T")[0];
    if (isToday) {
      const now = new Date();
      const current24 = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const slot24 = convertTo24h(slot);
      if (slot24 < current24) return "past";
    }

    if (slotData?.booked?.includes(slot)) {
      if (dateForReschedule === rescheduleModal.appointment?.date.split("T")[0] && slot === rescheduleModal.appointment?.time) {
        return "available";
      }
      return "booked";
    }
    const isUnavailable = slotData?.unavailableRanges?.some(range => isTimeInRange(slot, range));
    if (isUnavailable) return "unavailable";
    return "available";
  };

  const { data: prescriptions, isLoading: prescLoading } = useQuery({
    queryKey: ["patient-prescriptions", user?._id],
    queryFn: async () => {
      const response = await api.get("/prescriptions");
      return response.data || [];
    },
    enabled: !!user,
  });

  const exportInvoice = async (appt) => {
    try {
      let transactionId = `CC-${appt._id.slice(-8).toUpperCase()}`;
      try {
        const payRes = await api.get(`/appointments/${appt._id}/payment`);
        if (payRes.data && payRes.data.transactionId) {
          transactionId = payRes.data.transactionId;
        }
      } catch (err) {
        console.warn("Could not fetch payment record", err);
      }

      generateInvoicePDF({
        patientName: user?.fullName || "Patient",
        doctorName: appt.doctorId?.userId?.fullName || "Doctor",
        date: appt.date,
        amount: appt.chargeAmount,
        paymentStatus: appt.isPaid ? "SUCCESSFUL" : "PENDING",
        transactionId
      });
    } catch (err) {
      console.error("PDF Failed:", err);
    }
  };

  const exportPDF = async (presc) => {
    generatePrescriptionPDF(presc);
  };

  const handleReschedule = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      toast({ title: "Error", description: "Date and time are required", variant: "destructive" });
      return;
    }
    setIsRescheduling(true);
    try {
      await api.put(`/appointments/appointments/${rescheduleModal.appointment._id}/reschedule`, rescheduleData);
      toast({ title: "Success", description: "Reschedule request submitted successfully." });
      setRescheduleModal({ open: false, appointment: null });
      queryClient.invalidateQueries(["patient-all-appointments"]);
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to reschedule", variant: "destructive" });
    } finally {
      setIsRescheduling(false);
    }
  };

  return (
    <DashboardLayout role="patient">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Appointment Management</h1>
          <Link to="/patient/book">
            <Button className="rounded-xl h-9 px-4 text-sm font-bold bg-primary text-white shadow-sm">
              + Book New
            </Button>
          </Link>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-bold text-muted-foreground uppercase text-xs">Doctor Name</th>
                  <th className="text-left p-4 font-bold text-muted-foreground uppercase text-xs">Date & Time</th>
                  <th className="text-left p-4 font-bold text-muted-foreground uppercase text-xs">Appointment Status</th>
                  <th className="text-left p-4 font-bold text-muted-foreground uppercase text-xs">Actions</th>
                  <th className="text-left p-4 font-bold text-muted-foreground uppercase text-xs">Payment Status</th>
                  <th className="text-left p-4 font-bold text-muted-foreground uppercase text-xs">Chat</th>
                  <th className="text-left p-4 font-bold text-muted-foreground uppercase text-xs">View Invoice</th>
                  <th className="text-left p-4 font-bold text-muted-foreground uppercase text-xs">View Prescription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading || prescLoading ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : appointments?.length === 0 ? (
                  <tr><td colSpan={8} className="p-12 text-center text-muted-foreground">No appointments found.</td></tr>
                ) : (
                  appointments?.map((a) => {
                    const presc = prescriptions?.find(p => p.appointmentId?._id === a._id);

                    return (
                      <tr key={a._id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-bold text-primary">Dr. {a.doctorId?.userId?.fullName || "Doctor"}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-foreground font-semibold">{new Date(a.date).toLocaleDateString()}</span>
                            <span className="text-xs text-muted-foreground font-medium">{a.time}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold ${
                            a.status === "approved" ? "bg-emerald-500/10 text-emerald-600" :
                            a.status === "rejected" ? "bg-red-500/10 text-red-600" :
                            a.status === "completed" ? "bg-green-400/10 text-green-600" :
                            "bg-amber-500/10 text-amber-600"
                          }`}>
                            {a.status === "pending_reschedule" ? "PENDING RESCHEDULE" : a.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {(a.status === 'pending' || a.status === 'approved' || a.status === 'rejected') ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 text-[10px] px-2 text-primary border-primary hover:bg-primary/10 transition-colors"
                              onClick={() => {
                                setRescheduleData({ date: a.date.split('T')[0], time: a.time });
                                setRescheduleModal({ open: true, appointment: a });
                              }}
                            >
                              <CalendarIcon className="w-3 h-3 mr-1" /> Reschedule
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          {a.isPaid ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600">
                              Paid
                            </span>
                          ) : (
                            <Link to={`/patient/payment/${a._id}`} className="flex-shrink-0">
                              <span className="text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider bg-warning/10 text-warning hover:bg-warning/20 transition-colors cursor-pointer border border-warning/20 whitespace-nowrap inline-block">
                                Not Paid (Pay Now)
                              </span>
                            </Link>
                          )}
                        </td>
                        <td className="p-4">
                          {a.status === 'approved' || a.status === 'completed' ? (
                            <Link to={`/chats/${a._id}`}>
                              <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 text-primary">
                                <MessageSquare className="w-3 h-3 mr-1" /> Chat
                              </Button>
                            </Link>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          {a.isPaid ? (
                            <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 text-slate-600" onClick={() => exportInvoice(a)}>
                              <FileText className="w-3 h-3 mr-1" /> View Invoice
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          {presc && a.isPaid ? (
                            <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 text-primary" onClick={() => exportPDF(presc)}>
                              <Download className="w-3 h-3 mr-1" /> View Prescription
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={rescheduleModal.open} onOpenChange={(val) => !val && setRescheduleModal({ open: false, appointment: null })}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl inline-flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-primary" /> Reschedule Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-bold text-foreground/80">New Date</Label>
              <Input 
                type="date" 
                min={new Date().toISOString().split('T')[0]}
                value={rescheduleData.date}
                onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value, time: ""})}
                className="h-12 border-border shadow-sm rounded-xl font-medium"
              />
            </div>

            {rescheduleData.date && !slotData?.isFullyBlocked && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> Select Time Slot
                  </h3>
                  <div className="flex gap-2 text-[9px] font-black uppercase tracking-tighter">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full" />Available</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full" />Booked</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500 rounded-full" />Unavailable</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-sky-400 rounded-full" />Selected</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {timeSlots.map((t) => {
                    const status = getSlotStatus(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={status !== "available"}
                        onClick={() => setRescheduleData({...rescheduleData, time: t})}
                        className={cn(
                          "h-10 rounded-xl font-black text-xs transition-all duration-300 border flex items-center justify-center",
                          status === "available" && rescheduleData.time === t
                            ? "bg-sky-400 text-white border-sky-500 shadow-sm"
                            : status === "available"
                            ? "bg-green-500 text-white border-green-600 hover:bg-green-600"
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
              </div>
            )}
            {slotData?.isFullyBlocked && (
              <div className="p-4 bg-orange-500/10 rounded-xl border border-dashed border-orange-500/20 text-center">
                <p className="text-orange-500 font-bold text-sm">Physician is unavailable on this date.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl h-12" onClick={() => setRescheduleModal({ open: false, appointment: null })}>Cancel</Button>
            <Button className="rounded-xl h-12 bg-primary hover:bg-primary/90 text-white font-bold" onClick={handleReschedule} disabled={isRescheduling}>
              {isRescheduling ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
