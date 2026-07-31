import { useState } from "react";
import { Flame, Sparkles, Target, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "./use-dashboard";
import { useCompleteLesson, useTodayLesson } from "./use-today-lesson";
import { StatCard } from "./stat-card";

export function DashboardPage() {
  const { data: dashboard, isLoading } = useDashboard();
  const [lessonStarted, setLessonStarted] = useState(false);
  const { data: lesson, isFetching: lessonLoading, error: lessonError } = useTodayLesson(
    lessonStarted,
  );
  const completeLesson = useCompleteLesson();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Che, welcome back.</h1>
        <p className="text-sm text-muted-foreground">
          Stop studying Spanish. Start living Argentina.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Flame} label="Streak" value={isLoading ? "…" : `${dashboard?.streak} day`} />
        <StatCard
          icon={Sparkles}
          label="XP"
          value={isLoading ? "…" : String(dashboard?.xp)}
          accent="accent"
        />
        <StatCard
          icon={TrendingUp}
          label="Accent score"
          value={isLoading ? "…" : `${dashboard?.accentScore ?? "—"}%`}
        />
        <StatCard
          icon={Target}
          label="Weekly goal"
          value={isLoading ? "…" : `${dashboard?.weeklyGoalPct}%`}
          accent="accent"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Today's lesson</CardTitle>
            <CardDescription>Personalized to your goals and weak sounds</CardDescription>
          </div>
          {dashboard?.hasTodayLesson && <Badge variant="secondary">Ready</Badge>}
        </CardHeader>
        <CardContent>
          {!lessonStarted && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Your daily AI-generated lesson, tailored to your level and interests.
              </p>
              <Button onClick={() => setLessonStarted(true)}>Start lesson</Button>
            </div>
          )}

          {lessonStarted && lessonLoading && (
            <p className="text-sm text-muted-foreground">Generating your lesson…</p>
          )}

          {lessonStarted && lessonError && (
            <p className="text-sm text-destructive">
              Couldn't generate a lesson right now — check that an LLM provider key is configured.
            </p>
          )}

          {lessonStarted && lesson && (
            <div className="flex flex-col gap-3">
              <div>
                <h3 className="font-medium">{lesson.content.title}</h3>
                <p className="text-sm text-muted-foreground">{lesson.content.summary}</p>
              </div>
              <ul className="flex flex-col gap-2">
                {lesson.content.exercises.map((exercise, index) => (
                  <li key={exercise.id} className="rounded-md border border-border p-3 text-sm">
                    <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                    {exercise.prompt}
                  </li>
                ))}
              </ul>
              <Button
                className="self-start"
                disabled={completeLesson.isPending || completeLesson.isSuccess}
                onClick={() => completeLesson.mutate(lesson.id)}
              >
                {completeLesson.isSuccess ? "Completed!" : "Mark lesson complete"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
