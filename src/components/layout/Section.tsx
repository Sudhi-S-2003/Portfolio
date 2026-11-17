import { useId, type ReactNode } from 'react';
import { cx } from '../ui/cx';

/**
 * A page section in the notebook layout: a small label in the left margin on wide screens,
 * stacked above the content on phones.
 */
export function Section({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={cx('grid gap-3 border-t border-line py-10 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-x-12', className)}
    >
      <h2 id={id} className="meta pt-1">
        {label}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
