import type { ReactNode, Ref } from 'react';
import { cx } from './cx';

export type StatusTone = 'info' | 'success' | 'warning' | 'error';

const tones: Record<StatusTone, string> = {
  info: 'border-line bg-paper-sunken',
  success: 'border-success/35 bg-success-soft',
  warning: 'border-warning/35 bg-warning-soft',
  error: 'border-danger/35 bg-danger-soft',
};

const titleTones: Record<StatusTone, string> = {
  info: 'text-ink',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-danger',
};

type StatusMessageProps = {
  tone: StatusTone;
  title?: ReactNode;
  children?: ReactNode;
  /** A follow-up the visitor can take, such as a link or button. */
  action?: ReactNode;
  /**
   * Pass a ref to move focus here when the message appears, so keyboard and screen-reader users are taken to it.
   * (A live region that appears together with its text is not reliably announced.)
   */
  focusRef?: Ref<HTMLDivElement>;
};

/** Tells the visitor what is happening and what they can do. Errors are announced immediately. */
export function StatusMessage({ tone, title, children, action, focusRef }: StatusMessageProps) {
  return (
    <div
      ref={focusRef}
      tabIndex={focusRef ? -1 : undefined}
      role={tone === 'error' ? 'alert' : 'status'}
      className={cx('rounded-ui border p-4 outline-none focus-visible:outline-2', tones[tone])}
    >
      {title ? <p className={cx('font-medium', titleTones[tone])}>{title}</p> : null}
      {children ? (
        <div className={cx('text-ink [overflow-wrap:anywhere]', title ? 'mt-1' : null)}>{children}</div>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
