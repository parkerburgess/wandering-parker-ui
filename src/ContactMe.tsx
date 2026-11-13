"use client";

import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Button } from "./Button";
import { Turnstile } from "./Turnstile";

const MAX_MESSAGE_LENGTH = 5000;
const MAX_EMAIL_LENGTH = 254;

export interface ContactConfig {
  /** Full URL of the auth service's POST /api/contact. */
  endpoint: string;
  /** Shown in the email so Parker knows which app it came from. */
  sourceApp: string;
  /** Public Turnstile site key. Without it no widget renders. */
  turnstileSiteKey?: string;
  /**
   * The signed-in user's email. Pre-fills a read-only field; when missing
   * (the Guest account) the visitor must type one in.
   */
  userEmail?: string;
}

type SendStatus = "idle" | "sending" | "sent" | "error";

interface ContactErrorResponse {
  error?: string;
}

// Nav-bar button plus the modal form behind it. Sends straight to the auth
// service (decision 0003, option A), which emails Parker via Resend.
export function ContactMe({
  endpoint,
  sourceApp,
  turnstileSiteKey,
  userEmail,
}: ContactConfig) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(userEmail ?? "");
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [status, setStatus] = useState<SendStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isEmailLocked = Boolean(userEmail);
  const needsTurnstile = Boolean(turnstileSiteKey);
  const isSending = status === "sending";
  const canSend =
    !isSending &&
    email.trim() !== "" &&
    message.trim() !== "" &&
    (!needsTurnstile || turnstileToken !== "");

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
    setMessage("");
    setStatus("idle");
    setErrorMessage("");
    setTurnstileToken("");
    setEmail(userEmail ?? "");
  }

  function handleEmailChange(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }

  function handleMessageChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setMessage(e.target.value);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSend) return;

    setStatus("sending");
    setErrorMessage("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message, sourceApp, turnstileToken }),
      });
      if (response.ok) {
        setStatus("sent");
        return;
      }
      const body = (await response.json()) as ContactErrorResponse;
      showError(body.error ?? "Your message could not be sent.");
    } catch {
      showError("Your message could not be sent. Please try again later.");
    }
  }

  function showError(text: string) {
    setStatus("error");
    setErrorMessage(text);
    // The token was spent on the failed attempt; get a fresh one.
    setTurnstileResetKey(turnstileResetKey + 1);
  }

  // #region Tailwind utility consts
  // Matches SiteNav's inactive link so the button reads as a nav item.
  const navBtnCls =
    "py-2 text-sm font-medium border-b-2 border-transparent " +
    "text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer";
  const panelCls = "grid gap-4";
  const headingCls = "text-lg font-semibold text-neutral-900";
  const hintCls = "text-sm text-neutral-600";
  const errorCls = "text-sm text-danger-700";
  const actionsCls = "grid grid-flow-col auto-cols-max justify-end gap-2";
  // #endregion

  const sentPanel = (
    <div className={panelCls}>
      <h2 className={headingCls}>Message sent</h2>
      <p className={hintCls}>
        Thanks for reaching out. I&apos;ll reply to {email}.
      </p>
      <div className={actionsCls}>
        <Button type="button" onClick={handleClose}>
          Close
        </Button>
      </div>
    </div>
  );

  const formPanel = (
    <form className={panelCls} onSubmit={handleSubmit}>
      <h2 className={headingCls}>Contact Me</h2>
      <Input
        id="wp-contact-email"
        label="Your email"
        type="email"
        value={email}
        onChange={handleEmailChange}
        readOnly={isEmailLocked}
        required
        maxLength={MAX_EMAIL_LENGTH}
        placeholder="you@example.com"
      />
      <Textarea
        id="wp-contact-message"
        label="Message"
        value={message}
        onChange={handleMessageChange}
        required
        rows={6}
        maxLength={MAX_MESSAGE_LENGTH}
      />
      <Turnstile
        siteKey={turnstileSiteKey}
        onToken={setTurnstileToken}
        resetKey={turnstileResetKey}
      />
      {status === "error" && <p className={errorCls}>{errorMessage}</p>}
      <div className={actionsCls}>
        <Button type="button" variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSend}>
          {isSending ? "Sending…" : "Send"}
        </Button>
      </div>
    </form>
  );

  return (
    <>
      <button type="button" className={navBtnCls} onClick={handleOpen}>
        Contact Me
      </button>

      {isOpen && (
        <Modal onClose={handleClose} size="md" ariaLabel="Contact Me">
          {status === "sent" ? sentPanel : formPanel}
        </Modal>
      )}
    </>
  );
}
