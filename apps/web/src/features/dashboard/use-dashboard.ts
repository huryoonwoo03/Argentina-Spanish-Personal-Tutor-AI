import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface DashboardSummary {
  streak: number;
  xp: number;
  accentScore: number | null;
  weeklyGoalPct: number;
  hasTodayLesson: boolean;
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardSummary>("/api/v1/dashboard"),
  });
}
