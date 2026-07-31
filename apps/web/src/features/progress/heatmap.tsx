import type { DailyProgress } from "@che-speak/shared-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const WEEKS = 20;

function intensityClass(xp: number): string {
  if (xp === 0) return "bg-secondary";
  if (xp < 10) return "bg-primary/25";
  if (xp < 25) return "bg-primary/50";
  if (xp < 50) return "bg-primary/75";
  return "bg-primary";
}

export function Heatmap({ data }: { data: DailyProgress[] }) {
  const byDate = new Map(data.map((d) => [d.activityDate, d.xpEarned]));
  const today = new Date();
  const days: { date: string; xp: number }[] = [];

  for (let i = WEEKS * 7 - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    days.push({ date: key, xp: byDate.get(key) ?? 0 });
  }

  const weeks: { date: string; xp: number }[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {weeks.map((week) => (
            <div key={week[0].date} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.xp} XP`}
                  className={cn("size-3 rounded-sm", intensityClass(day.xp))}
                />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
