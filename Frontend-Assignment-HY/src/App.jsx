import React, { useState, useMemo, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Eye, EyeOff, X, ChevronUp, ChevronDown, Loader2, Info } from 'lucide-react';

// --- COMPONENT 1: InputField ---

const inputVariants = cva(
  'transition-all duration-200 ease-in-out w-full appearance-none focus:outline-none rounded-md',
  {
    variants: {
      variant: {
        outlined: 'border bg-transparent focus:border-blue-500',
        filled: 'border-transparent bg-gray-100 dark:bg-gray-700 focus:bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        ghost: 'border-transparent bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700',
      },
      inputSize: {
        sm: 'px-2.5 py-1.5 text-sm',
        md: 'px-3 py-2 text-base',
        lg: 'px-4 py-2.5 text-lg',
      },
      hasLeftIcon: {
        true: 'pl-10',
      },
      hasRightIcon: {
        true: 'pr-10',
      },
      invalid: {
        true: 'border-red-500 text-red-600 placeholder-red-400 focus:border-red-500 focus:ring-red-500',
        false: 'border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500',
      }
    },
    defaultVariants: {
      variant: 'outlined',
      inputSize: 'md',
      invalid: false,
    },
  }
);

const labelVariants = cva(
  'block text-sm font-medium mb-1 transition-colors duration-200',
  {
    variants: {
      invalid: {
        true: 'text-red-600',
        false: 'text-gray-700 dark:text-gray-200',
      },
      disabled: {
        true: 'text-gray-400 dark:text-gray-500',
        false: '',
      }
    },
    defaultVariants: {
      invalid: false,
      disabled: false,
    }
  }
);

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  disabled?: boolean;
  loading?: boolean;
  onClear?: () => void;
}

const InputField = React.forwardRef < HTMLInputElement, InputFieldProps> (
  ({
    className,
    variant,
    inputSize,
    label,
    placeholder,
    helperText,
    errorMessage,
    type = 'text',
    disabled = false,
    invalid = false,
    loading = false,
    value,
    onClear,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const hasClearButton = !!onClear && value && value.length > 0;

    const IconWrapper: React.FC<{ children: React.ReactNode; position: 'left' | 'right' }> = ({ children, position }) => (
      <div className={`absolute inset-y-0 ${position === 'left' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}>
        {children}
      </div>
    );

    return (
      <div className={`w-full ${disabled ? 'cursor-not-allowed' : ''}`}>
        {label && <label className={labelVariants({ invalid, disabled })}>{label}</label>}
        <div className="relative">
          {loading && (
            <IconWrapper position="left">
              <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
            </IconWrapper>
          )}
          <input
            ref={ref}
            type={isPassword && showPassword ? 'text' : type}
            className={inputVariants({
              variant,
              inputSize,
              invalid,
              hasLeftIcon: loading,
              hasRightIcon: isPassword || hasClearButton,
              className
            })}
            placeholder={placeholder}
            disabled={disabled || loading}
            aria-invalid={invalid}
            value={value}
            {...props}
          />
          {(isPassword || hasClearButton) && (
            <IconWrapper position="right">
              {hasClearButton && (
                <button type="button" onClick={onClear} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none" aria-label="Clear input">
                  <X className="h-5 w-5" />
                </button>
              )}
              {isPassword && (
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none ml-2" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              )}
            </IconWrapper>
          )}
        </div>
        {invalid && errorMessage ? (
          <p className="mt-1.5 text-sm text-red-600">{errorMessage}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

// --- COMPONENT 2: DataTable ---

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
  data,
  columns,
  loading = false,
  selectable = false,
  onRowSelect,
  rowKey,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState < keyof T | null > (null);
  const [sortOrder, setSortOrder] = useState < SortOrder > (null);
  const [selectedRows, setSelectedRows] = useState < T[] > ([]);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
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
    setSelectedRows(prev => {
      const isSelected = prev.some(r => r[rowKey] === row[rowKey]);
      const newSelection = isSelected
        ? prev.filter(r => r[rowKey] !== row[rowKey])
        : [...prev, row];
      if (onRowSelect) {
        onRowSelect(newSelection);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    setSelectedRows(prev => {
      const newSelection = prev.length === data.length ? [] : [...data];
      if (onRowSelect) {
        onRowSelect(newSelection);
      }
      return newSelection;
    });
  };

  const isAllSelected = selectedRows.length === data.length && data.length > 0;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

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
                ref={input => {
                  if (input) input.indeterminate = isIndeterminate;
                }}
                onChange={handleSelectAll}
              />
              <label htmlFor="checkbox-all" className="sr-only">Select all items</label>
            </div>
          </th>
        )}
        {columns.map(col => (
          <th key={col.key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            {col.sortable ? (
              <button onClick={() => handleSort(col.dataIndex)} className="flex items-center gap-1.5 hover:text-gray-800 dark:hover:text-white focus:outline-none">
                {col.title}
                {sortKey === col.dataIndex ? (
                  sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
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
        <tr key={String(row[rowKey])} className={`hover:bg-gray-50 dark:hover:bg-gray-600 ${selectedRows.some(r => r[rowKey] === row[rowKey]) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
          {selectable && (
            <td className="p-4">
              <div className="flex items-center">
                <input
                  id={`checkbox-table-${index}`}
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                  checked={selectedRows.some(r => r[rowKey] === row[rowKey])}
                  onChange={() => handleSelectRow(row)}
                />
                <label htmlFor={`checkbox-table-${index}`} className="sr-only">Select row</label>
              </div>
            </td>
          )}
          {columns.map(col => (
            <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
              {col.render ? col.render(row[col.dataIndex], row) : String(row[col.dataIndex])}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  const LoadingState = () => (
    <tbody>
      <tr>
        <td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-16">
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
        <td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-16">
          <div className="flex flex-col justify-center items-center gap-3 text-gray-500 dark:text-gray-400">
            <Info className="h-10 w-10" />
            <span className="text-lg font-medium">No Data Available</span>
            <p className="text-sm">There are no records to display at the moment.</p>
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
          {loading ? <LoadingState /> : (data.length > 0 ? <TableBody /> : <EmptyState />)}
        </table>
      </div>
    </div>
  );
}

// --- DEMO/EXAMPLE USAGE ---

export default function App() {
  const [theme, setTheme] = useState('light');
  const [inputValues, setInputValues] = useState({
    name: 'John Doe',
    email: 'invalid-email',
    password: 'password123',
    bio: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues(prev => ({ ...prev, [name]: value }));
  };

  // --- DataTable Demo Data ---
  interface User {
    id: number;
    name: string;
    email: string;
    role: 'Admin' | 'Member' | 'Guest';
    status: 'Active' | 'Inactive';
  }

  const userData: User[] = [
    { id: 1, name: 'Jane Cooper', email: 'jane.cooper@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Cody Fisher', email: 'cody.fisher@example.com', role: 'Member', status: 'Active' },
    { id: 3, name: 'Esther Howard', email: 'esther.howard@example.com', role: 'Member', status: 'Inactive' },
    { id: 4, name: 'Jenny Wilson', email: 'jenny.wilson@example.com', role: 'Guest', status: 'Active' },
    { id: 5, name: 'Kristin Watson', email: 'kristin.watson@example.com', role: 'Member', status: 'Active' },
    { id: 6, name: 'Cameron Williamson', email: 'cameron.williamson@example.com', role: 'Admin', status: 'Inactive' },
  ];

  const userColumns: Column<User>[] = [
    { key: 'name', title: 'Name', dataIndex: 'name', sortable: true },
    { key: 'email', title: 'Email', dataIndex: 'email', sortable: true },
    { key: 'role', title: 'Role', dataIndex: 'role', sortable: true },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      sortable: true,
      render: (status) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
          {status}
        </span>
      )
    },
  ];

  const [tableData, setTableData] = useState < User[] > ([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState < User[] > ([]);

  useEffect(() => {
    // Simulate data fetching
    setLoadingTable(true);
    const timer = setTimeout(() => {
      setTableData(userData);
      setLoadingTable(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8 font-sans text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">React Component Library</h1>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
        </header>

        {/* InputField Demo Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold border-b border-gray-300 dark:border-gray-700 pb-2 mb-6">InputField Component</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Variants & States</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField variant="outlined" label="Outlined" placeholder="Enter text..." />
                <InputField variant="filled" label="Filled" placeholder="Enter text..." />
                <InputField variant="ghost" label="Ghost" placeholder="Enter text..." />
                <InputField label="Invalid Input" value={inputValues.email} onChange={handleInputChange} name="email" invalid errorMessage="Please enter a valid email." />
                <InputField label="Disabled Input" placeholder="Cannot edit" disabled />
                <InputField label="Loading Input" placeholder="Fetching data..." loading />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Sizes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <InputField inputSize="sm" label="Small" placeholder="Small size" />
                <InputField inputSize="md" label="Medium (Default)" placeholder="Medium size" />
                <InputField inputSize="lg" label="Large" placeholder="Large size" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Optional Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="With Clear Button"
                  value={inputValues.name}
                  onChange={handleInputChange}
                  name="name"
                  onClear={() => setInputValues(p => ({ ...p, name: '' }))}
                />
                <InputField
                  label="Password Toggle"
                  type="password"
                  value={inputValues.password}
                  onChange={handleInputChange}
                  name="password"
                  helperText="Your password must be at least 8 characters."
                />
              </div>
            </div>
          </div>
        </section>

        {/* DataTable Demo Section */}
        <section>
          <h2 className="text-2xl font-semibold border-b border-gray-300 dark:border-gray-700 pb-2 mb-6">DataTable Component</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p>A table with sorting, selection, loading, and empty states.</p>
              <button
                onClick={() => setTableData([])}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:ring-offset-gray-900"
              >
                Simulate Empty State
              </button>
            </div>
            <DataTable
              columns={userColumns}
              data={tableData}
              loading={loadingTable}
              selectable
              onRowSelect={(rows) => setSelectedUsers(rows as User[])}
              rowKey="id"
            />
            {selectedUsers.length > 0 && (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md mt-4">
                <h4 className="font-semibold">Selected Users:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedUsers.map(u => u.name).join(', ')}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
~
