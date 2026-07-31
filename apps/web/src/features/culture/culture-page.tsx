import { Globe2 } from "lucide-react";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export function CulturePage() {
  return (
    <FeaturePlaceholder
      icon={Globe2}
      title="Culture"
      description="Food, football, music, history, and current events — always fresh, never stale."
      module="Module 5"
    />
  );
}
