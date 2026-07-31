import { Settings } from "lucide-react";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export function SettingsPage() {
  return (
    <FeaturePlaceholder
      icon={Settings}
      title="Settings"
      description="Voice speed, accent region, dark mode, notifications, and language preferences."
      module="Module 2"
    />
  );
}
