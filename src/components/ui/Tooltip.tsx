import * as RadixTooltip from '@radix-ui/react-tooltip';
import type { ReactElement, ReactNode } from 'react';

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <RadixTooltip.Provider delayDuration={350}>{children}</RadixTooltip.Provider>;
}

/** A short hint shown on hover and keyboard focus. The trigger must already have its own accessible name. */
export function Tooltip({ content, children }: { content: ReactNode; children: ReactElement }) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          sideOffset={6}
          className="z-50 max-w-60 rounded-ui bg-ink px-2.5 py-1.5 text-sm leading-snug text-paper shadow-overlay"
        >
          {content}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
