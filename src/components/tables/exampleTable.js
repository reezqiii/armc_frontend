import {
  ActionIcon,
  Pagination,
  rem,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { IconEdit, IconEye, IconSearch, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React from "react";

export default function ExampleTable({
  data,
  setSearch,
  setPageIndex,
  setPageSize,
  setSortby,
}) {
  const router = useRouter();

  const items =
    data.content !== undefined && data.content.length > 0 ? (
      data.content.map((item, index) => (
        <Table.Tr key={index}>
          <Table.Td ta="center">{item.id}</Table.Td>
          <Table.Td ta="center">{item.bookName}</Table.Td>
          <Table.Td ta="center">{item.author}</Table.Td>
          <Table.Td ta="center">
            {item.statusDelete === 1 ? "Active" : "Inactive"}
          </Table.Td>
          <Table.Td ta="center">
            <ActionIcon
              variant="subtle"
              color="green"
              onClick={() => router.push(`/example/${item.id}`)}
            >
              <IconEdit
                style={{ width: rem(16), height: rem(16) }}
                stroke={1.5}
              />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              // onClick={() => router.push(`/example/${item.id}`)}
            >
              <IconTrash
                style={{ width: rem(16), height: rem(16) }}
                stroke={1.5}
              />
            </ActionIcon>
          </Table.Td>
        </Table.Tr>
      ))
    ) : (
      <Table.Tr>
        <Table.Td colSpan={11} ta="center">
          No data listed.
        </Table.Td>
      </Table.Tr>
    );

  return (
    <>
      <div className="flex flex-col md:flex-row justify-center md:justify-end">
        <TextInput
          placeholder="Search"
          leftSection={
            <IconSearch style={{ width: rem(16), height: rem(16) }} />
          }
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            setPageIndex(0);
          }}
        />
      </div>

      <Table.ScrollContainer minWidth={1200} mt="md">
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th ta="center">ID</Table.Th>
              <Table.Th ta="center">BOOK</Table.Th>
              <Table.Th ta="center">AUTHOR</Table.Th>
              <Table.Th ta="center">STATUS</Table.Th>
              <Table.Th ta="center">Action</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>{items}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <div className="items-center flex flex-col md:flex-row justify-center md:justify-between py-2">
        {data.content !== undefined && (
          <Text fz="sm" c="dimmed">
            Showing {data.pageable.offset + 1} to{" "}
            {data.pageable.offset + data.numberOfElements} of{" "}
            {data.totalElements} entries
          </Text>
        )}

        <Pagination
          className="mt-3 md:mt-0"
          total={data.totalPages}
          value={data.number + 1}
          onChange={(page) => setPageIndex(page - 1)}
        />
      </div>
    </>
  );
}
