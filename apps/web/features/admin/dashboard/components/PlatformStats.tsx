import { MetricGrid } from "@/features/admin/dashboard/components/MetricGrid";
import type { AdminMetric } from "@/features/admin/dashboard/types/dashboard.types";

export function PlatformStats({ metrics }: { metrics: AdminMetric[] }) {
  return (
    <MetricGrid
      title="Platform stats"
      description="Core platform usage and user growth signals."
      metrics={metrics}
    />
  );
}
