import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfileBundle, useUpdateLearnerProfile, useUpdatePreferences } from "./use-settings";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SettingsPage() {
  const { data, isLoading } = useProfileBundle();
  const updatePreferences = useUpdatePreferences();
  const updateLearnerProfile = useUpdateLearnerProfile();

  const [favoriteTopics, setFavoriteTopics] = useState("");
  const [profession, setProfession] = useState("");

  useEffect(() => {
    if (data) {
      setFavoriteTopics(data.learnerProfile.favoriteTopics.join(", "));
      setProfession(data.learnerProfile.profession ?? "");
    }
  }, [data]);

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">Loading settings…</p>;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Tune how Che, Speak! sounds and adapts to you.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Voice & accent</CardTitle>
          <CardDescription>Playback speed and which region's accent you're learning</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="voice-speed">Voice speed ({data.preferences.voiceSpeed.toFixed(2)}x)</Label>
            <input
              id="voice-speed"
              type="range"
              min={0.5}
              max={1.5}
              step={0.05}
              defaultValue={data.preferences.voiceSpeed}
              onMouseUp={(e) =>
                updatePreferences.mutate({ voiceSpeed: Number(e.currentTarget.value) })
              }
              onTouchEnd={(e) =>
                updatePreferences.mutate({ voiceSpeed: Number(e.currentTarget.value) })
              }
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="accent-region">Accent region</Label>
            <select
              id="accent-region"
              className={selectClass}
              defaultValue={data.preferences.accentRegion}
              onChange={(e) => updatePreferences.mutate({ accentRegion: e.target.value })}
            >
              <option value="rioplatense">Rioplatense (Buenos Aires)</option>
              <option value="cordobes">Cordobés</option>
              <option value="patagonico">Patagónico</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Notifications</Label>
            <input
              id="notifications"
              type="checkbox"
              className="size-4"
              defaultChecked={data.preferences.notificationsEnabled}
              onChange={(e) =>
                updatePreferences.mutate({ notificationsEnabled: e.target.checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Learner profile</CardTitle>
          <CardDescription>
            Feeds every lesson, conversation, and recommendation — the more accurate, the better
            it adapts.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="level">Vocabulary level</Label>
            <select
              id="level"
              className={selectClass}
              defaultValue={data.learnerProfile.vocabularyLevel}
              onChange={(e) =>
                updateLearnerProfile.mutate({
                  vocabularyLevel: e.target.value as "beginner" | "intermediate" | "advanced",
                })
              }
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pace">Learning pace</Label>
            <select
              id="pace"
              className={selectClass}
              defaultValue={data.learnerProfile.learningPace}
              onChange={(e) =>
                updateLearnerProfile.mutate({
                  learningPace: e.target.value as "relaxed" | "steady" | "intense",
                })
              }
            >
              <option value="relaxed">Relaxed</option>
              <option value="steady">Steady</option>
              <option value="intense">Intense</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="profession">Profession</Label>
            <Input
              id="profession"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              onBlur={() => updateLearnerProfile.mutate({ profession })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="topics">Favorite topics (comma-separated)</Label>
            <Input
              id="topics"
              value={favoriteTopics}
              onChange={(e) => setFavoriteTopics(e.target.value)}
              onBlur={() =>
                updateLearnerProfile.mutate({
                  favoriteTopics: favoriteTopics
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
          {updateLearnerProfile.isSuccess && (
            <p className="text-xs text-muted-foreground">Saved.</p>
          )}
        </CardContent>
      </Card>

      <Button variant="outline" className="self-start" disabled>
        Delete account (coming soon)
      </Button>
    </div>
  );
}
