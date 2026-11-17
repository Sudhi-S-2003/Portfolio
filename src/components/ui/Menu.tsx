import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { ReactNode } from 'react';
import { CheckIcon, ChevronDownIcon } from './icons';

type MenuItem = { value: string; label: string; lang?: string };

type MenuProps = {
  /** What the menu chooses, e.g. "Language". Read by screen readers before the current value. */
  label: string;
  items: MenuItem[];
  value: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
};

/** A single-choice menu (used for the language switcher). Keyboard: Enter/Space opens, arrows move, Escape closes. */
export function Menu({ label, items, value, onChange, icon }: MenuProps) {
  const current = items.find((item) => item.value === value) ?? items[0];
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-ui px-2.5 text-[0.9375rem] text-ink-muted transition-colors hover:bg-paper-sunken hover:text-ink data-[state=open]:bg-paper-sunken data-[state=open]:text-ink"
        >
          {icon}
          <span className="sr-only">{label}</span>
          <span lang={current?.lang}>{current?.label}</span>
          <ChevronDownIcon />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-44 rounded-ui border border-line bg-paper-raised p-1 shadow-overlay"
        >
          <DropdownMenu.Label className="px-3 pt-2 pb-1 meta">{label}</DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={value} onValueChange={onChange}>
            {items.map((item) => (
              <DropdownMenu.RadioItem
                key={item.value}
                value={item.value}
                lang={item.lang}
                className="flex min-h-11 cursor-pointer items-center justify-between gap-6 rounded-[4px] px-3 text-ink outline-none data-[highlighted]:bg-paper-sunken"
              >
                {item.label}
                <DropdownMenu.ItemIndicator className="text-accent">
                  <CheckIcon />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
