import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, Calendar, MessageSquare, DollarSign, 
  ArrowUpRight, Clock, UserCheck, Activity, TrendingUp,
  AlertCircle, ChevronRight, CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

const defaultChartData = [
  { name: 'Mon', revenue: 0, patients: 0 },
  { name: 'Tue', revenue: 0, patients: 0 },
  { name: 'Wed', revenue: 0, patients: 0 },
  { name: 'Thu', revenue: 0, patients: 0 },
  { name: 'Fri', revenue: 0, patients: 0 },
  { name: 'Sat', revenue: 0, patients: 0 },
  { name: 'Sun', revenue: 0, patients: 0 },
];

export default function DoctorDashboard() {
  const { user } = useAuth();
  
  const { data: doctor } = useQuery({
    queryKey: ["doctor-self", user?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/doctor/me");
      return response.data;
    },
    enabled: !!user,
  });

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["doctor-all-appointments", doctor?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/appointments");
      return response.data || [];
    },
    enabled: !!doctor,
  });

  const fee = doctor?.consultationFee || 1500;
  
  const pendingCount = appointments?.filter(a => a.status === 'pending' || a.status === 'pending_reschedule').length || 0;
  const approvedCount = appointments?.filter(a => a.status === 'approved').length || 0;
  const totalCompleted = appointments?.filter(a => a.status === 'completed').length || 0;
  
  const [revTab, setRevTab] = useState('history');

  const historyEarnings = totalCompleted * fee;
  const projectedEarnings = approvedCount * fee;

  const getGroupedRevenueData = (isProjection = false) => {
    if (!appointments || appointments.length === 0) return defaultChartData;
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(name => ({ name, revenue: 0, patients: 0 }));

    appointments.forEach(a => {
      const apptDate = new Date(a.date);
      const isPast = apptDate < new Date();
      
      let include = false;
      if (isProjection) {
        include = (a.status === 'approved' || a.status === 'pending') && !isPast;
      } else {
        include = (a.status === 'completed' || a.status === 'approved') && isPast;
      }

      if (include) {
        const dayName = days[apptDate.getDay()];
        const dayRecord = data.find(d => d.name === dayName);
        if (dayRecord) {
          dayRecord.patients += 1;
          dayRecord.revenue += fee;
        }
      }
    });

    return [...data.slice(1), data[0]]; // Mon-Sun
  };

  const currentRevData = getGroupedRevenueData(revTab === 'projection');

  // Active Queue Logic
  const today = new Date().toISOString().split('T')[0];
  const activeQueue = appointments?.filter(a => 
    a.status === 'approved' && 
    (a.date.startsWith(today) || new Date(a.date).toDateString() === new Date().toDateString())
  ).sort((a, b) => a.time.localeCompare(b.time)) || [];

  const getWaitTime = (index) => {
    return index * 20; // 20 minutes per patient
  };

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-8 pb-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-black text-foreground tracking-tight"
            >
              Doctor's <span className="text-primary italic">Command Center</span>
            </motion.h1>
            <p className="text-foreground/80 font-medium mt-2">Precision management for your medical practice.</p>
          </div>
          <div className="flex items-center gap-3">
             <Link to="/doctor/appointments">
              <Button className="rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 px-8 font-bold h-14 text-sm tracking-wide">
                View Appointments
              </Button>
            </Link>
          </div>
        </header>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Pending Requests", value: pendingCount, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10", subtitle: "Awaiting Action" },
            { label: "Active Patients", value: approvedCount, icon: UserCheck, color: "text-blue-500", bg: "bg-blue-500/10", subtitle: "Scheduled Today" },
            { label: "Completed", value: totalCompleted, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", subtitle: "Total Success" },
            { label: "Earnings", value: `Rs. ${historyEarnings + projectedEarnings}`, icon: DollarSign, color: "text-indigo-500", bg: "bg-indigo-500/10", subtitle: `${historyEarnings} History / ${projectedEarnings} Proj.` },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden group bg-card">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white group-hover:shadow-lg transition-all duration-500 shadow-primary/10`}>
                      <stat.icon className={`w-7 h-7 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-xs font-black text-foreground/80 uppercase tracking-[0.2em]">{stat.label}</p>
                  <p className="text-4xl font-black text-foreground mt-2 tracking-tighter">{stat.value}</p>
                  <p className="text-[11px] font-medium text-foreground/80 mt-3 flex items-center gap-2">
                     <TrendingUp className="w-3 h-3 text-emerald-500" /> {stat.subtitle}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Intelligence */}
          <Card className="lg:col-span-2 border-none shadow-sm rounded-[3rem] overflow-hidden bg-card">
            <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black text-foreground">Revenue <span className="text-primary italic">Stream</span></CardTitle>
                <p className="text-foreground/80 font-medium mt-1">Daily revenue distribution ({revTab})</p>
              </div>
              <div className="bg-muted p-2 rounded-2xl border border-border flex gap-2">
                <Button 
                  size="sm" 
                  className={`rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${revTab === 'history' ? "bg-background text-foreground shadow-sm border border-border" : "text-foreground/80 bg-transparent hover:bg-muted/50"}`}
                  onClick={() => setRevTab('history')}
                >
                  History
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className={`rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${revTab === 'projection' ? "bg-background text-foreground shadow-sm border border-border" : "text-foreground/80 bg-transparent hover:bg-muted/50"}`}
                  onClick={() => setRevTab('projection')}
                >
                  Projection
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-[400px] p-10 pt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentRevData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 700}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '20px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Real-time Patient Queue */}
          <Card className="border-none shadow-2xl shadow-primary/5 rounded-[3rem] overflow-hidden bg-card text-foreground flex flex-col border border-border">
            <CardHeader className="p-10">
              <CardTitle className="text-2xl font-black flex items-center gap-4">
                <Activity className="w-8 h-8 text-primary" /> Active Queue
              </CardTitle>
              <p className="text-foreground/80 font-medium mt-1">Predicted waiting times & priority</p>
            </CardHeader>
            <CardContent className="p-10 pt-0 flex-1 space-y-6 overflow-y-auto max-h-[500px] scrollbar-hide">
              {activeQueue.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 px-8 bg-muted/30 rounded-[2.5rem] border border-border">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <UserCheck className="w-10 h-10 text-primary" />
                  </div>
                  <h4 className="text-lg font-bold">Queue is empty</h4>
                  <p className="text-foreground/80 text-sm mt-2 font-medium">No sessions scheduled for the next hour.</p>
                </div>
              ) : (
                activeQueue.map((appt, i) => (
                  <motion.div 
                    key={appt._id} 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative flex flex-col gap-5 p-7 bg-background border border-border rounded-[2.5rem] hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-black text-xl">
                        {appt.patientId?.fullName?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-black truncate text-foreground">{appt.patientId?.fullName}</p>
                        <div className="flex items-center gap-3 mt-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                          <span className="bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {appt.time}
                          </span>
                          <span className="text-foreground/80">Wait: {getWaitTime(i)}m</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] font-black text-foreground/80 tracking-tighter uppercase">
                          {i === 0 ? "Current Patient" : `Next in ${getWaitTime(i)} min`}
                        </p>
                        <ChevronRight className="w-5 h-5 text-foreground/80 group-hover:text-primary transition-colors" />
                    </div>
                    {i === 0 && (
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse border-4 border-background">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </CardContent>
            <div className="p-10 pt-0 mt-auto border-t border-border py-8">
              <p className="text-foreground/80 text-xs font-medium text-center italic">
                Wait times are estimated based on 20min average session length.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}


