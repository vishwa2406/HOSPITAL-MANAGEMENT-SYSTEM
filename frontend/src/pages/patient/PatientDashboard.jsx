import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, Clock, MessageSquare, ArrowRight, 
  Activity, Heart, Thermometer, Droplets
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PatientDashboard() {
  const { user } = useAuth();
  
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["patient-recent-appointments", user?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/appointments");
      return response.data || [];
    },
    enabled: !!user,
  });

  const upcoming = appointments?.filter(a => ['pending', 'approved', 'pending_reschedule'].includes(a.status)) || [];

  const getConsultationData = () => {
    if (!appointments) return [];
    const months = [];
    const now = new Date();
    // Build array for last 6 months
    for(let i=5; i>=0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ 
        name: d.toLocaleString('default', { month: 'short' }), 
        yearKey: d.getFullYear(),
        monthKey: d.getMonth(),
        visits: 0 
      });
    }

    appointments.forEach(a => {
      // Just track all appointments that actually happened/happening
      if (a.status !== 'rejected') {
        const ad = new Date(a.date);
        const target = months.find(m => m.yearKey === ad.getFullYear() && m.monthKey === ad.getMonth());
        if (target) {
          target.visits += 1;
        }
      }
    });

    return months.map(m => ({ name: m.name, visits: m.visits }));
  };

  const chartData = getConsultationData();

  const calculateTrend = (actual, baseline) => {
    if (!actual || isNaN(actual)) return "0%";
    const diff = ((actual - baseline) / baseline) * 100;
    const sign = diff >= 0 ? "+" : "";
    return `${sign}${Math.round(diff)}%`;
  };

  const getBPValue = (bp) => {
    if (!bp || bp === "NaN/NaN") return "NaN";
    return bp;
  };

  const getBPTrend = (bp) => {
    if (!bp || bp === "NaN/NaN") return "0%";
    const systolic = parseInt(bp.split('/')[0]);
    if (isNaN(systolic)) return "0%";
    const diff = ((systolic - 120) / 120) * 100;
    const sign = diff >= 0 ? "+" : "";
    return `${sign}${Math.round(diff)}%`;
  };

  const stats = [
    { 
      label: "Heart Rate", 
      value: `${user?.healthMetrics?.heartRate ?? "NaN"} bpm`, 
      icon: Heart, 
      color: "text-red-500", 
      bg: "bg-red-500/10", 
      trend: calculateTrend(user?.healthMetrics?.heartRate, 72) 
    },
    { 
      label: "Glucose", 
      value: `${user?.healthMetrics?.glucose ?? "NaN"} mg/dL`, 
      icon: Droplets, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10", 
      trend: calculateTrend(user?.healthMetrics?.glucose, 90) 
    },
    { 
      label: "Body Temp", 
      value: `${user?.healthMetrics?.temperature ?? "NaN"} deg C`, 
      icon: Thermometer, 
      color: "text-orange-500", 
      bg: "bg-orange-500/10", 
      trend: calculateTrend(user?.healthMetrics?.temperature, 36.6) 
    },
    { 
      label: "Blood Pressure", 
      value: getBPValue(user?.healthMetrics?.bloodPressure), 
      icon: Activity, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10", 
      trend: getBPTrend(user?.healthMetrics?.bloodPressure) 
    },
  ];



  return (
    <div className="min-h-screen bg-muted/30 transition-colors duration-300">
      <DashboardLayout role="patient">
        <div className="p-8 space-y-12">
          <header>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-extrabold text-foreground tracking-tight"
            >
              Welcome, <span className="text-primary">{user?.fullName
                ?.split(" ")[0]
                ?.charAt(0)
                ?.toUpperCase() +
                user?.fullName?.split(" ")[0]?.slice(1)}</span>

            </motion.h1>
            <p className="text-foreground/80 font-medium mt-2">Check your health metrics and upcoming appointments.</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden group">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <stat.icon className={`w-7 h-7 ${stat.color}`} />
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-foreground/80 bg-muted px-2 py-1 rounded-full">
                        {stat.trend}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-foreground/80 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-black text-foreground mt-1">{stat.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-border shadow-2xl shadow-primary/5 rounded-[2.5rem] bg-card overflow-hidden">
              <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-foreground">Consultation <span className="text-primary">History</span></CardTitle>
                  <p className="text-foreground/80 mt-1 font-medium">Your medical visits over the past 6 months</p>
                </div>
              </CardHeader>
              <CardContent className="h-[350px] p-10 pt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 700}} dy={10} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 700}} />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--primary) / 0.05)'}}
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '15px' }}
                    />
                    <Bar dataKey="visits" fill="#3b82f6" radius={[10, 10, 10, 10]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border shadow-2xl shadow-primary/5 rounded-[2.5rem] bg-card text-card-foreground overflow-hidden flex flex-col h-full border hover:shadow-primary/10 transition-all duration-700">
                <CardHeader className="p-10">
                  <CardTitle className="text-2xl font-black flex items-center gap-3">
                    <Calendar className="w-7 h-7 text-primary" /> Schedule
                  </CardTitle>
                  <p className="text-foreground/80 font-medium mt-1">Manage your sessions</p>
                </CardHeader>
                <CardContent className="p-10 pt-0 flex-1 space-y-6">
                  {isLoading ? (
                    <div className="flex flex-col gap-4">
                      {[1,2].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-3xl" />)}
                    </div>
                  ) : upcoming?.length === 0 ? (
                    <div className="text-center py-12 px-6 bg-muted/30 rounded-3xl border border-border">
                      <p className="text-foreground/80 text-sm font-medium">No appointments booked</p>
                      <Link to="/patient/book">
                        <Button variant="link" className="text-primary font-bold mt-2">Book a specialist</Button>
                      </Link>
                    </div>
                  ) : (
                    upcoming?.map((appt) => (
                      <motion.div 
                        key={appt._id} 
                        className="p-6 bg-muted/50 rounded-[2rem] border border-border hover:bg-muted transition-all group"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center font-bold text-primary">
                            {appt.doctorId?.userId?.fullName?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground leading-none">{appt.doctorId?.userId?.fullName}</h4>
                            <p className="text-[10px] text-foreground/80 font-bold uppercase tracking-widest mt-1">
                              {appt.doctorId?.specialization}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold">
                          <div className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1.5 rounded-xl">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(appt.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-foreground/80">
                            <Clock className="w-3.5 h-3.5" />
                            {appt.time}
                          </div>
                        </div>
                        {appt.status === 'approved' && (
                          <Link to={`/chats/${appt._id}`}>
                            <Button className="w-full mt-6 h-12 rounded-2xl bg-primary text-white border-none hover:bg-primary/90 transition-all font-black text-xs gap-2 shadow-lg shadow-primary/20">
                               Start Consultation
                            </Button>
                          </Link>
                        )}
                      </motion.div>
                    ))
                  )}
                </CardContent>
                <div className="p-10 pt-0">
                  <Link to="/patient/appointments">
                    <Button variant="ghost" className="w-full text-foreground/80 hover:text-foreground hover:bg-muted rounded-2xl h-14 font-bold text-xs gap-3">
                      View Complete History <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
}
