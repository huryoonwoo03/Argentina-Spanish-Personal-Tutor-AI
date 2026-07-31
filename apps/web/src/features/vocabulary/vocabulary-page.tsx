import { useState } from "react";
import type { VocabularyCategory, VocabularyLevel } from "@che-speak/shared-types";
import { cn } from "@/lib/utils";
import { ReviewDeck } from "./review-deck";
import { useVocabularyList } from "./use-vocabulary";
import { VocabularyCard } from "./vocabulary-card";

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function VocabularyPage() {
  const [tab, setTab] = useState<"review" | "browse">("review");
  const [level, setLevel] = useState<VocabularyLevel | "">("");
  const [category, setCategory] = useState<VocabularyCategory | "">("");

  const { data, isLoading } = useVocabularyList({
    level: level || undefined,
    category: category || undefined,
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vocabulary</h1>
        <p className="text-sm text-muted-foreground">
          Slang, idioms, and expressions — reviewed on a schedule that adapts to you.
        </p>
      </div>

      <div className="flex gap-2 border-b border-border">
        {(["review", "browse"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 border-transparent px-3 py-2 text-sm font-medium capitalize text-muted-foreground",
              tab === t && "border-primary text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "review" && <ReviewDeck />}

      {tab === "browse" && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <select
              className={selectClass}
              value={level}
              onChange={(e) => setLevel(e.target.value as VocabularyLevel | "")}
            >
              <option value="">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select
              className={selectClass}
              value={category}
              onChange={(e) => setCategory(e.target.value as VocabularyCategory | "")}
            >
              <option value="">All categories</option>
              <option value="slang">Slang</option>
              <option value="idiom">Idiom</option>
              <option value="expression">Expression</option>
              <option value="formal">Formal</option>
              <option value="internet">Internet</option>
            </select>
          </div>

          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

          <div className="grid gap-3 sm:grid-cols-2">
            {data?.items.map((item) => (
              <VocabularyCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
