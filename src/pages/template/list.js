import AuthLayout from "@/components/layout/authLayout";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Paper } from "@mantine/core";
import { templateSidebarList } from "../../data/sidebar/exampleList";
import ExampleTable from "@/components/tables/exampleTable";
import useUser from "@/store/useUser";
import { useRouter } from "next/navigation";
import { useDebouncedState } from "@mantine/hooks";

Index.title = "Template List";
export default function Index() {
  const router = useRouter();
  const { user } = useUser();

  const [data, setData] = useState([]);
  const [search, setSearch] = useDebouncedState("", 500);
  // const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(3);
  // const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState([]);

  // const getData = async () => {
  //   const { data } = await axios.get(
  //     `${process.env.NEXT_PUBLIC_API_PORTAL}/api/book/list?search=${search}&page=${pageIndex}&size=${pageSize}&sortBy=${sortBy}`,
  //     {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${user.token}`,
  //       },
  //     }
  //   );
  //   setData(data);
  // };

  useEffect(() => {
    const getData = async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_PORTAL}/api/book/list?search=${search}&page=${pageIndex}&size=${pageSize}&sortBy=${sortBy}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setData(data);
    };

    getData();
  }, [search, pageIndex, pageSize, sortBy, user.token]);

  return (
    <AuthLayout sidebarList={templateSidebarList}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper p="sm" radius="sm" mt="md" withBorder>
            <ExampleTable
              data={data}
              setSearch={setSearch}
              setPageIndex={setPageIndex}
              setPageSize={setPageSize}
              setSortBy={setSortBy}
            />
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
