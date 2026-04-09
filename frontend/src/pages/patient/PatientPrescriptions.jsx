import { useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Pill, Download, FileText, Activity, Clock,
  Search, Info, UtensilsCrossed, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function PatientPrescriptions() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [exportingId, setExportingId] = useState(null);
  const pdfRefs = useRef({});

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ["my-prescriptions", user?._id],
    queryFn: async () => {
      const response = await api.get("/prescriptions");
      return response.data || [];
    },
    enabled: !!user,
  });

  const filteredPrescriptions = prescriptions?.filter(p =>
    p.doctorId?.userId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.medicines?.some(m => m.name?.toLowerCase().includes(search.toLowerCase()))
  );

  const exportPDF = async (presc) => {
    setExportingId(presc._id);
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let y = 0;

      // Header background
      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, 0, pageWidth, 40, "F");

      // Hospital name
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text("LIONHS Care Hospital", pageWidth / 2, 15, { align: "center" });
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Excellence in Healthcare | www.lionhs.care", pageWidth / 2, 23, { align: "center" });
      pdf.text("Medical Prescription", pageWidth / 2, 32, { align: "center" });

      y = 50;

      // Prescription ID & Date
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Prescription ID: #${presc._id.slice(-8).toUpperCase()}`, 15, y);
      pdf.text(`Date: ${new Date(presc.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, pageWidth - 15, y, { align: "right" });
      y += 10;

      // Divider
      pdf.setDrawColor(226, 232, 240);
      pdf.line(15, y, pageWidth - 15, y);
      y += 8;

      // Patient & Doctor Info
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(15, y, (pageWidth - 35) / 2, 28, 3, 3, "F");
      pdf.roundedRect(pageWidth / 2 + 3, y, (pageWidth - 35) / 2, 28, 3, 3, "F");

      pdf.setTextColor(99, 102, 241);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text("PATIENT DETAILS", 20, y + 8);
      pdf.text("DOCTOR DETAILS", pageWidth / 2 + 8, y + 8);

      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(presc.patientId?.fullName || "Patient", 20, y + 17);
      pdf.text(`Dr. ${presc.doctorId?.userId?.fullName || "Doctor"}`, pageWidth / 2 + 8, y + 17);

      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      const patientInfo = `Email: ${presc.patientId?.email || "—"}`;
      pdf.text(patientInfo, 20, y + 24);
      pdf.text(`Patient Age: ${presc.patientId?.age || "—"}`, 20, y + 30 > y + 27 ? y + 30 : y + 30);
      y += 36;

      // Medicines table header
      pdf.setFillColor(37, 99, 235);
      pdf.roundedRect(15, y, pageWidth - 30, 10, 2, 2, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("Medicine Name", 20, y + 7);
      pdf.text("Dosage", 85, y + 7);
      pdf.text("Duration", 120, y + 7);
      pdf.text("Instructions", 150, y + 7);
      y += 12;

      // Medicine rows
      presc.medicines?.forEach((med, idx) => {
        const bgColor = idx % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
        pdf.setFillColor(...bgColor);
        pdf.rect(15, y, pageWidth - 30, 14, "F");

        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        const medName = pdf.splitTextToSize(med.name, 60);
        pdf.text(medName[0], 20, y + 6);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);

        const dosageParts = [];
        if (med.dosage?.morning) dosageParts.push("Morning");
        if (med.dosage?.noon) dosageParts.push("Noon");
        if (med.dosage?.evening) dosageParts.push("Evening");
        pdf.text(dosageParts.join(", ") || "—", 85, y + 6);
        pdf.text(med.duration || "—", 120, y + 6);

        const instructions = `${med.mealTiming || ""}${med.description ? " | " + med.description : ""}`;
        const instrLines = pdf.splitTextToSize(instructions || "—", 45);
        pdf.text(instrLines[0] || "—", 150, y + 6);

        y += 14;
      });

      y += 4;
      // Border around table
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(15, y - (presc.medicines?.length || 0) * 14 - 16, pageWidth - 30, (presc.medicines?.length || 0) * 14 + 14, "S");

      if (presc.generalNotes) {
        y += 4;
        pdf.setFillColor(254, 252, 232);
        pdf.roundedRect(15, y, pageWidth - 30, 20, 3, 3, "F");
        pdf.setTextColor(146, 64, 14);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text("Physician Notes:", 20, y + 8);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(92, 45, 14);
        const noteLines = pdf.splitTextToSize(presc.generalNotes, pageWidth - 50);
        pdf.text(noteLines, 20, y + 15);
        y += 20 + noteLines.length * 4;
      }

      // Footer
      const footerY = pageHeight - 20;
      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, footerY - 5, pageWidth, pageHeight, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text("LIONHS Care Hospital | This is a computer-generated prescription", pageWidth / 2, footerY + 2, { align: "center" });

      pdf.save(`prescription_${presc._id.slice(-6)}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setExportingId(null);
    }
  };

  return (
    <DashboardLayout role="patient">
      <div className="space-y-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-foreground">My Prescriptions</h1>
            <p className="text-muted-foreground text-sm mt-1">Your complete pharmaceutical history from LIONHS Care</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search medicine or doctor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-11 rounded-2xl text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-muted/50 animate-pulse rounded-3xl" />
            ))
          ) : filteredPrescriptions?.length === 0 ? (
            <div className="lg:col-span-2 py-20 text-center bg-muted/20 rounded-3xl border-2 border-dashed border-border">
              <Pill className="w-14 h-14 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-bold text-muted-foreground">No prescriptions found.</p>
            </div>
          ) : (
            filteredPrescriptions.map((presc, i) => (
              <motion.div
                key={presc._id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-3xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-4 flex items-center justify-between border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
                      <Pill className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-black text-foreground text-sm">Prescription #{presc._id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(presc.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportPDF(presc)}
                    disabled={exportingId === presc._id}
                    className="rounded-xl h-9 px-4 text-xs font-bold gap-2 border-primary/20 text-primary hover:bg-primary/10"
                  >
                    {exportingId === presc._id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3" />
                    )}
                    {exportingId === presc._id ? "Generating..." : "Export PDF"}
                  </Button>
                </div>

                {/* Medicines */}
                <div className="p-5 space-y-3">
                  {presc.medicines?.map((med, idx) => (
                    <div key={idx} className="p-4 bg-muted/30 rounded-2xl border border-border/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-emerald-500" />
                          </div>
                          <p className="font-black text-foreground text-sm">{med.name}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full">
                          <UtensilsCrossed className="w-3 h-3 text-emerald-600" />
                          <span className="text-[10px] font-black text-emerald-600">{med.mealTiming}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {med.dosage?.morning && <span className="flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg text-[10px] font-black"><Clock className="w-3 h-3" />Morning</span>}
                        {med.dosage?.noon && <span className="flex items-center gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-lg text-[10px] font-black"><Clock className="w-3 h-3" />Noon</span>}
                        {med.dosage?.evening && <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg text-[10px] font-black"><Clock className="w-3 h-3" />Evening</span>}
                        {med.duration && <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-[10px] font-black">📅 {med.duration}</span>}
                      </div>
                      {med.description && (
                        <p className="text-xs text-muted-foreground pl-2 border-l-2 border-muted-foreground/30">{med.description}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Notes & Doctor */}
                <div className="px-5 pb-5 space-y-3">
                  {presc.generalNotes && (
                    <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                      <p className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Info className="w-3.5 h-3.5" /> Doctor's Notes
                      </p>
                      <p className="text-sm text-foreground font-medium italic">"{presc.generalNotes}"</p>
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-8 h-8 rounded-xl bg-foreground/10 flex items-center justify-center text-foreground text-xs font-black">
                      {presc.doctorId?.userId?.fullName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Prescribed by</p>
                      <p className="text-sm font-black text-foreground">Dr. {presc.doctorId?.userId?.fullName}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
