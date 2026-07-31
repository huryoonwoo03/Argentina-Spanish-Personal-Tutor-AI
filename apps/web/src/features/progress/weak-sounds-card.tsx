import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WeakSoundsCard({ data }: { data: { phoneme: string; missCount: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.missCount));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Weak sounds</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No pronunciation misses yet — complete a few practice sessions to see patterns here.
          </p>
        )}
        {data.map((item) => (
          <div key={item.phoneme} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-sm font-mono">{item.phoneme}</span>
            <div className="h-2 flex-1 rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-destructive/70"
                style={{ width: `${(item.missCount / max) * 100}%` }}
              />
            </div>
            <span className="w-6 text-right text-xs text-muted-foreground">
              {item.missCount}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
