import { Column } from "../components/DataTable";

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Member' | 'Guest';
  status: 'Active' | 'Inactive';
}

export const userData: User[] = [
  { id: 1, name: 'Jane Cooper', email: 'jane.cooper@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Cody Fisher', email: 'cody.fisher@example.com', role: 'Member', status: 'Active' },
  { id: 3, name: 'Esther Howard', email: 'esther.howard@example.com', role: 'Member', status: 'Inactive' },
  { id: 4, name: 'Jenny Wilson', email: 'jenny.wilson@example.com', role: 'Guest', status: 'Active' },
  { id: 5, name: 'Kristin Watson', email: 'kristin.watson@example.com', role: 'Member', status: 'Active' },
  { id: 6, name: 'Cameron Williamson', email: 'cameron.williamson@example.com', role: 'Admin', status: 'Inactive' },
];

export const userColumns: Column<User>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name', sortable: true },
  { key: 'email', title: 'Email', dataIndex: 'email', sortable: true },
  { key: 'role', title: 'Role', dataIndex: 'role', sortable: true },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    sortable: true,
    render: (status) => (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      }`}>
        {status}
      </span>
    )
  },
];
