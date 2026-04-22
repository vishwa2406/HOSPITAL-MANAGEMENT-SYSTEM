import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeartbeatLoader from "@/components/ui/HeartbeatLoader";
import { 
  Users, Calendar, Clock, CheckCircle, 
  TrendingUp, BarChart3, PieChart as PieChartIcon, 
  Activity, Users2, DollarSign
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminAnalytics() {
  const { isDarkMode } = useTheme();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-detailed-stats"],
    queryFn: async () => {
      const response = await api.get("/appointments/admin/stats");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-[60vh]">
          <HeartbeatLoader />
        </div>
      </DashboardLayout>
    );
  }

  const gridColor = isDarkMode ? '#334155' : '#f1f5f9';
  const labelColor = isDarkMode ? '#94a3b8' : '#64748b';

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8 pb-10">
        <header>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Reports & <span className="text-primary italic">Analytics</span></h1>
          <p className="text-muted-foreground font-medium mt-1">Real-time platform performance and activity oversight.</p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { label: "Patients", value: stats?.summary?.patients, icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
            { label: "Doctors", value: stats?.summary?.doctors, icon: Users2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
            { label: "Sessions", value: stats?.summary?.appointments, icon: Calendar, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10" },
            { label: "Total Revenue", value: `$${stats?.summary?.totalRevenue || 0}`, icon: DollarSign, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
            { label: "Queue", value: stats?.summary?.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border border-border bg-card shadow-sm hover:shadow-xl transition-all rounded-[2rem] overflow-hidden group">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`w-7 h-7 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</p>
                    <p className="text-xl font-black text-foreground mt-1">{item.value || 0}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appointment Trends */}
          <Card className="border border-border shadow-sm rounded-[3rem] bg-card overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-xl font-black flex items-center gap-3 text-foreground">
                <TrendingUp className="w-6 h-6 text-primary" /> Appointment Trends
              </CardTitle>
              <p className="text-muted-foreground text-sm font-medium">Daily activity trajectory over 30 days</p>
            </CardHeader>
            <CardContent className="h-[350px] p-10 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.appointmentTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: labelColor, fontSize: 10, fontWeight: 700}} 
                    dy={10} 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: labelColor, fontSize: 10, fontWeight: 700}} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '20px', 
                      border: '1px solid ' + gridColor, 
                      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)' 
                    }}
                    itemStyle={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', fontWeight: 700 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: isDarkMode ? '#1e293b' : '#fff' }}
                    activeDot={{ r: 7, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="border border-border shadow-sm rounded-[3rem] bg-card overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-xl font-black flex items-center gap-3 text-foreground">
                <PieChartIcon className="w-6 h-6 text-primary" /> Status Distribution
              </CardTitle>
              <p className="text-muted-foreground text-sm font-medium">Platform-wide case status allocation</p>
            </CardHeader>
            <CardContent className="h-[350px] p-10 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.statusDistribution || []}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {stats?.statusDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '20px', 
                      border: '1px solid ' + gridColor, 
                      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 700, color: labelColor }}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Doctors */}
          <Card className="lg:col-span-2 border border-border shadow-sm rounded-[3rem] bg-card overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-xl font-black flex items-center gap-3 text-foreground">
                <BarChart3 className="w-6 h-6 text-primary" /> Clinical Leaders
              </CardTitle>
              <p className="text-muted-foreground text-sm font-medium">Top performing specialists by caseload</p>
            </CardHeader>
            <CardContent className="h-[400px] p-10 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.doctorPerformance} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: labelColor, fontSize: 11, fontWeight: 800}} 
                    width={140} 
                  />
                  <Tooltip 
                    cursor={{fill: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}}
                    contentStyle={{ 
                      borderRadius: '20px', 
                      border: '1px solid ' + gridColor, 
                      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 15, 15, 0]} barSize={35}>
                    {stats?.doctorPerformance?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
