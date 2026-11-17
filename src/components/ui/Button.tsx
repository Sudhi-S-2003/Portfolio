import type { ButtonHTMLAttributes } from 'react';
import { cx } from './cx';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet';

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-ui px-4 py-2 text-center text-[0.9375rem] font-medium leading-snug no-underline transition-colors duration-150 hover:no-underline disabled:cursor-not-allowed disabled:opacity-55';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-ink hover:bg-accent-hover hover:text-accent-ink',
  secondary:
    'border border-line-field bg-paper-raised text-ink hover:border-ink-muted hover:bg-paper-sunken hover:text-ink',
  quiet: 'px-3 text-accent hover:bg-accent-soft hover:text-accent-hover',
};

/** Classes for anything that should look like a button, including links. */
export function buttonStyles(variant: ButtonVariant = 'primary', className?: string): string {
  return cx(base, variants[variant], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant };

export function Button({ variant = 'primary', className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={buttonStyles(variant, className)} {...rest} />;
}
