import type { ReactNode } from 'react';

type TableProps = {
  caption: ReactNode;
  columns: ReactNode[];
  /** The first cell of each row is its header. */
  rows: ReactNode[][];
};

export function Table({ caption, columns, rows }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        {/* Pages already show a section heading above the table; the caption names it for screen readers. */}
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} scope="col" className="border-b border-line-strong py-2 pr-4 font-normal meta">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-line align-top">
              {row.map((cell, cellIndex) =>
                cellIndex === 0 ? (
                  <th key={cellIndex} scope="row" className="w-40 py-3 pr-4 font-medium text-ink">
                    {cell}
                  </th>
                ) : (
                  <td key={cellIndex} className="py-3 pr-4 text-ink">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
