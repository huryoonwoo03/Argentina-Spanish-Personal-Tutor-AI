import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRecommendedVocabulary, useReviewVocabulary } from "./use-vocabulary";

export function ReviewDeck() {
  const { data: items, isLoading } = useRecommendedVocabulary();
  const review = useReviewVocabulary();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading review deck…</p>;
  if (!items || items.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Nothing due for review right now — check back later or browse the catalog.
        </CardContent>
      </Card>
    );
  }

  if (index >= items.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Deck complete for now. ¡Bien hecho!
        </CardContent>
      </Card>
    );
  }

  const item = items[index];

  function next(outcome: "again" | "hard" | "good" | "easy") {
    review.mutate({ id: item.id, outcome });
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  return (
    <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <p className="text-xs text-muted-foreground">
            {index + 1} / {items.length}
          </p>
          <h3 className="text-2xl font-semibold">{item.term}</h3>
          {revealed ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">{item.definition}</p>
              {item.examples[0] && (
                <p className="text-sm italic text-muted-foreground">
                  "{item.examples[0].spanish}"
                </p>
              )}
            </div>
          ) : (
            <Button variant="outline" onClick={() => setRevealed(true)}>
              Reveal
            </Button>
          )}

          {revealed && (
            <div className="mt-2 grid grid-cols-4 gap-2">
              <Button variant="destructive" size="sm" onClick={() => next("again")}>
                Again
              </Button>
              <Button variant="outline" size="sm" onClick={() => next("hard")}>
                Hard
              </Button>
              <Button variant="secondary" size="sm" onClick={() => next("good")}>
                Good
              </Button>
              <Button size="sm" onClick={() => next("easy")}>
                Easy
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
