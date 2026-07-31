import { BookOpen } from "lucide-react";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export function VocabularyPage() {
  return (
    <FeaturePlaceholder
      icon={BookOpen}
      title="Vocabulary"
      description="Slang, idioms, and expressions across levels, with audio, examples, and regional notes."
      module="Module 4"
    />
  );
}
