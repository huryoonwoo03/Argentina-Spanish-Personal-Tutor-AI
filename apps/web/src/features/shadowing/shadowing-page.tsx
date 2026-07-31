import { PracticeFlow } from "@/features/practice/practice-flow";

export function ShadowingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Shadowing</h1>
        <p className="text-sm text-muted-foreground">
          Say it in your head the way a porteño would, then repeat it out loud and compare.
        </p>
      </div>
      <PracticeFlow basePath="/api/v1/shadowing" hint="Shadow this phrase" />
    </div>
  );
}
