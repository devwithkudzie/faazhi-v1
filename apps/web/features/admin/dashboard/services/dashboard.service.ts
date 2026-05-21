import {
  Activity,
  Clock3,
  UserPlus,
  Users,
} from "lucide-react";

import type { AdminDashboardData } from "@/features/admin/dashboard/types/dashboard.types";

export function getAdminDashboardData(): AdminDashboardData {
  return {
    platformStats: [
      {
        label: "Total users",
        value: "2,846",
        change: "+126 this month",
        tone: "blue",
        icon: Users,
      },
      {
        label: "Active today",
        value: "418",
        change: "14.7% of users",
        tone: "green",
        icon: Activity,
      },
      {
        label: "Active this week",
        value: "1,204",
        change: "+8.2% vs last week",
        tone: "slate",
        icon: Clock3,
      },
      {
        label: "New signups",
        value: "73",
        change: "+19 in 7 days",
        tone: "amber",
        icon: UserPlus,
      },
    ],
    recentActivity: [
      {
        actor: "Priya Shah",
        action: "completed",
        target: "Binary number systems",
        time: "2 min ago",
      },
      {
        actor: "Kundai M.",
        action: "submitted",
        target: "Paper 1 module assessment",
        time: "18 min ago",
      },
      {
        actor: "Amina D.",
        action: "joined",
        target: "Faazhi",
        time: "42 min ago",
      },
      {
        actor: "Tawanda R.",
        action: "started",
        target: "Logic gate simulator",
        time: "1 hr ago",
      },
    ],
  };
}
