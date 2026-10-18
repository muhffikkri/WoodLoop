"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import type { MaterialRequest, RequestMessage, User } from "@/domain/types";
import { demoRequestRepository } from "@/services/demo/request-repository";

function formatMessageTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export function RequestThread({
  request,
  currentUser,
  buyer,
  supplier,
}: {
  request: MaterialRequest;
  currentUser: User;
  buyer?: User | null;
  supplier?: User | null;
}) {
  const [messages, setMessages] = useState<RequestMessage[]>([]);
  const [inputBody, setInputBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isClosed =
    request.status === "completed" || request.status === "closed";

  useEffect(() => {
    let active = true;

    async function load() {
      const msgs = await demoRequestRepository.getMessages(request.id);
      if (active) setMessages(msgs);
    }

    void load();

    function onUpdate() {
      void load();
    }

    window.addEventListener("woodloop:requests-changed", onUpdate);
    return () => {
      active = false;
      window.removeEventListener("woodloop:requests-changed", onUpdate);
    };
  }, [request.id]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = inputBody.trim();
    if (!text || isSending || isClosed) return;

    setIsSending(true);
    setError(null);
    try {
      await demoRequestRepository.addMessage(request.id, text, currentUser.id);
      setInputBody("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send message.",
      );
    } finally {
      setIsSending(false);
    }
  }

  function getSenderInfo(senderId: string) {
    if (buyer && senderId === buyer.id) {
      return { name: buyer.displayName, role: "Buyer" };
    }
    if (supplier && senderId === supplier.id) {
      return { name: supplier.displayName, role: "Supplier" };
    }
    return { name: "Participant", role: "" };
  }

  return (
    <div className="border-line bg-surface rounded-lg border p-5 sm:p-6">
      <div className="flex items-center gap-2 border-b border-line pb-4">
        <MessageSquare aria-hidden="true" className="size-5 text-timber-600" />
        <h3 className="font-heading text-base font-semibold text-ink-900">
          Coordination messages
        </h3>
        <span className="text-ink-600 ml-auto text-xs">
          {messages.length} message{messages.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Message List */}
      <div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="text-ink-600 py-6 text-center text-xs italic">
            No messages sent yet. Use the message box below to coordinate pickup or delivery.
          </p>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.senderId === currentUser.id;
            const sender = getSenderInfo(msg.senderId);

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 text-xs text-ink-600 mb-1">
                  <span className="font-semibold text-ink-900">{sender.name}</span>
                  {sender.role ? (
                    <Badge variant="unverified" className="text-[10px] px-1 py-0">
                      {sender.role}
                    </Badge>
                  ) : null}
                  <span className="tabular-nums">{formatMessageTime(msg.createdAt)}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded-lg p-3 text-sm leading-5 ${
                    isSelf
                      ? "bg-brand-900 text-white rounded-tr-none"
                      : "bg-sage-100 text-ink-900 rounded-tl-none border border-line"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.body}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Composer or Closed Notice */}
      <div className="mt-5 border-t border-line pt-4">
        {isClosed ? (
          <Alert className="text-xs">
            This request is {request.status}. Messaging is archived and read-only.
          </Alert>
        ) : (
          <form onSubmit={handleSend} className="space-y-3">
            <Textarea
              value={inputBody}
              onChange={(e) => setInputBody(e.target.value)}
              placeholder="Type a message to coordinate pickup time, vehicle, or dimensions..."
              className="min-h-20 text-sm"
              disabled={isSending}
            />

            {error ? (
              <Alert variant="error" className="text-xs">
                {error}
              </Alert>
            ) : null}

            <div className="flex items-center justify-between">
              <span className="text-ink-600 text-xs">
                Coordinate offline handover details safely.
              </span>
              <Button
                type="submit"
                disabled={isSending || !inputBody.trim()}
                className="h-9 px-4 text-xs font-semibold"
              >
                <Send aria-hidden="true" className="mr-1.5 size-3.5" />
                {isSending ? "Sending..." : "Send message"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
