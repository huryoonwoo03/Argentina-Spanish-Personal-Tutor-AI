import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useConversationMessages,
  useConversationSessions,
  useSendMessage,
  useStartConversation,
} from "./use-conversation";
import { MessageBubble } from "./message-bubble";

export function ConversationPage() {
  const { data: sessions, isLoading: sessionsLoading } = useConversationSessions();
  const startConversation = useStartConversation();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionsLoading || conversationId) return;
    if (sessions && sessions.length > 0) {
      setConversationId(sessions[0].id);
    } else if (sessions && sessions.length === 0) {
      startConversation.mutate(undefined, {
        onSuccess: (session) => setConversationId(session.id),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, sessionsLoading]);

  const { data: messages } = useConversationMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim() || !conversationId) return;
    const content = draft;
    setDraft("");
    sendMessage.mutate(content);
  }

  return (
    <div className="mx-auto flex h-[calc(100svh-8rem)] max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Conversation</h1>
        <p className="text-sm text-muted-foreground">
          Chat in Rioplatense Spanish — corrections and cultural notes appear alongside replies.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto rounded-lg border border-border p-4">
        <div className="flex flex-col gap-4">
          {messages?.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {sendMessage.isPending && (
            <p className="text-xs text-muted-foreground">Thinking…</p>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escribí algo…"
          disabled={!conversationId || sendMessage.isPending}
        />
        <Button type="submit" disabled={!conversationId || sendMessage.isPending}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
