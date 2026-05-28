import { MetricGrid } from "@/features/admin/dashboard/components/MetricGrid";
import type { AdminMetric } from "@/features/admin/dashboard/types/dashboard.types";

export function PlatformStats({ metrics }: { metrics: AdminMetric[] }) {
  return (
    <MetricGrid
      title="Student growth"
      description="The launch signals that show whether students are joining and learning."
      metrics={metrics}
    />
  );
}
