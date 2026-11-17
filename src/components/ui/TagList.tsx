/** A plain list of technology names in monospace. Not translated: these are product names. */
export function TagList({ items, label }: { items: string[]; label: string }) {
  return (
    <ul aria-label={label} className="meta flex flex-wrap gap-x-3 gap-y-1 font-mono">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
