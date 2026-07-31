import type {
  Paginated,
  VocabularyCategory,
  VocabularyItem,
  VocabularyLevel,
} from "@che-speak/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface VocabularyFilters {
  level?: VocabularyLevel;
  category?: VocabularyCategory;
}

function toQuery(filters: VocabularyFilters): string {
  const params = new URLSearchParams();
  if (filters.level) params.set("level", filters.level);
  if (filters.category) params.set("category", filters.category);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useVocabularyList(filters: VocabularyFilters) {
  return useQuery({
    queryKey: ["vocabulary", "list", filters],
    queryFn: () =>
      api.get<Paginated<VocabularyItem>>(`/api/v1/vocabulary${toQuery(filters)}`),
  });
}

export function useRecommendedVocabulary() {
  return useQuery({
    queryKey: ["vocabulary", "recommended"],
    queryFn: () => api.get<VocabularyItem[]>("/api/v1/vocabulary/recommended"),
  });
}

export function useReviewVocabulary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, outcome }: { id: string; outcome: "again" | "hard" | "good" | "easy" }) =>
      api.post(`/api/v1/vocabulary/${id}/review`, { outcome }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary", "recommended"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
