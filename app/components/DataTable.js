"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, MoreHorizontal, Settings2 } from "lucide-react"

import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Input } from "./ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,

} from "./ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import {formatValue} from "../lib/formatters.js";

export default function DataTable({ 
  columns: initialColumns, 
  rows = [], 
  allowPagination = true, 
  columnSelection = true, 
  searchKey = null,
  defaultMaxWidth = "auto"
}) {
  
  // Helper for formatting values

  // Transform legacy columns to TanStack columns if needed
  const columns = React.useMemo(() => {
    if (!initialColumns) return []
    return initialColumns.map(col => {
      // If it's already a TanStack column definition (has accessorKey or id)
      // but we still want to support 'render' and 'maxWidth' if they were passed in
      const isTanStack = col.accessorKey || col.id;
      
      const columnDef = isTanStack ? { ...col } : {
        accessorKey: col.key,
        header: col.label,
      };

      // Ensure cell rendering logic is applied if not already defined
      if (!columnDef.cell) {
        columnDef.cell = ({ row }) => {
          const accessorKey = columnDef.accessorKey;
          const rawValue = row.getValue(accessorKey);
          
          if (col.render) {
            return col.render(row.original, rawValue)
          }

          const value = col.formatter ? formatValue(rawValue, col.formatter) : rawValue

          const className =
            typeof value === "string" && value.startsWith("(")
              ? "tw:text-destructive tw:font-semibold"
              : accessorKey?.includes("profit") && typeof value === "string"
                ? "tw:text-destructive tw:font-semibold"
                : "";
          return <span className={className}>{value}</span>
        }
      }

      // Track maxWidth in the column definition for our own use
      columnDef.maxWidth = col.maxWidth || defaultMaxWidth;

      return columnDef;
    })
  }, [initialColumns, defaultMaxWidth])

  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 100,
  })

  const table = useReactTable({
    data:rows,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  return (
    <div className="tw:w-full tw:space-y-4">
      <div className="tw:flex tw:items-center tw:justify-between tw:gap-4">
        <div className="tw:flex tw:flex-1 tw:items-center tw:gap-2">
          {searchKey && (
            <Input
              placeholder={`Filter ${searchKey}...`}
              value={(table.getColumn(searchKey)?.getFilterValue()) ?? ""}
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="tw:max-w-sm"
            />
          )}
        </div>
        <div className="tw:flex tw:items-center tw:gap-2">
          {columnSelection && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="tw:ml-auto">
                  <Settings2 className="tw:mr-2 tw:h-4 tw:w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="tw:w-[150px]">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="tw:capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <div className="tw:rounded-md tw:border tw:bg-card tw:max-h-[600px] tw:overflow-y-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const maxWidth = header.column.columnDef.maxWidth;
                  return (
                    <TableHead 
                      key={header.id}
                      style={maxWidth && maxWidth !== 'auto' ? {
                        maxWidth: maxWidth,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      } : {}}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const maxWidth = cell.column.columnDef.maxWidth;
                    return (
                      <TableCell 
                        key={cell.id}
                        style={maxWidth && maxWidth !== 'auto' ? {
                          maxWidth: maxWidth,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        } : {}}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="tw:h-24 tw:text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {allowPagination && (
        <div className="tw:flex tw:items-center tw:justify-between tw:px-2">
          <div className="tw:flex-1 tw:text-sm tw:text-muted-foreground">
            {/*{table.getFilteredSelectedRowModel().rows.length} of{" "}*/}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="tw:flex tw:items-center tw:space-x-6 lg:tw:space-x-8">
            <div className="tw:flex tw:items-center tw:space-x-2">
              <p className="tw:text-sm tw:font-medium">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="tw:h-8 tw:w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent align="end">
                  {[100, 200, 300, 400, 500].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="tw:flex tw:w-[100px] tw:items-center tw:justify-center tw:text-sm tw:font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="tw:flex tw:items-center tw:space-x-2">
              <Button
                variant="outline"
                className="tw:hidden tw:h-8 tw:w-8 tw:p-0 lg:tw:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="tw:sr-only">Go to first page</span>
                {"<<"}
              </Button>
              <Button
                variant="outline"
                className="tw:h-8 tw:w-8 tw:p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="tw:sr-only">Go to previous page</span>
                {"<"}
              </Button>
              <Button
                variant="outline"
                className="tw:h-8 tw:w-8 tw:p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="tw:sr-only">Go to next page</span>
                {">"}
              </Button>
              <Button
                variant="outline"
                className="tw:hidden tw:h-8 tw:w-8 tw:p-0 lg:tw:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="tw:sr-only">Go to last page</span>
                {">>"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

