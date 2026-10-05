"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "@/components/i18n/locale-provider";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export type ChatStatus = "idle" | "waiting" | "streaming";

let nextId = 0;
const newId = () => `m${++nextId}`;

/**
 * Chat state + streaming from /api/chat. `onModeChange` lets the avatar react:
 * "thinking" until the first words arrive, "talking" while they stream, then "idle".
 */
export function useChat(onModeChange: (mode: "idle" | "thinking" | "talking") => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const modeRef = useRef(onModeChange);
  const t = useT();

  useEffect(() => {
    modeRef.current = onModeChange;
  }, [onModeChange]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(
    async (text: string, history: ChatMessage[]) => {
      const question = text.trim();
      if (!question) return;

      const user: ChatMessage = { id: newId(), role: "user", content: question };
      const assistantId = newId();
      const outgoing = [...history, user];
      setMessages(outgoing);
      setError(null);
      setStatus("waiting");
      modeRef.current("thinking");

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: outgoing.map(({ role, content }) => ({ role, content })) }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? t.chat.errors.generic);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let answer = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (!chunk) continue;
          if (!answer) {
            setStatus("streaming");
            modeRef.current("talking");
          }
          answer += chunk;
          const current = answer;
          setMessages((prev) => {
            const rest = prev.filter((m) => m.id !== assistantId);
            return [...rest, { id: assistantId, role: "assistant", content: current }];
          });
        }
        if (!answer.trim()) throw new Error(t.chat.errors.empty);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : t.chat.errors.generic);
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setStatus("idle");
        modeRef.current("idle");
      }
    },
    [t]
  );

  /** Re-asks the last question after an error. */
  const retry = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    const history = messages.slice(0, messages.lastIndexOf(lastUser));
    void send(lastUser.content, history);
  }, [messages, send]);

  return { messages, status, error, send: (text: string) => send(text, messages), retry };
}
