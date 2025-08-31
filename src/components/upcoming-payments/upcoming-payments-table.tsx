"use client"

import { useState } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnFiltersState,
  getFilteredRowModel,
  type SortingState,
  getSortedRowModel,
} from "@tanstack/react-table"
import { CalendarIcon, CheckCircle, Clock, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { CaretSortIcon, DotsHorizontalIcon } from "@radix-ui/react-icons"

// This would typically come from an API or database
const allPayments = [
  {
    id: "1",
    name: "Rent",
    dueDate: "2023-05-15",
    amount: 1200,
    category: "Housing",
    status: "upcoming",
    recurring: true,
    frequency: "monthly",
    paymentMethod: "Bank Transfer",
    description: "Monthly apartment rent",
  },
  {
    id: "2",
    name: "Internet Bill",
    dueDate: "2023-05-18",
    amount: 59.99,
    category: "Utilities",
    status: "upcoming",
    recurring: true,
    frequency: "monthly",
    paymentMethod: "Credit Card",
    description: "Fiber internet subscription",
  },
  {
    id: "3",
    name: "Gym Membership",
    dueDate: "2023-05-20",
    amount: 45.0,
    category: "Health",
    status: "upcoming",
    recurring: true,
    frequency: "monthly",
    paymentMethod: "Credit Card",
    description: "Monthly gym membership fee",
  },
  {
    id: "4",
    name: "Netflix Subscription",
    dueDate: "2023-05-22",
    amount: 14.99,
    category: "Entertainment",
    status: "upcoming",
    recurring: true,
    frequency: "monthly",
    paymentMethod: "Credit Card",
    description: "Standard HD plan",
  },
  {
    id: "5",
    name: "Phone Bill",
    dueDate: "2023-05-25",
    amount: 85.0,
    category: "Utilities",
    status: "upcoming",
    recurring: true,
    frequency: "monthly",
    paymentMethod: "Credit Card",
    description: "Monthly mobile plan",
  },
  {
    id: "6",
    name: "Car Insurance",
    dueDate: "2023-06-01",
    amount: 120.0,
    category: "Insurance",
    status: "upcoming",
    recurring: true,
    frequency: "monthly",
    paymentMethod: "Bank Transfer",
    description: "Full coverage auto insurance",
  },
  {
    id: "7",
    name: "Electricity Bill",
    dueDate: "2023-05-10",
    amount: 95.5,
    category: "Utilities",
    status: "paid",
    recurring: true,
    frequency: "monthly",
    paymentMethod: "Bank Transfer",
    description: "Monthly electricity bill",
  },
  {
    id: "8",
    name: "Water Bill",
    dueDate: "2023-05-05",
    amount: 45.75,
    category: "Utilities",
    status: "paid",
    recurring: true,
    frequency: "monthly",
    paymentMethod: "Bank Transfer",
    description: "Monthly water utility",
  },
]

interface UpcomingPaymentsTableProps {
  filter?: "upcoming" | "recurring" | "history"
}

export function UpcomingPaymentsTable({ filter = "upcoming" }: UpcomingPaymentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Filter data based on the selected tab
  const filteredData = allPayments.filter((payment) => {
    if (filter === "upcoming") return payment.status === "upcoming"
    if (filter === "recurring") return payment.recurring === true
    if (filter === "history") return payment.status === "paid"
    return true
  })

  const columns: ColumnDef<(typeof allPayments)[0]>[] = [
    {
      accessorKey: "name",
      header: "Payment Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Due Date
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("dueDate"))
        return (
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            {date.toLocaleDateString()}
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as string
        return (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs">{category?.charAt(0) ?? ""}</span>
            </div>
            <span>{category ?? "Unknown"}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status")
        return status === "upcoming" ? (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3" />
            Upcoming
          </Badge>
        ) : (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3" />
            Paid
          </Badge>
        )
      },
    },
    {
      accessorKey: "recurring",
      header: "Frequency",
      cell: ({ row }) => {
        const recurring = row.original.recurring
        const frequency = row.original.frequency

        return recurring ? (
          <div className="flex items-center gap-1 text-sm">
            <RefreshCw className="h-3 w-3" />
            <span className="capitalize">{frequency}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">One-time</span>
        )
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="justify-end w-full"
          >
            Amount
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("amount"))
        return <div className="text-right font-medium">{formatCurrency(amount)}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row: _row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Mark as paid</DropdownMenuItem>
              <DropdownMenuItem>Edit payment</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Delete payment</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="w-full flex flex-col overflow-hidden">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter payments..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border flex-1 overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  )
}

