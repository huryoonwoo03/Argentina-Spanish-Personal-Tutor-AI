import type { LearnerProfile, Profile, UserPreferences } from "@che-speak/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface FullProfile {
  profile: Profile;
  learnerProfile: LearnerProfile;
  preferences: UserPreferences;
}

export function useProfileBundle() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get<FullProfile>("/api/v1/profile"),
  });
}

export function useUpdateLearnerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<LearnerProfile>) =>
      api.patch<LearnerProfile>("/api/v1/profile/learner", patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<UserPreferences>) =>
      api.patch<UserPreferences>("/api/v1/profile/preferences", patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}
