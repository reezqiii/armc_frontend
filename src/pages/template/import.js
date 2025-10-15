import AuthLayout from "@/components/layout/authLayout";
import React, { useEffect, useState } from "react";
import { Alert, Box, Button, LoadingOverlay, Paper, Table, Text } from "@mantine/core";
import { templateSidebarList } from "../../data/sidebar/exampleList";
import useUser from "@/store/useUser";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconCheck, IconFileSpreadsheet, IconUpload, IconX } from "@tabler/icons-react";
import * as XLSX from "xlsx"
import Swal from "sweetalert2";
import axios from "axios";
import useApi from "@/hooks/useApi";
import useEncrypt from "@/hooks/useEncrypt";

Index.title = "Import Template";
export default function Index() {
  const router = useRouter()
  const { user } = useUser()
  const [file, setFile] = useState(null)
  const [data, setData] = useState([])
  const [preview, setPreview] = useState(false)
  const [project, setProject] = useState([])
  const [company, setCompany] = useState([])
  const [discipline, setDiscipline] = useState([])
  const [module, setModule] = useState([])
  const [certid, setCertId] = useState([])
  const [type_of_module, setToM] = useState([])
  const [dwg, setDwg] = useState([])
  const [tag, setTag] = useState([])
  // const [disabledAll, setDisabledAll] = useState(false)
  const [loading, setLoading] = useState(false)
  const API         = useApi()
  const API_URL     = API.API_URL
  const {encrypt}   = useEncrypt()


  const HandleUploadFile = (event) => {
    if (!file) {
      Swal.fire({
        title: "Cannot Upload",
        text: "Please select a file",
        icon: "error",
      })

      return
    }
    setLoading(true)
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const range = XLSX.utils.decode_range(sheet['!ref']);
      const columnKeys = [];

      for (let col = range.s.c; col <= range.e.c; col++) {
        columnKeys.push(XLSX.utils.encode_col(col));
      }

      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const formattedData = rows.map((row) =>
        columnKeys.reduce((acc, colKey, index) => {
          acc[colKey] = row[index] || "";
          return acc;
        }, {})
      );

      setData(formattedData)

      let arr_dwg   = []
      let arr_tag   = []
      let arr_com   = []
      let arr_cert  = []
      formattedData.map((v, i) => {
        if (i > 0 && v['A'] != "") {
          if (!arr_dwg.includes(v['E'])) {
            arr_dwg.push(v['E'])
          }

          if (!arr_tag.includes(v['I'])) {
            arr_tag.push(v['I'])
          }

          if (!arr_com.includes(v['T'])) {
            arr_com.push(v['T'])
          }

          if (!arr_cert.includes(v['G'])) {
            arr_cert.push(v['G'])
          }

        }
      })

      let form_data = {
        "arr_dwg"   : arr_dwg,
        "arr_tag"   : arr_tag,
        "arr_com"   : arr_com,
        "arr_cert"  : arr_cert,
      }
      load_master_data()
      load_requirement(form_data)

    }
    reader.readAsArrayBuffer(file);
  }

  const load_master_data = async () => {
    const response = await axios.post(API_URL + '/api/master/import_template', {}, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      },
    })

    const data = response.data

    const arr_key_discipline = {}
    data.discipline_list.map((v, i) => {
      arr_key_discipline[v.initial.toLowerCase()] = v
    })

    setDiscipline(arr_key_discipline)

    const arr_key_module = {}
    data.module_list.map((v, i) => {
      if(typeof arr_key_module[v.project_id] === "undefined") {
        arr_key_module[v.project_id] = {}
      }
      arr_key_module[v.project_id][v.mod_desc.toLowerCase()] = v
    })

    setModule(arr_key_module)

    const arr_key_tom = {}
    data.type_of_module_list.map((v, i) => {
      arr_key_tom[v.code.toLowerCase()] = v
    })

    setToM(arr_key_tom)

    const arr_project = {}
    data.project_list.map((v, i) => {
      arr_project[v.project_code] = v
    })

    setProject(arr_project)

    setPreview(true)

    // const arr_cert_id = {}
    // data.form_list.map((v, i) => {
    //   arr_cert_id[v.cert_id] = v
    // })

    // setCertId(arr_cert_id)



  }

  const load_requirement = async (form_data) => {
    const response = await axios.post(API_URL + '/api/template/validate_requirement', {
      data: form_data
    }, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      },
      
    })

    const data = response.data
    const arr_dwg = {}
    data.drawing_list.map((v, i) => {
      arr_dwg[v.document_no] = v
    })

    setDwg(arr_dwg)

    const arr_tag = {}
    data.tag_list.map((v, i) => {
      arr_tag[v.tag_number] = v
    })

    setTag(arr_tag)

    const arr_company = {}
    data.com_list.map((v, i) => {
      arr_company[v.company_name.toLowerCase()] = v
    })

    setCompany(arr_company)

    const arr_cert_id = {}
    data.cert_list.map((v, i) => {
      arr_cert_id[v.cert_id] = v
    })

    setCertId(arr_cert_id)

  }

  const handleFile = (event) => {
    let file = event.target.files[0]
    setFile(file)
  }

  const handleSubmit = async (form_data) => {
    // form_data['id_user'] = user.id;
    const { data } = await axios.post(API_URL + '/api/template/submit_import', {
      data: {
        form_data   : form_data,
        id_user     : user.id
      }
    }, {
      headers: {
        Authorization: `Bearer ${user.token}`
      },
      
    })

    Swal.fire({
      title: "success",
      text: "data has been imported",
      icon: "success",
      timer: 1000
    })

    setTimeout(() => {
      handleBackAction()
    }, 1000);

  }

  const downloadExcel = async () => {
    try {
      setLoading(true)
      const url_host = encrypt(window.location.origin.toString())
        const response = await axios.get(API_URL + "/api/excel/generate_template_import_tag", {
          params : {
            origin : url_host
          },
          headers : {
            Authorization : "Bearer " + user.token
          },
            responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "Template Import Tag Number.xlsx");
        document.body.appendChild(link);
        link.click();
      setLoading(false)

    } catch (error) {
        console.error("Error downloading the file", error);
      setLoading(false)

    }
};

const handleBackAction = () => {
  setPreview(false)
  setLoading(false)
}


  let arr_tag_no = []
  let form_submit = []
  let all_error = []
  return (
    <AuthLayout sidebarList={templateSidebarList}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" style={{position: 'relative'}} withBorder>
            {
              !preview ? (
                <>
                  <Box>
                  <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                    <div className="bg-gray-200 px-4 py-2">
                      <Text fw={500}>Import Tag Number List</Text>
                    </div>
                    <div className="px-4 py-2">
                      <div className="flex flex-col space-y-4 mt-3">
                        <div className="w-full">
                          <div className="flex items-center">
                            <label className="w-1/4 text-sm text-gray-500">Template File</label>
                            <div className="flex-1">
                             <Button color="green" className="inline-flex items-center px-4 py-2 bg-green-700 text-white rounded shadow hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-200" onClick={downloadExcel}>
                                <IconFileSpreadsheet size={20} /> Template Import Tag Number List
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="w-full">
                          <div className="flex items-center">
                            <label className="w-1/4 text-sm text-gray-500">Upload File</label>
                            <div className="flex-1">
                              <input
                                type="file"
                                name="attachment"
                                onChange={handleFile}
                                required
                                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:ring-indigo-200"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="w-full">
                          <div className="text-right">
                            <Button onClick={HandleUploadFile}> <IconUpload size={20} /> Upload</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Box>
                </>
              ) : (
                <>
                  <div className="bg-gray-200 px-4 py-2">
                    <Text fw={500}>Preview Import Tag Number List</Text>
                  </div>
                  <div className="px-4 py-4 overflow-x-auto">
                    <Table withTableBorder>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Project</Table.Th>
                          <Table.Th>Discipline</Table.Th>
                          <Table.Th>Module</Table.Th>
                          <Table.Th>Type of Module</Table.Th>
                          <Table.Th>Drawing No.</Table.Th>
                          <Table.Th>Drawing No. Rev</Table.Th>
                          <Table.Th>Cert ID</Table.Th>
                          <Table.Th>Event ID</Table.Th>
                          <Table.Th>Tag Number</Table.Th>
                          <Table.Th>Tag Description</Table.Th>
                          <Table.Th>System</Table.Th>
                          <Table.Th>Subsystem</Table.Th>
                          <Table.Th>Subsystem Description</Table.Th>
                          <Table.Th>Phase</Table.Th>
                          <Table.Th>Location</Table.Th>
                          <Table.Th>Model No</Table.Th>
                          <Table.Th>Serial No</Table.Th>
                          <Table.Th>Rating</Table.Th>
                          <Table.Th>Manufacturer</Table.Th>
                          <Table.Th>Company</Table.Th>
                          <Table.Th>Status</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {
                          data.map((v, i) => {
                            if (i > 0 && v['A'] != "") {
                              let error_list = []
                              let disabled = false
                              v['B'] = v['B'].toLowerCase().trim()
                              v['C'] = v['C'].toLowerCase().trim()
                              v['D'] = v['D'].toLowerCase().trim()
                              v['T'] = v['T'].toLowerCase().trim()

                              if (typeof project[v['A']] === "undefined") {
                                error_list.push("Project Code Not Found")
                                disabled = true
                              }

                              if (typeof discipline[v['B']] === "undefined") {
                                error_list.push("Discipline Not Found")
                                disabled = true
                              }

                              if (typeof module[project[v['A']]?.id][v['C']] === "undefined") {
                                error_list.push("module Not Found")
                                disabled = true
                              }

                              if (typeof type_of_module[v['D']] === "undefined") {
                                error_list.push("Type of Module Not Found")
                                disabled = true
                              }

                              if (typeof dwg[v['E']] === "undefined") {
                                error_list.push("Drawing Not Found")
                                disabled = true
                              }

                              if (typeof tag[v['I']] !== "undefined") {
                                error_list.push("Tag Number Already Exist in Database !")
                                disabled = true
                              }

                              if (typeof certid[v['G']] === "undefined") {
                                error_list.push("Form Cert ID is not registered !")
                                disabled = true
                              }

                              if (arr_tag_no.includes(v['I'])) {
                                error_list.push("Duplicate Tag Number in Excel File")
                                disabled = true
                              }

                              if(v['T'] === "") {
                                error_list.push("Company Cannot be Empty")
                                disabled = true
                              }

                              if(typeof company[v['T']] === "undefined") {
                                error_list.push("Company Not Found")
                                disabled = true
                              }

                              if(error_list.length > 0) {
                                all_error.push(error_list)
                              }

                              arr_tag_no.push(v['I'])

                              if (!disabled) {
                                let form = {
                                  "project_id": project[v['A']].id || 0,
                                  "discipline": discipline[v['B']].id || 0,
                                  "module": module[project[v['A']]?.id][v['C']].mod_id || 0,
                                  "type_of_module": type_of_module[v['D']].id || 0,
                                  "drawing_no": v['E'],
                                  "drawing_rev": v['F'],
                                  "cert_id": certid[v['G']].id || 0,
                                  "event_id": v['H'],
                                  "tag_no": v['I'],
                                  "tag_description": v['J'],
                                  "system": v['K'],
                                  "subsystem": v['L'],
                                  "subsystem_description": v['M'],
                                  "phase": v['N'],
                                  "location": v['O'],
                                  "model_no": v['P'],
                                  "serial_no": v['Q'],
                                  "rating": v['R'],
                                  "manufacturer": v['S'],
                                  "company_id" : company[v['T']].id_company || 0
                                }

                                form_submit.push(form)
                              }


                              return (
                                <Table.Tr key={i} style={{ backgroundColor: disabled ? '#fff3cd' : 'transparent' }}>
                                  <Table.Td>{project[v['A']]?.project_name}</Table.Td>
                                  <Table.Td>{discipline[v['B']]?.discipline_name}</Table.Td>
                                  <Table.Td>{module[project[v['A']].id][v['C']]?.mod_desc}</Table.Td>
                                  <Table.Td>{type_of_module[v['D']]?.name}</Table.Td>
                                  <Table.Td>{v['E']}</Table.Td>
                                  <Table.Td>{v['F']}</Table.Td>
                                  <Table.Td>{v['G']}</Table.Td>
                                  <Table.Td>{v['H']}</Table.Td>
                                  <Table.Td>{v['I']}</Table.Td>
                                  <Table.Td>{v['J']}</Table.Td>
                                  <Table.Td>{v['K']}</Table.Td>
                                  <Table.Td>{v['L']}</Table.Td>
                                  <Table.Td>{v['M']}</Table.Td>
                                  <Table.Td>{v['N']}</Table.Td>
                                  <Table.Td>{v['O']}</Table.Td>
                                  <Table.Td>{v['P']}</Table.Td>
                                  <Table.Td>{v['Q']}</Table.Td>
                                  <Table.Td>{v['R']}</Table.Td>
                                  <Table.Td>{v['S']}</Table.Td>
                                  <Table.Td>{company[v['T']]?.company_name || "-"}</Table.Td>
                                  <Table.Td>
                                    <ul>
                                      {
                                        error_list.map((err, erri) => {
                                          return (
                                            <li key={erri}> - {err}</li>
                                          )
                                        })
                                      }
                                    </ul>
                                  </Table.Td>
                                </Table.Tr>
                              )
                            }
                          })
                        }
                      </Table.Tbody>
                    </Table>
                  </div>
                  <div className="px-4 p-4 text-right space-x-2">
                    <Button color="gray" onClick={handleBackAction}><IconArrowLeft /> Back</Button>

                    {
                      !all_error.length ? (
                        <Button onClick={() => handleSubmit(form_submit)}><IconCheck />  Submit</Button>
                      ) : (
                        <Button color="red"><IconX />  Cannot Submit Data. Check column status.</Button>
                      )
                    }
                  </div>
                </>
              )
            }
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
