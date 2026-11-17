import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';
import { Tooltip } from './Tooltip';

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & {
  /** Read by screen readers and shown as the tooltip. */
  label: string;
  icon: ReactNode;
};

export function IconButton({ label, icon, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <Tooltip content={label}>
      <button
        type={type}
        aria-label={label}
        className={cx(
          'inline-grid size-11 shrink-0 place-items-center rounded-ui text-ink-muted transition-colors duration-150 hover:bg-paper-sunken hover:text-ink',
          className,
        )}
        {...rest}
      >
        {icon}
      </button>
    </Tooltip>
  );
}
