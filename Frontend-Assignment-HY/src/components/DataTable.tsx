import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Loader2, Info } from 'lucide-react';

interface Column<T> {
  key: string;
  title: string;
  dataIndex: keyof T;
  sortable?: boolean;
  render?: (value: T[keyof T], record: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  selectable?: boolean;
  onRowSelect?: (selectedRows: T[]) => void;
  rowKey: keyof T;
}

type SortOrder = 'asc' | 'desc' | null;

function DataTable<T extends object>({
  data = [],
  columns = [],
  loading = false,
  selectable = false,
  onRowSelect,
  rowKey
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortOrder) return data;
    const sorted = [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, sortKey, sortOrder]);

  const handleSelectRow = (row: T) => {
    setSelectedRows((prev) => {
      const isSelected = prev.some((r) => r[rowKey] === row[rowKey]);
      const newSelection = isSelected
        ? prev.filter((r) => r[rowKey] !== row[rowKey])
        : [...prev, row];
      if (onRowSelect) {
        onRowSelect(newSelection);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    setSelectedRows((prev) => {
      const newSelection = prev.length === data.length ? [] : [...data];
      if (onRowSelect) {
        onRowSelect(newSelection);
      }
      return newSelection;
    });
  };

  const isAllSelected =
    data && data.length > 0 && selectedRows.length === data.length;
  const isIndeterminate =
    selectedRows.length > 0 && selectedRows.length < data.length;

  const TableHeader = () => (
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        {selectable && (
          <th scope="col" className="p-4">
            <div className="flex items-center">
              <input
                id="checkbox-all"
                type="checkbox"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isIndeterminate;
                }}
                onChange={handleSelectAll}
              />
              <label htmlFor="checkbox-all" className="sr-only">
                Select all items
              </label>
            </div>
          </th>
        )}
        {columns.map((col) => (
          <th
            key={col.key}
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {col.sortable ? (
              <button
                onClick={() => handleSort(col.dataIndex)}
                className="flex items-center gap-1.5 hover:text-gray-800 dark:hover:text-white focus:outline-none"
              >
                {col.title}
                {sortKey === col.dataIndex ? (
                  sortOrder === 'asc' ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-300 dark:text-gray-500" />
                )}
              </button>
            ) : (
              col.title
            )}
          </th>
        ))}
      </tr>
    </thead>
  );

  const TableBody = () => (
    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
      {sortedData.map((row, index) => (
        <tr
          key={String(row[rowKey])}
          className={`hover:bg-gray-50 dark:hover:bg-gray-600 ${
            selectedRows.some((r) => r[rowKey] === row[rowKey])
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : ''
          }`}
        >
          {selectable && (
            <td className="p-4">
              <div className="flex items-center">
                <input
                  id={`checkbox-table-${index}`}
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  checked={selectedRows.some((r) => r[rowKey] === row[rowKey])}
                  onChange={() => handleSelectRow(row)}
                />
                <label htmlFor={`checkbox-table-${index}`} className="sr-only">
                  Select row
                </label>
              </div>
            </td>
          )}
          {columns.map((col) => (
            <td
              key={col.key}
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200"
            >
              {col.render
                ? col.render(row[col.dataIndex], row)
                : String(row[col.dataIndex])}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  const LoadingState = () => (
    <tbody>
      <tr>
        <td
          colSpan={columns.length + (selectable ? 1 : 0)}
          className="text-center py-16"
        >
          <div className="flex justify-center items-center gap-3 text-gray-500 dark:text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-lg">Loading data...</span>
          </div>
        </td>
      </tr>
    </tbody>
  );

  const EmptyState = () => (
    <tbody>
      <tr>
        <td
          colSpan={columns.length + (selectable ? 1 : 0)}
          className="text-center py-16"
        >
          <div className="flex flex-col justify-center items-center gap-3 text-gray-500 dark:text-gray-400">
            <Info className="h-10 w-10" />
            <span className="text-lg font-medium">No Data Available</span>
            <p className="text-sm">
              There are no records to display at the moment.
            </p>
          </div>
        </td>
      </tr>
    </tbody>
  );

  return (
    <div className="shadow ring-1 ring-black ring-opacity-5 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <TableHeader />
          {loading ? (
            <LoadingState />
          ) : data.length > 0 ? (
            <TableBody />
          ) : (
            <EmptyState />
          )}
        </table>
      </div>
    </div>
  );
}

export default DataTable;
