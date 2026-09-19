"use client";

import { useEffect, useRef } from "react";

type Size = "sm" | "md" | "lg";

const sizeCls: Record<Size, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  size?: Size;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  noPadding?: boolean;
  ariaLabel?: string;
}

export function Modal({
  onClose,
  children,
  size = "sm",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  initialFocusRef,
  noPadding = false,
  ariaLabel,
}: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initialFocusRef?.current?.focus();
  }, [initialFocusRef]);

  useEffect(() => {
    if (!closeOnEscape) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [closeOnEscape, onClose]);

  // #region Tailwind utility consts
  const backdropCls = "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
  // Same two-layer treatment as the user-menu dropdown: a tight 1px ring
  // plus a wide diffuse halo, both in one arbitrary value since Tailwind
  // needs the complete class name in source text to generate it.
  const modalGlowCls =
    "shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_20%,transparent),0_0_24px_4px_color-mix(in_oklch,var(--primary)_35%,transparent)]";
  const cardCls =
    `bg-card rounded-lg border border-primary-600 w-full mx-4 max-h-[90vh] overflow-y-auto ` +
    `${modalGlowCls} ${sizeCls[size]} ${noPadding ? "" : "p-6"}`;
  // #endregion

  function handleBackdropClick(e: React.MouseEvent) {
    if (closeOnBackdropClick && e.target === backdropRef.current) onClose();
  }

  return (
    <div
      id="wp-modal"
      ref={backdropRef}
      className={backdropCls}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={handleBackdropClick}
    >
      <div className={cardCls}>{children}</div>
    </div>
  );
}
