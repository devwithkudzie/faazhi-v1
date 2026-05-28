import { Activity, BookOpenCheck, UserPlus, Users } from "lucide-react";

import type { AdminMetric } from "@/features/admin/dashboard/types/dashboard.types";

export type AdminStudent = {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  joinedAt: string;
  lastActive: string;
  progress: number;
  lessonsCompleted: number;
  status: "new" | "active" | "quiet";
};

export const userMetrics: AdminMetric[] = [
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
];

export const adminStudents: AdminStudent[] = [
  {
    id: "student-1",
    name: "Priya Shah",
    email: "priya.shah@example.com",
    subjects: ["Computer Science 9618", "Mathematics 9709"],
    joinedAt: "Today",
    lastActive: "2 min ago",
    progress: 68,
    lessonsCompleted: 12,
    status: "active",
  },
  {
    id: "student-2",
    name: "Amina Dube",
    email: "amina.dube@example.com",
    subjects: ["Mathematics 9709"],
    joinedAt: "Today",
    lastActive: "42 min ago",
    progress: 8,
    lessonsCompleted: 1,
    status: "new",
  },
  {
    id: "student-3",
    name: "Kundai Moyo",
    email: "kundai.moyo@example.com",
    subjects: ["Physics 9702", "Computer Science 9618"],
    joinedAt: "Yesterday",
    lastActive: "18 min ago",
    progress: 41,
    lessonsCompleted: 7,
    status: "active",
  },
  {
    id: "student-4",
    name: "Tawanda R.",
    email: "tawanda.r@example.com",
    subjects: ["Computer Science 9618"],
    joinedAt: "3 days ago",
    lastActive: "1 hr ago",
    progress: 23,
    lessonsCompleted: 4,
    status: "active",
  },
  {
    id: "student-5",
    name: "Nadia Karim",
    email: "nadia.karim@example.com",
    subjects: ["Mathematics 9709", "Physics 9702"],
    joinedAt: "8 days ago",
    lastActive: "6 days ago",
    progress: 14,
    lessonsCompleted: 2,
    status: "quiet",
  },
];
