import { MessageCircle } from "lucide-react";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export function ConversationPage() {
  return (
    <FeaturePlaceholder
      icon={MessageCircle}
      title="Conversation AI"
      description="Chat naturally in Rioplatense Spanish with an AI that remembers you and explains cultural context without breaking the flow."
      module="Module 8"
    />
  );
}
