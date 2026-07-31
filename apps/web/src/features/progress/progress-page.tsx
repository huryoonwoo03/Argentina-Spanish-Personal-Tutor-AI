import { LineChart } from "lucide-react";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export function ProgressPage() {
  return (
    <FeaturePlaceholder
      icon={LineChart}
      title="Progress"
      description="Charts, weak-sound heatmaps, and achievements tracking your journey toward an authentic accent."
      module="Module 9"
    />
  );
}
