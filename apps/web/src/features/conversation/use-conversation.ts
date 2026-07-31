import type { ConversationMessage, ConversationSession } from "@che-speak/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useConversationSessions() {
  return useQuery({
    queryKey: ["conversation", "sessions"],
    queryFn: () => api.get<ConversationSession[]>("/api/v1/conversation/sessions"),
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<ConversationSession>("/api/v1/conversation/sessions"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversation", "sessions"] }),
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["conversation", "messages", conversationId],
    queryFn: () =>
      api.get<ConversationMessage[]>(`/api/v1/conversation/sessions/${conversationId}/messages`),
    enabled: Boolean(conversationId),
  });
}

export function useSendMessage(conversationId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      api.post<ConversationMessage>(
        `/api/v1/conversation/sessions/${conversationId}/messages`,
        { content },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation", "messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
