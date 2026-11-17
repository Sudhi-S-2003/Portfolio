/** First focusable element on every page: jumps keyboard users past the header. */
export function SkipLink({ targetId, label }: { targetId: string; label: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only rounded-ui bg-paper-raised px-4 py-2 font-medium shadow-overlay focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
    >
      {label}
    </a>
  );
}
