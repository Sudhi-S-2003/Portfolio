import type { ComponentPropsWithRef } from 'react';
import { cx } from './cx';
import { controlStyles, describedBy, Field, type FieldProps } from './Field';

type TextAreaProps = FieldProps & Omit<ComponentPropsWithRef<'textarea'>, 'id'>;

export function TextArea({ id, label, hint, error, className, rows = 6, ...rest }: TextAreaProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cx(controlStyles, 'min-h-32 resize-y', className)}
        {...rest}
      />
    </Field>
  );
}
