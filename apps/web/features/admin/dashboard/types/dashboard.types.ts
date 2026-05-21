import type { LucideIcon } from "lucide-react";

export interface AdminMetric {
  label: string;
  value: string;
  change: string;
  tone: "blue" | "green" | "amber" | "slate";
  icon: LucideIcon;
}

export interface ContentPerformanceItem {
  label: string;
  subject: string;
  metric: string;
  trend: string;
}

export interface WeakTopicItem {
  topic: string;
  paper: string;
  averageScore: number;
  attempts: number;
}

export interface ActivityItem {
  actor: string;
  action: string;
  target: string;
  time: string;
}

export interface QuickAction {
  label: string;
  description: string;
  href: string;
}

export interface AdminDashboardData {
  platformStats: AdminMetric[];
  recentActivity: ActivityItem[];
}
