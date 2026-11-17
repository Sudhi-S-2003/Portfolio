import { useId } from 'react';

/**
 * A monospace architecture sketch. Screen readers get the caption instead of the box-drawing characters;
 * the sketch scrolls sideways on narrow screens and can be scrolled with the keyboard.
 */
export function Diagram({ diagram, caption }: { diagram: string; caption: string }) {
  const captionId = useId();
  return (
    <figure className="mt-6">
      <pre
        role="img"
        aria-labelledby={captionId}
        tabIndex={0}
        className="overflow-x-auto rounded-ui border border-line bg-paper-sunken p-4 font-mono text-[0.75rem] leading-relaxed text-ink sm:text-[0.8125rem]"
      >
        {diagram}
      </pre>
      <figcaption id={captionId} className="mt-2 text-sm text-ink-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
