import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: "primary" | "accent";
}

export function StatCard({ icon: Icon, label, value, accent = "primary" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Card>
        <CardContent className="flex items-center gap-4 py-5">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              accent === "primary"
                ? "bg-primary/10 text-primary"
                : "bg-accent text-accent-foreground",
            )}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-xl font-semibold tracking-tight">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
