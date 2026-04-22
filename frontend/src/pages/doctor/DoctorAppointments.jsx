import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Download, FileText, MessageSquare, Activity } from "lucide-react";
import jsPDF from "jspdf";
import { Link } from "react-router-dom";
import { generatePrescriptionPDF, generateInvoicePDF } from "@/utils/pdfGenerators";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DoctorAppointments() {
  const { user } = useAuth(); // For doctor
  const { toast } = useToast();

  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vitals, setVitals] = useState({
    bloodPressure: "",
    heartRate: "",
    glucose: "",
    temperature: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const { data: appointments, isLoading: apptLoading, refetch } = useQuery({
    queryKey: ["doctor-all-appointments", user?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/appointments");
      return response.data || [];
    },
    enabled: !!user,
  });

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/appointments/${id}/status`, { status });
      refetch();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const { data: prescriptions, isLoading: prescLoading } = useQuery({
    queryKey: ["doctor-prescriptions", user?._id],
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
        console.warn("Could not fetch unique payment record", err);
      }

      generateInvoicePDF({
        patientName: appt.patientId?.fullName || "Patient",
        doctorName: user?.fullName || "Doctor",
        date: appt.date,
        amount: appt.chargeAmount,
        paymentStatus: appt.isPaid ? 'SUCCESSFUL' : 'PENDING',
        transactionId: appt.isPaid ? transactionId : null
      });
    } catch (err) {
      console.error("PDF Failed:", err);
    }
  };

  const exportPDF = async (presc) => {
    generatePrescriptionPDF(presc);
  };

  const openVitalsModal = (patient) => {
    setSelectedPatient(patient);
    setVitals({
      bloodPressure: patient.healthMetrics?.bloodPressure || "",
      heartRate: patient.healthMetrics?.heartRate || "",
      glucose: patient.healthMetrics?.glucose || "",
      temperature: patient.healthMetrics?.temperature || ""
    });
    setIsVitalsModalOpen(true);
  };

  const handleSaveVitals = async () => {
    if (!selectedPatient?._id) return;
    setIsSaving(true);
    try {
      await api.put(`/auth/patients/${selectedPatient._id}/vitals`, vitals);
      toast({ title: "Success", description: "Patient vitals updated successfully" });
      setIsVitalsModalOpen(false);
      refetch();
    } catch (err) {
      toast({ 
        title: "Error", 
        description: err.response?.data?.message || "Failed to update vitals",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout role="doctor">
      <h1 className="text-2xl font-bold text-foreground mb-6">Appointment Management</h1>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-bold text-muted-foreground uppercase text-xs">Patient Name</th>
                <th className="text-left p-4 font-bold text-muted-foreground uppercase text-xs">Date & Time</th>
                <th className="text-left p-4 font-bold text-muted-foreground uppercase text-xs">Appointment Status</th>
                <th className="text-left p-4 font-bold text-muted-foreground uppercase text-xs">Actions</th>
                <th className="text-left p-4 font-bold text-muted-foreground uppercase text-xs">Payment Status</th>
                <th className="text-left p-4 font-bold text-muted-foreground uppercase text-xs">Chat</th>
                <th className="text-left p-4 font-bold text-muted-foreground uppercase text-xs">Vitals</th>
                <th className="text-left p-4 font-bold text-muted-foreground uppercase text-xs">View Invoice</th>
                <th className="text-left p-4 font-bold text-muted-foreground uppercase text-xs">View Prescription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {apptLoading && <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>}
              {appointments?.map((a) => {
                const presc = prescriptions?.find(p => p.appointmentId?._id === a._id);

                return (
                  <tr key={a._id} className="hover:bg-accent/50 transition-colors">
                    <td className="p-4 font-bold text-foreground">{a.patientId?.fullName || "Patient"}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold">{new Date(a.date).toLocaleDateString()}</span>
                        <span className="text-xs text-muted-foreground">{a.time}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-widest uppercase ${
                        a.status === "approved" ? "bg-emerald-500/10 text-emerald-600" :
                        a.status === "rejected" ? "bg-red-500/10 text-red-600" :
                        a.status === "completed" ? "bg-green-400/10 text-green-600" :
                        a.status === "pending_reschedule" ? "bg-violet-500/10 text-violet-600" :
                        "bg-amber-500/10 text-amber-600"
                      }`}>
                        {a.status === "pending_reschedule" ? "RESCHEDULE REQUEST" : a.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {a.status === 'pending_reschedule' ? (
                        <div className="flex gap-2 flex-col xl:flex-row">
                          <Button size="sm" onClick={() => updateStatus(a._id, 'approved')} className="bg-violet-500 hover:bg-violet-600 text-white text-[10px] h-7 px-2">Approve Reschedule</Button>
                          <Button size="sm" onClick={() => updateStatus(a._id, 'rejected')} variant="destructive" className="text-[10px] h-7 px-2">Reject</Button>
                        </div>
                      ) : a.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updateStatus(a._id, 'approved')} className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] h-7 px-2">Approve</Button>
                          <Button size="sm" onClick={() => updateStatus(a._id, 'rejected')} variant="destructive" className="text-[10px] h-7 px-2">Reject</Button>
                        </div>
                      ) : a.status === 'approved' ? (
                        <Button size="sm" onClick={() => updateStatus(a._id, 'completed')} className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] h-7 px-2 w-full">Complete</Button>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium flex items-center justify-center">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        a.isPaid ? "bg-emerald-500/10 text-emerald-600" : "bg-warning/10 text-warning"
                      }`}>
                        {a.isPaid ? 'Paid' : 'Not Paid'}
                      </span>
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
                      {a.patientId ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-[10px] px-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                          onClick={() => openVitalsModal(a.patientId)}
                        >
                          <Activity className="w-3 h-3 mr-1" /> Vitals
                        </Button>
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
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isVitalsModalOpen} onOpenChange={setIsVitalsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Health Metrics: {selectedPatient?.fullName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bp" className="text-right">Blood Pressure</Label>
              <Input
                id="bp"
                value={vitals.bloodPressure}
                onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                className="col-span-3"
                placeholder="e.g. 120/80"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hr" className="text-right">Heart Rate</Label>
              <Input
                id="hr"
                type="number"
                value={vitals.heartRate}
                onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="glucose" className="text-right">Glucose</Label>
              <Input
                id="glucose"
                type="number"
                value={vitals.glucose}
                onChange={(e) => setVitals({ ...vitals, glucose: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="temp" className="text-right">Body Temp (°C)</Label>
              <Input
                id="temp"
                type="number"
                step="0.1"
                value={vitals.temperature}
                onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVitalsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveVitals} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Vitals"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
