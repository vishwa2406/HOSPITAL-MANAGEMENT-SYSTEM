import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { User } from "lucide-react";

export default function DoctorProfile() {
  const { user } = useAuth();

  const { data: doctor } = useQuery({
    queryKey: ["doctor-profile", user?._id],
    queryFn: async () => {
      const response = await api.get("/appointments/doctor/me");
      return response.data;
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout role="doctor">
      <h1 className="text-2xl font-bold text-foreground mb-6">My Profile</h1>
      <div className="max-w-lg bg-card p-6 rounded-xl border border-border shadow-card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            {doctor?.profileImage ? (
              <img src={doctor.profileImage} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{doctor?.userId?.fullName || user?.fullName}</h2>
            <p className="text-sm text-primary">{doctor?.specialization}</p>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Email</span>
            <span className="text-foreground">{doctor?.userId?.email || user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Experience</span>
            <span className="text-foreground">{doctor?.experience} years</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Status</span>
            <span className={doctor?.available ? "text-success" : "text-destructive"}>{doctor?.available ? "Available" : "Unavailable"}</span>
          </div>
          {doctor?.bio && (
            <div className="pt-2">
              <span className="text-muted-foreground block mb-1">Bio</span>
              <p className="text-foreground">{doctor.bio}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
