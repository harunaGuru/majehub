'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import ChartHeader from '../charts/ChartHeader';

type Order = {
  id: string;
  customer: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
};

const data: Order[] = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    amount: '$250',
    status: 'paid',
  },
  {
    id: 'ORD-002',
    customer: 'Jane Smith',
    amount: '$180',
    status: 'pending',
  },
  {
    id: 'ORD-003',
    customer: 'Alice Johnson',
    amount: '$420',
    status: 'paid',
  },
  {
    id: 'ORD-004',
    customer: 'Bob Lee',
    amount: '$90',
    status: 'failed',
  },
  {
    id: 'ORD-005',
    customer: 'Michael Brown',
    amount: '$120',
    status: 'pending',
  },
  {
    id: 'ORD-006',
    customer: 'Sarah Wilson',
    amount: '$600',
    status: 'paid',
  },
  {
    id: 'ORD-007',
    customer: 'Chris Evans',
    amount: '$310',
    status: 'failed',
  },
  {
    id: 'ORD-008',
    customer: 'Daniel White',
    amount: '$150',
    status: 'paid',
  },
  // {
  //   id: 'ORD-009',
  //   customer: 'Emma Taylor',
  //   amount: '$275',
  //   status: 'pending',
  // },
  // {
  //   id: 'ORD-010',
  //   customer: 'Sophia Davis',
  //   amount: '$540',
  //   status: 'paid',
  // },
];

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'id',
    header: 'Order ID',
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
  },
  {
    accessorKey: 'status',
    header: 'Status',

    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <span
          className={`capitalize font-medium ${status === 'paid'
            ? 'text-green-400'
            : status === 'pending'
              ? 'text-yellow-400'
              : 'text-red-400'
            }`}
        >
          {status}
        </span>
      );
    },
  },
];

const RecentOrdersTable = () => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-black rounded-2xl border border-[#111827] p-3 overflow-hidden">
      <ChartHeader
        title="Recent Orders"
        subtitle="A quick snapshot of your latest transactions."
      />

      <div className="mt-5 overflow-x-auto rounded-lg border border-[#111827]">
        <table className="w-full min-w-[700px] border-collapse">
          <thead className="bg-[#0A0F1C] sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => (
                  <th
                    key={header.id}
                    className="whitespace-nowrap px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-300 border-b border-[#111827]"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[#111827] even:bg-[#0D1324] hover:bg-[#111827] transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="whitespace-nowrap px-3 py-3 text-xs sm:text-sm text-white"
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrdersTable;