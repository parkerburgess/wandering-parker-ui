export function SlowRequestNotice({
  message,
  className,
}: {
  message: string | null;
  className?: string;
}) {
  // #region Tailwind utility consts
  const baseNoticeCls =
    "flex items-center gap-2 rounded-lg border border-caution-200 bg-caution-100 px-3 py-2 text-sm text-caution-800";
  const spinnerCls = "h-4 w-4 shrink-0 animate-spin text-caution-600";
  // #endregion

  if (!message) return null;

  return (
    <div role="status" className={`${baseNoticeCls} ${className ?? ""}`}>
      <svg
        className={spinnerCls}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
}
