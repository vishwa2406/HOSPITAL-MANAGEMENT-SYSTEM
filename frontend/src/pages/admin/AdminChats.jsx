import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { 
  MessageSquare, User, Search, Filter, 
  ChevronRight, Calendar, ArrowLeft, MoreVertical, Clock 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import ClearableSearch from "@/components/ui/ClearableSearch";

export default function AdminChats() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const { data: chats, isLoading } = useQuery({
    queryKey: ["admin-all-chats"],
    queryFn: async () => {
      const response = await api.get("/chat/admin/all");
      return response.data || [];
    },
  });

  const filteredChats = chats?.filter(chat => {
    const doctorName = chat.appointmentId?.doctorId?.userId?.fullName?.toLowerCase() || "";
    const patientName = chat.appointmentId?.patientId?.fullName?.toLowerCase() || "";
    const matchesSearch = doctorName.includes(search.toLowerCase()) || patientName.includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8 pb-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Communication <span className="text-primary italic">Surveillance</span></h1>
            <p className="text-slate-500 font-medium mt-2">Monitor all doctor-patient interactions for quality assurance.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <ClearableSearch
              value={search}
              onChange={setSearch}
              placeholder="Search by name..."
              leftIcon={Search}
              className="w-64"
              inputClassName="h-10 border-none bg-transparent focus-visible:ring-0 font-bold"
            />
            <div className="w-px h-6 bg-slate-100" />
            <Button variant="ghost" size="icon" className="rounded-xl text-slate-400">
               <Filter className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[2.5rem]" />
            ))
          ) : filteredChats?.length === 0 ? (
             <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">No active conversations found</p>
             </div>
          ) : (
            filteredChats.map((chat, i) => (
              <motion.div
                key={chat._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-[2.5rem] border border-border p-8 shadow-2xl shadow-primary/5 hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                onClick={() => navigate(`/chats/${chat.appointmentId._id}`)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex -space-x-4">
                     <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl border-4 border-card shadow-lg">
                       {chat.appointmentId?.doctorId?.userId?.fullName?.charAt(0)}
                     </div>
                     <div className="w-12 h-12 rounded-2xl bg-foreground text-background flex items-center justify-center font-black text-xl border-4 border-card shadow-lg">
                       {chat.appointmentId?.patientId?.fullName?.charAt(0)}
                     </div>
                  </div>
                  <div className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em]">
                    Active Session
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 opacity-80">Surveillance Targets</p>
                    <p className="font-black text-foreground text-lg tracking-tight truncate">
                      Dr. {chat.appointmentId?.doctorId?.userId?.fullName} <span className="text-muted-foreground font-light mx-1">&</span> {chat.appointmentId?.patientId?.fullName}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground pt-4 border-t border-border">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary/30" /> {new Date(chat.updatedAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary/30" /> {format(new Date(chat.updatedAt), 'hh:mm a')}</span>
                  </div>
                </div>

                <Button className="w-full mt-8 h-12 rounded-2xl bg-muted/50 text-foreground hover:bg-foreground hover:text-background border border-border shadow-none font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                  Intervene / View Logs
                </Button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
