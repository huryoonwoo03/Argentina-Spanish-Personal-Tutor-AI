import { AchievementsGrid } from "./achievements-grid";
import { Heatmap } from "./heatmap";
import { useAchievements, useHeatmap, useProgressSummary } from "./use-progress";
import { WeakSoundsCard } from "./weak-sounds-card";
import { XpChart } from "./xp-chart";

export function ProgressPage() {
  const { data: summary, isLoading: summaryLoading } = useProgressSummary();
  const { data: heatmap, isLoading: heatmapLoading } = useHeatmap();
  const { data: achievements, isLoading: achievementsLoading } = useAchievements();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
        <p className="text-sm text-muted-foreground">
          Every session, tracked — so you can see the accent forming.
        </p>
      </div>

      {summaryLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <XpChart data={summary?.xpOverTime ?? []} />
          <WeakSoundsCard data={summary?.weakSounds ?? []} />
        </div>
      )}

      {!heatmapLoading && heatmap && <Heatmap data={heatmap} />}

      <div>
        <h2 className="mb-3 text-lg font-medium">Achievements</h2>
        {achievementsLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <AchievementsGrid data={achievements ?? []} />
        )}
      </div>
    </div>
  );
}
