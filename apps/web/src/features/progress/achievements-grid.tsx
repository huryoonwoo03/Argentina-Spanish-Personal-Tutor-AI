import type { Achievement, UserAchievement } from "@che-speak/shared-types";
import { Award, BookOpen, Flame, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Award> = {
  sparkles: Sparkles,
  flame: Flame,
  "book-open": BookOpen,
  "trending-up": TrendingUp,
};

export function AchievementsGrid({
  data,
}: {
  data: { achievement: Achievement; earned: UserAchievement | null }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {data.map(({ achievement, earned }) => {
        const Icon = ICONS[achievement.icon ?? ""] ?? Award;
        return (
          <Card key={achievement.id} className={cn(!earned && "opacity-50")}>
            <CardContent className="flex flex-col items-center gap-2 py-4 text-center">
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-full",
                  earned ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
              </div>
              <p className="text-xs font-medium">{achievement.title}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
