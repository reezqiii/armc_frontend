import AuthLayout from '@/components/layout/authLayout';
import useApi from '@/hooks/useApi';
import useSwal from '@/hooks/useSwal';
import useUser from '@/store/useUser';
import { Button, Paper, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconEdit } from '@tabler/icons-react';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps = async (context) => {
  return {
    props: { id_employee: context.params.id_employee },
  };
};

function Edit_employee({ id_employee }) {

  const { user } = useUser()
  const router = useRouter()
  const API = useApi()
  const API_URL = API.API_URL
  const [data, setData] = useState({})
  const { showAlert } = useSwal()



  const form = useForm({
    initialValues: {
      nama: '',
      nomor_karyawan: ''
    },
    validate: {
      nama: (value) => (value.trim().length > 0 ? null : 'Employee Name is Required'),
      nomor_karyawan: (value) => (value.trim().length > 0 ? null : 'Employee Badge No is Required'),
    }
  })

  useEffect(() => {

    if (user.token && id_employee) {
      const getDetail = async () => {
        try {
          const { data } = await axios.get(API_URL + '/api/testing/detail_employee/' + id_employee, {
            headers: {
              Authorization: "Bearer " + user.token
            }
          })

          form.setValues({
            nama: data.nama,
            nomor_karyawan: data.nomor_karyawan
          })
        } catch (error) {
          const data_error = error.response.data
          showAlert(data_error.message, "error", data_error.error)
        }

      }

      getDetail()
    }

  }, [user.token, API_URL, id_employee]);

  const handleSubmit = async (values) => {
    const { data } = await axios.post(API_URL + '/api/testing/edit_employee', {
      id_employee: id_employee,
      data: values,
      id_user: user.id
    }, {
      headers: {
        Authorization: "Bearer " + user.token
      }
    })
  }

  return (
    <AuthLayout>
      <div className='py-6'>
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <div className="p-4 overflow-x-auto">
                <TextInput
                  label="Employee's Name"
                  withAsterisk
                  placeholder="Employee's Name"
                  {...form.getInputProps("nama")}
                />
              </div>

              <div className="p-4 overflow-x-auto">
                <TextInput
                  label="Employee's Badge"
                  withAsterisk
                  placeholder="Employee's Badge"
                  {...form.getInputProps("nomor_karyawan")}

                />
              </div>

              <div className='px-4 py-2 text-right'>
                <Button type='submit' color='orange' leftSection={<IconEdit />}> Update</Button>
              </div>

            </form>

          </Paper>
        </div>
      </div>
    </AuthLayout>
  )
}

Edit_employee.title = "Edit Employee"
export default Edit_employee