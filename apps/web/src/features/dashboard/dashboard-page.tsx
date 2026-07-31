import { Flame, Sparkles, Target, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "./stat-card";

// Illustrative until Module 3 wires this view to real learner data.
const mockStats = {
  streak: 1,
  xp: 0,
  accentScore: 0,
  weeklyGoalPct: 0,
};

export function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Che, welcome back.</h1>
        <p className="text-sm text-muted-foreground">
          Stop studying Spanish. Start living Argentina.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Flame} label="Streak" value={`${mockStats.streak} day`} />
        <StatCard icon={Sparkles} label="XP" value={mockStats.xp.toString()} accent="accent" />
        <StatCard icon={TrendingUp} label="Accent score" value={`${mockStats.accentScore}%`} />
        <StatCard
          icon={Target}
          label="Weekly goal"
          value={`${mockStats.weeklyGoalPct}%`}
          accent="accent"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Today's lesson</CardTitle>
            <CardDescription>Personalized to your goals and weak sounds</CardDescription>
          </div>
          <Badge variant="secondary">Module 3</Badge>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Once lesson generation ships, your daily AI-generated lesson appears here.
          </p>
          <Button disabled>Start lesson</Button>
        </CardContent>
      </Card>
    </div>
  );
}
