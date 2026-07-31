import type { PronunciationScore } from "@che-speak/shared-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary">
        <div
          className="h-1.5 rounded-full bg-primary transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function PronunciationScoreCard({ score }: { score: PronunciationScore }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Authenticity score</span>
          <Badge>{score.overall}%</Badge>
        </div>
        <div className="grid gap-3">
          <ScoreBar label="Rhythm" value={score.rhythm} />
          <ScoreBar label="Intonation" value={score.intonation} />
          <ScoreBar label="Authenticity" value={score.authenticity} />
        </div>
        <p className="text-sm text-muted-foreground">{score.coaching}</p>
        {score.phonemeNotes.length > 0 && (
          <ul className="flex flex-col gap-2">
            {score.phonemeNotes.map((note) => (
              <li key={`${note.word}-${note.phoneme}`} className="rounded-md border border-border p-2 text-sm">
                <span className="font-medium">{note.word}</span> ({note.phoneme}): {note.issue}
                <p className="text-muted-foreground">{note.tip}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
