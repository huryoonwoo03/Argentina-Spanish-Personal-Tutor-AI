import type { PracticeSession } from "@che-speak/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function usePracticeFlow(basePath: string) {
  const queryClient = useQueryClient();

  const createSession = useMutation({
    mutationFn: (referenceText: string) =>
      api.post<PracticeSession>(`${basePath}/sessions`, { referenceText }),
  });

  const scoreSession = useMutation({
    mutationFn: async ({ sessionId, audio }: { sessionId: string; audio: Blob }) => {
      const form = new FormData();
      form.append("audio", audio, "recording.webm");
      return api.post<PracticeSession>(`${basePath}/sessions/${sessionId}/score`, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });

  return { createSession, scoreSession };
}
