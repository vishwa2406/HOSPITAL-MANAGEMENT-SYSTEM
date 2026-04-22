import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Download, FileText, Clock } from "lucide-react";
import { generatePrescriptionPDF, generateInvoicePDF } from "@/utils/pdfGenerators";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminAppointments() {
  const { user } = useAuth(); // For Admin name if needed

  const { data: appointments, isLoading: apptLoading, refetch } = useQuery({
    queryKey: ["admin-all-appointments"],
    queryFn: async () => {
      const response = await api.get("/appointments/admin/appointments");
      return response.data || [];
    },
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
    queryKey: ["admin-all-prescriptions"],
    queryFn: async () => {
      const response = await api.get("/prescriptions");
      return response.data || [];
    },
  });

  const exportInvoice = async (appt) => {
    try {
      let transactionId = `CC-${appt._id.slice(-8).toUpperCase()}`;
      try {
        const payRes = await api.get(`/appointments/appointments/${appt._id}/payment`);
        if (payRes.data && payRes.data.transactionId) {
          transactionId = payRes.data.transactionId;
        }
      } catch (err) {
        console.warn("Could not fetch unique payment record", err);
      }

      generateInvoicePDF({
        patientName: appt.patientId?.fullName || "Patient",
        doctorName: appt.doctorId?.userId?.fullName || "Doctor",
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

  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold text-foreground mb-6">Appointment Management</h1>
      <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl shadow-primary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-6 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Patient Identity</th>
                <th className="text-left p-6 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Clinical Lead</th>
                <th className="text-left p-6 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Session Data</th>
                <th className="text-left p-6 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Current Status</th>
                <th className="text-left p-6 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Direct Actions</th>
                <th className="text-left p-6 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Finance</th>
                <th className="text-center p-6 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Financial Log</th>
                <th className="text-center p-6 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Prescription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {apptLoading && <tr><td colSpan={8} className="p-20 text-center uppercase font-black tracking-widest text-muted-foreground">Syncing Appointments...</td></tr>}
              {appointments?.map((a) => {
                const presc = prescriptions?.find(p => p.appointmentId?._id === a._id);

                return (
                  <tr key={a._id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-6 font-black text-foreground tracking-tight text-base">{a.patientId?.fullName || "Patient"}</td>
                    <td className="p-6">
                       <span className="font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg">Dr. {a.doctorId?.userId?.fullName || "Doctor"}</span>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-foreground">{new Date(a.date).toLocaleDateString()}</span>
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3" /> {a.time}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black tracking-[0.1em] shadow-sm uppercase ${
                        a.status === "approved" ? "bg-emerald-500 text-white" :
                        a.status === "rejected" ? "bg-destructive text-white" :
                        a.status === "completed" ? "bg-green-400 text-white" :
                        "bg-amber-500 text-white"
                      }`}>
                        {a.status === "pending_reschedule" ? "PENDING" : a.status}
                      </span>
                    </td>
                    <td className="p-6">
                      {a.status === 'pending' || a.status === 'pending_reschedule' ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updateStatus(a._id, 'approved')} className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase h-9 px-4 rounded-xl shadow-lg shadow-emerald-500/10">Approve</Button>
                          <Button size="sm" onClick={() => updateStatus(a._id, 'rejected')} variant="destructive" className="text-[10px] font-black uppercase h-9 px-4 rounded-xl shadow-lg shadow-destructive/10">Reject</Button>
                        </div>
                      ) : a.status === 'approved' ? (
                        <Button size="sm" onClick={() => updateStatus(a._id, 'completed')} className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black uppercase h-9 px-6 rounded-xl w-full shadow-lg shadow-blue-500/10">Complete</Button>
                      ) : (
                        <span className="text-xs text-muted-foreground font-black tracking-widest flex justify-center">—</span>
                      )}
                    </td>
                    <td className="p-6">
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm ${
                        a.isPaid ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      }`}>
                        {a.isPaid ? 'Settled' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex justify-center">
                        {a.isPaid ? (
                          <Button size="sm" variant="outline" className="h-9 text-[10px] px-4 rounded-xl border-border bg-card hover:bg-primary/5 text-foreground font-black uppercase tracking-widest transition-all shadow-sm" onClick={() => exportInvoice(a)}>
                            <FileText className="w-3.5 h-3.5 mr-2 text-primary" /> View Invoice
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground font-black">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex justify-center">
                        {presc && a.isPaid ? (
                          <Button size="sm" variant="outline" className="h-9 text-[10px] px-4 rounded-xl border-border bg-card hover:bg-primary/5 text-primary font-black uppercase tracking-widest transition-all shadow-sm" onClick={() => exportPDF(presc)}>
                            <Download className="w-3.5 h-3.5 mr-2" /> View Prescription
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground font-black">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
