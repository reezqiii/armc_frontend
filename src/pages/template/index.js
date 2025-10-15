import AuthLayout from "@/components/layout/authLayout";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, LoadingOverlay, Paper, Select, Text } from "@mantine/core";
import { templateSidebarList } from "../../data/sidebar/exampleList";
import useUser from "@/store/useUser";
import { useRouter } from "next/navigation";
import Datatables from "@/components/custom/Datatables";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { useDebouncedState } from "@mantine/hooks";
import { IconEdit, IconSearch, IconTrash } from "@tabler/icons-react";
import Swal from "sweetalert2";
import useEncrypt from "@/hooks/useEncrypt";
import useApi from "@/hooks/useApi";


Index.title = "Template";
export default function Index() {
  const router      = useRouter();
  const { user }    = useUser();
  const {encrypt}   = useEncrypt()
  const API         = useApi()
  const API_URL     = API.API_URL

  // MASTER LIST
  const [projectList, setProjectList] = useState([])
  const [disciplineList, setDisciplineList] = useState([])

  const [valueOption, setValueOption]     = useState({
    project_id : null,
    discipline : null
  })
  const [loadingData, setLoadingData]     = useState(true)
  const [loadingOpt, setLoadingOpt]       = useState(false)
  const [display, setDisplay]             = useState(false)

  const [data, setData]                   = useState([])
  const [savedFilter, setSavedFilter]     = useState({})
  const [checkedId, setCheckedId]         = useState([])
  const [sorting, setSorting]             = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [pagination, setPagination]       = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const columns = useMemo(() => [

    {
      accessorFn: (row) => row.id,
      id: "id",
      header: "#",
      enableColumnFilter: false,
      enableSorting: false,
      cell: (info) => {
        let id = info.getValue()
        return (
          <div className="flex items-center justify-center">
            <Checkbox checked={checkedId.includes(id)} onChange={(event) => set_checked_id(event, id)} size="md" />
          </div>
        )
      },
    },

    {
      accessorFn: (row) => row.drawing_no,
      id: "drawing_no",
      header: "Drawing No",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.drawing_no_rev,
      id: "drawing_no_rev",
      header: "Drawing Rev",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorFn: (row) => row.cert_id,
      id: "cert_id",
      header: "Cert Id",
      enableColumnFilter: false,
      enableSorting: true,
      cell: (info) => {
        // return certData[info.getValue()].cert_id
        // return certData[info.getValue()]?.cert_id
        return info.getValue()
      },
    },
    {
      accessorFn: (row) => row.tag_number,
      id: "tag_number",
      header: "Tag Number",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorFn: (row) => row.tag_description,
      id: "tag_description",
      header: "Tag Description",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorFn: (row) => row.system,
      id: "system",
      header: "System",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorFn: (row) => row.subsystem,
      id: "subsystem",
      header: "Subsystem",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorFn: (row) => row.subsystem_description,
      id: "subsystem_description",
      header: "Subsystem Description",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorFn: (row) => row.phase,
      id: "phase",
      header: "Phase",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorFn: (row) => row.location,
      id: "location",
      header: "Location",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },

    {
      accessorFn: (row) => row.model_no,
      id: "model_no",
      header: "Model No",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorFn: (row) => row.serial_no,
      id: "serial_no",
      header: "Serial No",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorFn: (row) => row.rating,
      id: "rating",
      header: "Rating",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorFn: (row) => row.manufacturer,
      id: "manufacturer",
      header: "Manufacturer",
      enableColumnFilter: true,
      enableSorting: true,
      cell: (info) => info.getValue(),
    },


  ])

  const set_checked_id = (event, id) => {
    let arr_checked_id = [...checkedId]
    if (arr_checked_id.includes(id)) {
      arr_checked_id.splice(arr_checked_id.indexOf(id), 1)
    } else {
      arr_checked_id.push(id)
    }
    setCheckedId(arr_checked_id)
  }

  const table = useReactTable({
    data,
    columns,
    filterFns: {},
    state: {
      columnFilters,
      sorting,
      pagination,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  });

  useEffect(() => {
    
    const getMaster = async () => {
      const { data } = await axios.post(API_URL + '/api/master/import_template', {}, {
        headers: {
          Authorization: "Bearer " + user.token
        }
      })

      // let arr_cert = {}
      // data.form_list.map((v, i) => {
      //   arr_cert[v.id] = v
      // })

      // setCertData(arr_cert)

      let arr_project = []
      data.project_active_list.map((v, i) => {
        const _project = {
          value: v.id.toString(),
          label: v.project_name
        }
        arr_project.push(_project)
      })
      setProjectList(arr_project)

      let arr_discipline = []
      data.discipline_active_list.map((v, i) => {
        const _discipline = {
          value: v.id.toString(),
          label: v.discipline_name
        }
        arr_discipline.push(_discipline)
      })
      setDisciplineList(arr_discipline)

      setDisplay(true)

    }

    getMaster()
  }, [user.token, API_URL])
  


  useEffect(() => {

    const getData = async () => {
      const filterParams = columnFilters
        .map((filter) => filter.value != null ? `${filter.id}=${filter.value}` : "")
        .join("&");

      const sort =
        sorting && sorting.length > 0
          ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
          : "";

      const { data } = await axios.post(
        `${API_URL}/api/template/serverside_template_list?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
        savedFilter,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setData(data.content);
      setTotalPages(data.totalPages);
      if(loadingData) {
        setLoadingData(false)
      }
      setLoadingOpt(false)
    };


    getData();
  }, [
    user.token,
    columnFilters,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    loadingData,
    savedFilter,
    API_URL

  ]);

  const setFilterOption = (value, name) => {
    setValueOption((prev) => ({ ...prev, [name]: value }))
  }

  const filterData = () => {
    setLoadingOpt(true)
    setSavedFilter(prev => ({
      ...(Object.keys(valueOption).length ? 
        Object.keys(valueOption).reduce((acc, key) => {
          if (valueOption[key] !== null) {
            acc[key] = valueOption[key];
          }
          return acc;
        }, {}) 
        : {}) 
    }));
    // if (Object.keys(valueOption).length > 0) {
    //   // setLoadingData(true)
    //   setLoadingOpt(true)
    //   setCheckedId([])
    //   for (let key in valueOption) {
    //     setColumnFilters((prev) => {
    //       const index = prev.findIndex(filter => filter.id === key);

    //       if (index !== -1) {
    //         const updatedFilters = [...prev];
    //         updatedFilters[index] = { id: key, value: valueOption[key] };
    //         return updatedFilters;
    //       } else {
    //         return [...prev, { id: key, value: valueOption[key] }];
    //       }
    //     });
    //   }
    // }
  }

  const deleteTag = async () => {
    if (!checkedId.length) return
    Swal.fire({
      title: "Are You Sure to Delete ?",
      icon: "warning",
      showCancelButton: true
    }).then(async (res) => {
      if (res.isConfirmed) {
        setLoadingOpt(true)


        const { data } = await axios.post(API_URL + '/api/template/delete_template', {
          data: {
            checked_id_list: checkedId,
            user_id     : user.id
          }
        }, {
          headers: {
            Authorization: `Bearer ${user.token}`
          },
          
        })


        if(data.success) {
          setLoadingOpt(false)
          setLoadingData(true)
          setCheckedId([])
          Swal.fire({
            title: "Success",
            text : "Data Successfully Deleted !!",
            timer : 1000
          })
        }
      }
    })
  }

  const updateTag = () => {
    if (!checkedId.length) return
    let string_query = encrypt(JSON.stringify(checkedId))
    router.push({
      pathname : '/template/update',
      query : {
        ids : string_query
      }
    })
  }

  return (
    <AuthLayout sidebarList={templateSidebarList}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper rradius="sm" mt="md" withBorder shadow="md">
            <div className="bg-gray-200 px-4 py-2">
              <Text fw={500}>Filter</Text>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="px-4 py-2">
                <Text fw={500}>Project</Text>
                <Select
                  label={null}
                  placeholder="Choose Project"
                  value={valueOption.project_id}
                  onChange={(e) => setFilterOption(e, "project_id")}
                  data={projectList} // data array with value and label
                  searchable
                />
              </div>
              <div className="px-4 py-2">
                <Text fw={500}>Discipline</Text>
                <Select
                  label={null}
                  placeholder="Choose Discipline"
                  value={valueOption.discipline}
                  onChange={(e) => setFilterOption(e, "discipline")}
                  data={disciplineList} // data array with value and label
                  searchable
                />
              </div>
              <div className="px-4 py-2 col-span-2 text-right">
                <Button leftSection={<IconSearch size={20} />} onClick={filterData}> Filter</Button>
              </div>
            </div>
          </Paper>
          <Paper style={{ position: "relative" }} radius="sm" mt="md" withBorder shadow="md">
            <LoadingOverlay visible={loadingData || loadingOpt || !display} />
            <div className="bg-gray-200 px-4 py-2">
              <Text fw={500}>Tag Number List</Text>
            </div>
            <div className="p-4 overflow-x-auto">
              {
                display ? <Datatables table={table} totalPages={totalPages} /> : null
              }
            </div>
            <hr />
            <div className="p-4">
              <div className="grid grid-cols-4 gap-4 ">
                <div>
                  <div className="col-span-4"><Text fw={500}> You Tick {checkedId.length} Item(s) to Edit</Text></div>
                  <div className="col-span-1"><Button color="orange" leftSection={<IconEdit />} onClick={updateTag}> Edit</Button></div>
                </div>
                <div>
                  <div className="col-span-4"><Text fw={500}> You Tick {checkedId.length} Item(s) to Delete</Text></div>
                  <div className="col-span-1"><Button color="red" leftSection={<IconTrash />} onClick={deleteTag}> Delete</Button></div>
                </div>
              </div>

            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
