import { Mic } from "lucide-react";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export function PracticePage() {
  return (
    <FeaturePlaceholder
      icon={Mic}
      title="Practice"
      description="Record yourself against native Argentine audio and get rhythm, intonation, and authenticity coaching."
      module="Module 6"
    />
  );
}
