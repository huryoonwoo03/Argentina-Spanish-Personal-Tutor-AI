import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface CultureTopicMeta {
  slug: string;
  title: string;
  category: string;
  icon: string;
  isCurrentEvent: boolean;
}

export interface CultureContent {
  summary: string;
  keyPoints: string[];
  vocabulary: string[];
  discussionPrompt: string;
}

interface CachedCultureContent {
  id: string;
  content: CultureContent;
  fromCache: boolean;
}

export function useCultureTopics() {
  return useQuery({
    queryKey: ["culture", "topics"],
    queryFn: () => api.get<CultureTopicMeta[]>("/api/v1/culture/topics"),
  });
}

export function useCultureTopic(slug: string | null) {
  return useQuery({
    queryKey: ["culture", "topic", slug],
    queryFn: () => api.get<CachedCultureContent>(`/api/v1/culture/topics/${slug}`),
    enabled: Boolean(slug),
  });
}
