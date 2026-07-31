import { useState } from "react";
import {
  Clapperboard,
  CircleDot,
  Coffee,
  Flame,
  type LucideIcon,
  Map,
  Music,
  Newspaper,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCultureTopic, useCultureTopics } from "./use-culture";

const ICONS: Record<string, LucideIcon> = {
  flame: Flame,
  coffee: Coffee,
  "circle-dot": CircleDot,
  music: Music,
  clapperboard: Clapperboard,
  map: Map,
  users: Users,
  newspaper: Newspaper,
};

export function CulturePage() {
  const { data: topics, isLoading } = useCultureTopics();
  const [selected, setSelected] = useState<string | null>(null);
  const { data: content, isFetching } = useCultureTopic(selected);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Culture</h1>
        <p className="text-sm text-muted-foreground">
          Food, football, music, history, and what's happening right now.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading topics…</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {topics?.map((topic) => {
          const Icon = ICONS[topic.icon] ?? Newspaper;
          return (
            <button key={topic.slug} type="button" onClick={() => setSelected(topic.slug)}>
              <Card
                className={cn(
                  "h-full text-left transition-colors hover:border-primary/50",
                  selected === topic.slug && "border-primary",
                )}
              >
                <CardContent className="flex items-center gap-3 py-4">
                  <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{topic.title}</p>
                    {topic.isCurrentEvent && (
                      <Badge variant="accent" className="mt-1">
                        Current
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      {selected && (
        <Card>
          <CardContent className="flex flex-col gap-3 py-5">
            {isFetching && <p className="text-sm text-muted-foreground">Generating…</p>}
            {content && (
              <>
                <p className="text-sm">{content.content.summary}</p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {content.content.keyPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5">
                  {content.content.vocabulary.map((word) => (
                    <Badge key={word} variant="outline">
                      {word}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm italic text-muted-foreground">
                  {content.content.discussionPrompt}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
