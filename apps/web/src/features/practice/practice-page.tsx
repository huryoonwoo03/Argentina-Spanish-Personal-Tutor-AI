import { PracticeFlow } from "./practice-flow";

export function PracticePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Practice</h1>
        <p className="text-sm text-muted-foreground">
          Record yourself and get rhythm, intonation, and authenticity coaching.
        </p>
      </div>
      <PracticeFlow basePath="/api/v1/practice" hint="Read this out loud" />
    </div>
  );
}
