import { Activity, BookOpenCheck, UserPlus, Users } from "lucide-react";

import type { AdminDashboardData } from "@/features/admin/dashboard/types/dashboard.types";

export function getAdminDashboardData(): AdminDashboardData {
  return {
    studentStats: [
      {
        label: "Total students",
        value: "2,846",
        change: "+126 this month",
        tone: "blue",
        icon: Users,
      },
      {
        label: "New students",
        value: "73",
        change: "+19 in 7 days",
        tone: "amber",
        icon: UserPlus,
      },
      {
        label: "Active this week",
        value: "1,204",
        change: "42.3% of students",
        tone: "green",
        icon: Activity,
      },
      {
        label: "Lessons completed",
        value: "3,918",
        change: "+8.2% this week",
        tone: "slate",
        icon: BookOpenCheck,
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
