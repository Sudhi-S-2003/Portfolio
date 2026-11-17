import type { ComponentPropsWithRef } from 'react';
import { cx } from './cx';
import { controlStyles, describedBy, Field, type FieldProps } from './Field';

type TextFieldProps = FieldProps & Omit<ComponentPropsWithRef<'input'>, 'id'>;

export function TextField({ id, label, hint, error, className, ...rest }: TextFieldProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cx(controlStyles, 'min-h-11', className)}
        {...rest}
      />
    </Field>
  );
}
