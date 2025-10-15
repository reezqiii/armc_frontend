import AuthLayout from '@/components/layout/authLayout';
import { templateSidebarList } from '@/data/sidebar/exampleList';
import useApi from '@/hooks/useApi';
import useDecrypt from '@/hooks/useDecrypt';
import useEncrypt from '@/hooks/useEncrypt';
import useSwal from '@/hooks/useSwal';
import useUser from '@/store/useUser';
import { Button, Input, LoadingOverlay, Paper, Table, Text, TextInput } from '@mantine/core';
import { IconArrowLeft, IconEdit } from '@tabler/icons-react';
import axios from 'axios';
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

Update.title = "Update Tag Number"
function Update() {
  const router = useRouter()
  const { user } = useUser()
  const { decrypt } = useDecrypt()
  const { encrypt } = useEncrypt()
  const {showAlert} = useSwal()
  const API         = useApi()
  const API_URL     = API.API_URL
  const { ids } = router.query
  const [idList, setIdList] = useState([])
  const [loadingData, setLoadingData]     = useState(true)
  const [loadingUpdate, setLoadingUpdate] = useState(false)
  const [form, setForm] = useState([])
  const [errors, setErrors] = useState({})



  const setFormValue = (index, event) => {
    const { value, name } = event.target
    const newForm = [...form]
    newForm[index][name] = value
    setForm(newForm)
  }

  const validateForm = () => {
    const tempErrors = {};
    form.forEach((v, i) => {
      if (!v.tag_description && v.tag_description.trim() === "") {
        tempErrors[i] = { ...tempErrors[i], tag_description: "Tag Description is required" };
      }
      if (!v.system && v.system.trim() === "") {
        tempErrors[i] = { ...tempErrors[i], system: "System is required" };
      }
      if (!v.subsystem && v.subsystem.trim() === "") {
        tempErrors[i] = { ...tempErrors[i], subsystem: "Subsystem is required" };
      }
      if (!v.subsystem_description && v.subsystem_description.trim() === "") {
        tempErrors[i] = { ...tempErrors[i], subsystem_description: "Subsystem Description is required" };
      }
    })
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  }

  const handleSubmit = async () => {
    if(validateForm()) {
      setLoadingUpdate(true)
      const {data} = await axios.post(API_URL + '/api/template/update_template', {
        formData  : form,
        id_user   : user.id
      }, {
        headers : {
          Authorization : "Bearer "+user.token
        }
      })

      if(data.success) {
        showAlert("Success", "success", "Data Has Been Updated !!")
        setTimeout(() => {
          router.push("/template")
        }, 1000);
      }

    }
  }

  useEffect(() => {
    if (!ids || ids.trim() === '') {
      router.push('/template')
      return
    }

    let decrypted_ids = decrypt(ids)
    if (!decrypted_ids) {
      router.push('/template')
      return
    }

    decrypted_ids = JSON.parse(decrypted_ids)
    setIdList(decrypted_ids)

  }, [ids, router])

  useEffect(() => {
    if (idList.length > 0) {
      const loadData = async () => {
        const string_ids = encrypt(JSON.stringify(idList))

        const { data } = await axios.get(API_URL + '/api/template/detail_tag_list', {
          headers: {
            Authorization: "Bearer " + user.token
          },
          params: {
            ids: string_ids
          }
        })

        if (data.success) {
          setForm(data.data)
        }

        setLoadingData(false)

      }

      loadData()
    }
  }, [
    user.token,
    idList,
    API_URL
  ])


  return (
    <AuthLayout sidebarList={templateSidebarList}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" withBorder style={{
            position: "relative"
          }}>
            <LoadingOverlay visible={loadingData || loadingUpdate} />

            <div className="bg-gray-200 px-4 py-2">
              <Text fw={500}>Update Tag Number</Text>
            </div>
            <div className="p-4 overflow-x-auto">
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Tag Numer</Table.Th>
                    <Table.Th>Tag Description</Table.Th>
                    <Table.Th>System </Table.Th>
                    <Table.Th>Subsystem </Table.Th>
                    <Table.Th>Subsystem Description </Table.Th>
                    <Table.Th>Location </Table.Th>
                    <Table.Th>Model No </Table.Th>
                    <Table.Th>Serial No </Table.Th>
                    <Table.Th>Rating </Table.Th>
                    <Table.Th>Manufacturer </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {
                    form.map((v, i) => {
                      return (
                        <Table.Tr key={i}>
                          <Table.Td>{v.tag_number}</Table.Td>
                          <Table.Td>
                            <TextInput
                              name='tag_description'
                              placeholder={"Tag Description"}
                              value={v.tag_description}
                              error={errors[i]?.tag_description}
                              onChange={(event) => setFormValue(i, event)}
                            />
                          </Table.Td>
                          <Table.Td>
                            <TextInput
                              name='system'
                              placeholder={"System"}
                              value={v.system}
                              error={errors[i]?.system}
                              onChange={(event) => setFormValue(i, event)}
                            />
                          </Table.Td>
                          <Table.Td>
                            <TextInput
                              name='subsystem'
                              placeholder={"Subsystem"}
                              value={v.subsystem}
                              error={errors[i]?.subsystem}
                              onChange={(event) => setFormValue(i, event)}
                            />
                          </Table.Td>
                          <Table.Td>
                            <TextInput
                              name='subsystem_description'
                              placeholder={"Subsystem Description"}
                              value={v.subsystem_description}
                              error={errors[i]?.subsystem_description}
                              onChange={(event) => setFormValue(i, event)}
                            />
                          </Table.Td>

                          <Table.Td>
                            <TextInput
                              name='location'
                              placeholder={"Location"}
                              value={v.location}
                              error={errors[i]?.location}
                              onChange={(event) => setFormValue(i, event)}
                            />
                          </Table.Td>

                          <Table.Td>
                            <TextInput
                              name='model_no'
                              placeholder={"Model No"}
                              value={v.model_no}
                              error={errors[i]?.model_no}
                              onChange={(event) => setFormValue(i, event)}
                            />
                          </Table.Td>

                          <Table.Td>
                            <TextInput
                              name='serial_no'
                              placeholder={"Serial No"}
                              value={v.serial_no}
                              error={errors[i]?.serial_no}
                              onChange={(event) => setFormValue(i, event)}
                            />
                          </Table.Td>

                          <Table.Td>
                            <TextInput
                              name='rating'
                              placeholder={"Rating"}
                              value={v.rating}
                              error={errors[i]?.rating}
                              onChange={(event) => setFormValue(i, event)}
                            />
                          </Table.Td>

                          <Table.Td>
                            <TextInput
                              name='manufacturer'
                              placeholder={"Manufacturer"}
                              value={v.manufacturer}
                              error={errors[i]?.manufacturer}
                              onChange={(event) => setFormValue(i, event)}
                            />
                          </Table.Td>

                        </Table.Tr>
                      )
                    })
                  }
                </Table.Tbody>
              </Table>
            </div>
            <hr />
            <div className='p-4 text-right space-x-2'>
              <Button onClick={() => router.push("/template")} color='gray' leftSection={<IconArrowLeft  />}> Back</Button>
              <Button onClick={handleSubmit} color='orange' leftSection={<IconEdit />}> Update</Button>
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  )
}

export default Update
