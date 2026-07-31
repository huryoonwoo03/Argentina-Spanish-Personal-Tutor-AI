import type { LessonContent } from "@che-speak/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface CachedLesson {
  id: string;
  content: LessonContent;
  fromCache: boolean;
}

export function useTodayLesson(enabled: boolean) {
  return useQuery({
    queryKey: ["lessons", "today"],
    queryFn: () => api.get<CachedLesson>("/api/v1/lessons/today"),
    enabled,
  });
}

export function useCompleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => api.post(`/api/v1/lessons/${lessonId}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
