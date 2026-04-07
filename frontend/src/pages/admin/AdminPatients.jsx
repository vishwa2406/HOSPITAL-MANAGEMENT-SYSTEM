import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { User } from "lucide-react";

export default function AdminPatients() {
  const { data: patients } = useQuery({
    queryKey: ["admin-patients"],
    queryFn: async () => {
      const response = await api.get("/auth/admin/patients");
      return response.data || [];
    },
  });

  return (
    <DashboardLayout role="admin">
      <h1 className="text-2xl font-bold text-foreground mb-6">Patients</h1>
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Phone</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {patients?.map((p) => (
                <tr key={p._id}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium text-foreground">{p.fullName || "N/A"}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{p.phone || "—"}</td>
                  <td className="p-3 text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
