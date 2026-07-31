import { useState } from "react";
import { Mic, RotateCcw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { randomReferenceSentence } from "./reference-sentences";
import { useAudioRecorder } from "./use-audio-recorder";
import { usePracticeFlow } from "./use-practice";
import { PronunciationScoreCard } from "./pronunciation-score-card";

export function PracticeFlow({ basePath, hint }: { basePath: string; hint: string }) {
  const [referenceText] = useState(randomReferenceSentence);
  const { createSession, scoreSession } = usePracticeFlow(basePath);
  const recorder = useAudioRecorder();

  async function handleStop() {
    recorder.stop();
  }

  async function handleSubmit() {
    if (!recorder.blob) return;
    const session = await createSession.mutateAsync(referenceText);
    await scoreSession.mutateAsync({ sessionId: session.id, audio: recorder.blob });
  }

  function reset() {
    recorder.reset();
    createSession.reset();
    scoreSession.reset();
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{hint}</p>
          <p className="text-xl font-medium">{referenceText}</p>

          {recorder.status === "idle" && (
            <Button onClick={() => recorder.start()}>
              <Mic /> Start recording
            </Button>
          )}

          {recorder.status === "recording" && (
            <Button variant="destructive" onClick={handleStop}>
              <Square /> Stop
            </Button>
          )}

          {recorder.status === "recorded" && !scoreSession.data && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={reset}>
                <RotateCcw /> Redo
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createSession.isPending || scoreSession.isPending}
              >
                {createSession.isPending || scoreSession.isPending
                  ? "Scoring…"
                  : "Submit for scoring"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {scoreSession.error && (
        <p className="text-sm text-destructive">
          Couldn't score that — check that speech-to-text and LLM provider keys are configured.
        </p>
      )}

      {scoreSession.data?.pronunciationScore && (
        <>
          <PronunciationScoreCard score={scoreSession.data.pronunciationScore} />
          <Button variant="outline" className="self-center" onClick={reset}>
            Try another
          </Button>
        </>
      )}
    </div>
  );
}
