import { cn } from "@/lib/utils";
import { Pagination, Select, Table, Text, TextInput } from "@mantine/core";
import { IconSortAscending, IconSortDescending } from "@tabler/icons-react";
import { flexRender } from "@tanstack/react-table";
import React from "react";

export default function Datatables({ table, totalPages, info }) {
  return (
    <>
      <Table.ScrollContainer minWidth={500} mt="md">
        <Table
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
          {...{
            style: {
              width:
                table.getCenterTotalSize() < 1700
                  ? "100%"
                  : table.getCenterTotalSize(),
            },
          }}
        >
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Th
                    key={header.id}
                    colSpan={header.colSpan}
                    ta="center"
                    className="whitespace-nowrap relative"
                    style={{ width: `${header.getSize()}px` }}
                  >
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? `${cn(
                                  `cursor-pointer select-none flex justify-center items-center`
                                )}`
                              : "flex flex-col justify-start align-top",
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}

                          {header.column.getIsSorted() === "asc" ? (
                            <IconSortAscending className="ml-2" size={18} />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <IconSortDescending className="ml-2" size={18} />
                          ) : null}
                        </div>

                        {header.column.getCanFilter() ? (
                          <div className="mt-2">
                            <TextInput
                              size="xs"
                              placeholder="Search"
                              onChange={(event) => {
                                header.column.setFilterValue(
                                  event.target.value
                                );
                                table.setPageIndex(0);
                              }}
                            />
                          </div>
                        ) : (
                          <div className="mt-9"></div>
                        )}
                      </>
                    )}

                    {header.column.getCanResize() && (
                      <div
                        {...{
                          onDoubleClick: () => header.column.resetSize(),
                          onMouseDown: header.getResizeHandler(),
                          onTouchStart: header.getResizeHandler(),
                          className: `resizer ${
                            header.column.getIsResizing() ? "isResizing" : ""
                          }`,
                        }}
                      />
                    )}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>

          <Table.Tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <Table.Tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Td key={cell.id} ta="center">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td
                  colSpan={table.getVisibleFlatColumns().length}
                  ta="center"
                >
                  <Text fs="italic" fz="sm" fw={500} c="dimmed">
                    No Data Listed
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <div className="flex flex-col md:flex-row items-center justify-center md:justify-between">
        <div className="w-16 mb-3 md:mb-0">
          <Select
            size="xs"
            data={["10", "20", "30", "50", "100"]}
            defaultValue="10"
            onChange={(event) => table.setPageSize(Number(event))}
          />
        </div>

        {info && (
          <Text fz="xs" c="dimmed">
            Showing{" "}
            {totalPages > 0
              ? table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                1
              : 0}{" "}
            to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getCoreRowModel().rows.length
            )}{" "}
            of {info.totalElements ?? 0} entries{" "}
            {table.getState().columnFilters.length > 0
              ? `(filtered from ${info.totalElements ?? 0} total entries)`
              : ""}
          </Text>
        )}

        <Pagination
          size="sm"
          className="mt-3 md:mt-0"
          value={table.getState().pagination.pageIndex + 1}
          total={totalPages}
          page={table.getState().pagination.pageIndex + 1}
          onChange={(newPage) => table.setPageIndex(newPage - 1)}
        />
      </div>
    </>
  );
}
