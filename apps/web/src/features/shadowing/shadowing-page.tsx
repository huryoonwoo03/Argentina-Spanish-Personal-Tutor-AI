import { Repeat } from "lucide-react";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export function ShadowingPage() {
  return (
    <FeaturePlaceholder
      icon={Repeat}
      title="Shadowing"
      description="Listen, repeat, and get immediate feedback on how close you sound to a native speaker."
      module="Module 7"
    />
  );
}
