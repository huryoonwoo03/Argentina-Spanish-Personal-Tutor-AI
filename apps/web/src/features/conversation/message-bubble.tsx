import type { ConversationMessage } from "@che-speak/shared-types";
import { cn } from "@/lib/utils";

export function MessageBubble({ message }: { message: ConversationMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
        )}
      >
        {message.content}
      </div>
      {message.corrections.length > 0 && (
        <div className="max-w-[80%] rounded-lg border border-border bg-card p-2 text-xs text-muted-foreground">
          {message.corrections.map((c) => (
            <p key={c.original}>
              <span className="line-through">{c.original}</span> → <strong>{c.corrected}</strong>{" "}
              — {c.explanation}
            </p>
          ))}
        </div>
      )}
      {message.culturalNotes && (
        <p className="max-w-[80%] text-xs italic text-muted-foreground">
          Cultural note: {message.culturalNotes}
        </p>
      )}
    </div>
  );
}
