import type { Achievement, DailyProgress, ProgressSummary, UserAchievement } from "@che-speak/shared-types";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useProgressSummary() {
  return useQuery({
    queryKey: ["progress", "summary"],
    queryFn: () => api.get<ProgressSummary>("/api/v1/progress/summary"),
  });
}

export function useHeatmap() {
  return useQuery({
    queryKey: ["progress", "heatmap"],
    queryFn: () => api.get<DailyProgress[]>("/api/v1/progress/heatmap"),
  });
}

export function useAchievements() {
  return useQuery({
    queryKey: ["progress", "achievements"],
    queryFn: () =>
      api.get<{ achievement: Achievement; earned: UserAchievement | null }[]>(
        "/api/v1/progress/achievements",
      ),
  });
}
