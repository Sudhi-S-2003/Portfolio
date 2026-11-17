import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from './Dialog';
import { IconButton } from './IconButton';
import { Menu } from './Menu';
import { StatusMessage } from './StatusMessage';
import { Table } from './Table';
import { TextArea } from './TextArea';
import { TextField } from './TextField';
import { TooltipProvider } from './Tooltip';

describe('TextField', () => {
  it('links the error message and marks the input invalid', () => {
    render(<TextField id="email" label="Email" error="Enter an email address like name@example.com" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/Enter an email address/);
  });

  it('links the hint when there is no error', () => {
    render(<TextField id="name" label="Your name" hint="So I know who I'm talking to" />);
    const input = screen.getByLabelText('Your name');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAccessibleDescription("So I know who I'm talking to");
  });
});

describe('TextArea', () => {
  it('is labelled and reports its error', () => {
    render(<TextArea id="message" label="Message" error="Write a few words" />);
    const area = screen.getByLabelText('Message');
    expect(area.tagName).toBe('TEXTAREA');
    expect(area).toHaveAccessibleDescription('Write a few words');
  });
});

describe('StatusMessage', () => {
  it('uses role="alert" for errors', () => {
    render(<StatusMessage tone="error">Could not save</StatusMessage>);
    expect(screen.getByRole('alert')).toHaveTextContent('Could not save');
  });

  it('uses role="status" for other tones', () => {
    render(<StatusMessage tone="info">Saved</StatusMessage>);
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
  });
});

describe('IconButton', () => {
  it('takes its accessible name from the label', () => {
    render(
      <TooltipProvider>
        <IconButton label="Switch to dark theme" icon={<svg />} />
      </TooltipProvider>,
    );
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument();
  });
});

function DialogHarness({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        onOpenChange(next);
      }}
      title="Send me a message"
      closeLabel="Close"
    >
      <input aria-label="Inside" />
    </Dialog>
  );
}

describe('Dialog', () => {
  it('has an accessible name and closes on Escape', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<DialogHarness onOpenChange={onOpenChange} />);
    expect(screen.getByRole('dialog', { name: 'Send me a message' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has a labelled close button', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<DialogHarness onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('Menu', () => {
  it('calls onChange with the chosen value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Menu
        label="Language"
        value="en"
        onChange={onChange}
        items={[
          { value: 'en', label: 'English' },
          { value: 'ml', label: 'മലയാളം', lang: 'ml' },
        ]}
      />,
    );
    await user.click(screen.getByRole('button', { name: /Language/ }));
    await user.click(await screen.findByRole('menuitemradio', { name: 'മലയാളം' }));
    expect(onChange).toHaveBeenCalledWith('ml');
  });
});

describe('Table', () => {
  it('renders a caption, column headers and cells', () => {
    render(<Table caption="Tools I use" columns={['Area', 'Tools']} rows={[['Backend', 'NestJS, Prisma']]} />);
    const table = screen.getByRole('table', { name: 'Tools I use' });
    expect(table).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Area' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'NestJS, Prisma' })).toBeInTheDocument();
  });
});
