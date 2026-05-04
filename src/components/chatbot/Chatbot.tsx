import type { FC } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEscape } from "@shared/hooks";
import type { ChatOption } from "@i18n";
import type { ChatBubbleEntry, ChatStage, ChatbotProps } from "./Chatbot.interfaces";

const TYPING_MS = 800;
const FOLLOWUP_MS = 600;

export const Chatbot: FC<ChatbotProps> = ({ chat, contactHref }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [bubbles, setBubbles] = useState<ReadonlyArray<ChatBubbleEntry>>([
    { id: "greet", author: "bot", text: chat.greet },
  ]);
  const [stage, setStage] = useState<ChatStage>({ kind: "menu" });
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const fabRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback((): void => {
    setOpen(false);
    fabRef.current?.focus();
  }, []);

  useEscape(open, close);

  useEffect(() => {
    const openChat = (): void => {
      setOpen(true);
    };

    window.addEventListener("markish:open-chat", openChat);
    return () => window.removeEventListener("markish:open-chat", openChat);
  }, []);

  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [bubbles, stage]);

  const reset = useCallback((): void => {
    setBubbles([{ id: "greet", author: "bot", text: chat.greet }]);
    setStage({ kind: "menu" });
  }, [chat.greet]);

  const pickOption = useCallback(
    (option: ChatOption): void => {
      const userBubbleId = `u-${Date.now()}`;
      setBubbles((current) => [
        ...current,
        { id: userBubbleId, author: "user", text: option.label },
      ]);
      setStage({ kind: "typing" });

      window.setTimeout(() => {
        setBubbles((current) => [
          ...current,
          { id: `b-${Date.now()}`, author: "bot", text: option.reply },
        ]);
        window.setTimeout(() => {
          setBubbles((current) => [
            ...current,
            { id: `f-${Date.now()}`, author: "bot", text: chat.end },
          ]);
          setStage({ kind: "followup" });
        }, FOLLOWUP_MS);
      }, TYPING_MS);
    },
    [chat.end]
  );

  return (
    <>
      <button
        type="button"
        ref={fabRef}
        className="chat-fab"
        aria-label={open ? chat.close_label : chat.open_label}
        aria-expanded={open ? "true" : "false"}
        aria-controls="chat-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
          <path
            d="M21 12a8 8 0 0 1-12.4 6.7L3 20l1.3-5.5A8 8 0 1 1 21 12z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div
          id="chat-panel"
          className="chat-panel"
          role="dialog"
          aria-modal="false"
          aria-label={chat.title}
        >
          <header className="chat-head">
            <span className="avatar" aria-hidden="true">M</span>
            <div>
              <div className="ttl">{chat.title}</div>
              <div className="sub">{chat.status}</div>
            </div>
            <button type="button" className="close" onClick={close} aria-label={chat.close_label}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
                <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </header>
          <div className="chat-body" ref={bodyRef} role="log" aria-live="polite" aria-relevant="additions">
            {bubbles.map((bubble) => (
              <div key={bubble.id} className={`bubble ${bubble.author}`}>
                {bubble.text}
              </div>
            ))}
            {stage.kind === "typing" && (
              <div className="typing" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            {stage.kind === "menu" && (
              <div className="chat-options">
                {chat.options.map((option) => (
                  <button key={option.id} type="button" onClick={() => pickOption(option)}>
                    <span>{option.label}</span>
                    <span className="arr" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </span>
                  </button>
                ))}
              </div>
            )}
            {stage.kind === "followup" && (
              <div className="chat-options">
                <a className="btn btn-primary" href={contactHref} onClick={close}>
                  {chat.end_yes}
                </a>
                <button type="button" onClick={reset}>
                  <span>{chat.end_no}</span>
                </button>
              </div>
            )}
          </div>
          <footer className="chat-foot">
            <span>{chat.foot}</span>
            <button
              type="button"
              onClick={reset}
              style={{
                marginLeft: "auto",
                background: "transparent",
                border: 0,
                color: "inherit",
                fontFamily: "inherit",
                fontSize: "inherit",
                letterSpacing: "inherit",
                textTransform: "inherit",
                cursor: "pointer",
              }}
            >
              {chat.restart}
            </button>
          </footer>
        </div>
      )}
    </>
  );
};

export default Chatbot;
