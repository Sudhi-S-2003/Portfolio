import type { ComponentPropsWithRef } from 'react';
import { cx } from './cx';
import { controlStyles, describedBy, Field, type FieldProps } from './Field';
import { ChevronDownIcon } from './icons';

type SelectProps = FieldProps &
  Omit<ComponentPropsWithRef<'select'>, 'id'> & {
    options: Array<{ value: string; label: string }>;
  };

/** A native select: the most reliable dropdown on phones and with screen readers, styled to match. */
export function Select({ id, label, hint, error, options, className, ...rest }: SelectProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cx(controlStyles, 'min-h-11 cursor-pointer appearance-none pr-10', className)}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-ink-muted">
          <ChevronDownIcon />
        </span>
      </div>
    </Field>
  );
}
