import * as RadixDialog from '@radix-ui/react-dialog';
import type { ReactElement, ReactNode } from 'react';
import { CloseIcon } from './icons';

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Accessible name of the close button, already translated. */
  closeLabel: string;
  /**
   * The button that opens the dialog. Passing it here (rather than opening the dialog from your own onClick)
   * lets Radix wire aria-expanded and aria-controls and return focus to it when the dialog closes.
   */
  trigger?: ReactElement;
  children: ReactNode;
};

/** A modal dialog: traps focus, closes on Escape or the close button, returns focus to its trigger when it closes. */
export function Dialog({ open, onOpenChange, title, description, closeLabel, trigger, children }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger> : null}
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-ink/45" />
        <RadixDialog.Content
          {...(description ? {} : { 'aria-describedby': undefined })}
          className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[min(calc(100vw-2rem),34rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-ui border border-line bg-paper-raised p-5 shadow-overlay sm:p-7"
        >
          <div className="flex items-start justify-between gap-4">
            <RadixDialog.Title className="pt-1 font-serif text-2xl">{title}</RadixDialog.Title>
            <RadixDialog.Close asChild>
              <button
                type="button"
                aria-label={closeLabel}
                className="-mt-1 -mr-2 inline-grid size-11 shrink-0 place-items-center rounded-ui text-ink-muted transition-colors hover:bg-paper-sunken hover:text-ink"
              >
                <CloseIcon />
              </button>
            </RadixDialog.Close>
          </div>
          {description ? (
            <RadixDialog.Description className="mt-2 text-ink-muted">{description}</RadixDialog.Description>
          ) : null}
          <div className="mt-5">{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
