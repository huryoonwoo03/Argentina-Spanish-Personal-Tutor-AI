import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FeaturePlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  module: string;
}

export function FeaturePlaceholder({
  icon: Icon,
  title,
  description,
  module,
}: FeaturePlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Card className="mx-auto max-w-xl">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="size-6" />
          </div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
          <span className="mt-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            Arrives in {module}
          </span>
        </CardContent>
      </Card>
    </motion.div>
  );
}
