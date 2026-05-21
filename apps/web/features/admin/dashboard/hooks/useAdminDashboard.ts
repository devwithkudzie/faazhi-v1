import { getAdminDashboardData } from "@/features/admin/dashboard/services/dashboard.service";

export function useAdminDashboard() {
  return getAdminDashboardData();
}
