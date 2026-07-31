import type { VocabularyItem } from "@che-speak/shared-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function VocabularyCard({ item }: { item: VocabularyItem }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">{item.term}</CardTitle>
        <div className="flex gap-1.5">
          <Badge variant="outline">{item.level}</Badge>
          <Badge variant="secondary">{item.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0">
        <p className="text-sm text-muted-foreground">{item.definition}</p>
        {item.examples.slice(0, 1).map((example) => (
          <div key={example.spanish} className="rounded-md bg-secondary/50 p-2 text-sm">
            <p>{example.spanish}</p>
            <p className="text-muted-foreground">{example.english}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
