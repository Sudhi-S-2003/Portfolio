import type { ReactNode } from 'react';

export type FieldProps = {
  id: string;
  label: ReactNode;
  /** Why the field is asked for, or what format it takes. */
  hint?: ReactNode;
  /** What is wrong and how to fix it. Setting it marks the control invalid. */
  error?: ReactNode;
};

/** Shared classes for text inputs, text areas and selects. */
export const controlStyles =
  'w-full rounded-ui border border-line-field bg-paper-raised px-3 py-2.5 text-ink transition-colors duration-150 placeholder:text-ink-muted hover:border-ink-muted aria-[invalid=true]:border-danger';

export function describedBy(id: string, hint?: ReactNode, error?: ReactNode): string | undefined {
  const ids = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

/** Label, hint, control and error message, wired together in one consistent layout. */
export function Field({ id, label, hint, error, children }: FieldProps & { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.9375rem] font-medium text-ink">
        {label}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
