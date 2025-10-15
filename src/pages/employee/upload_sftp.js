import AuthLayout from '@/components/layout/authLayout'
import useApi from '@/hooks/useApi'
import useUser from '@/store/useUser'
import { FileInput, Paper } from '@mantine/core'
import { IconFile } from '@tabler/icons-react'
import axios from 'axios'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { masterDataList } from '@/data/sidebar/master-data'

function Upload_sftp() {
  const {user} = useUser()
  const router = useRouter()
  const API = useApi()
  const API_URL = API.API_URL

  const [file, setFile] = useState(null)

  const UploadFile = async(file) => {

    if(!file) {
      setFile(file)
    }

    const formData = new FormData()
    formData.append('file', file)

    console.log(formData)

    const {data} = await axios.post(API_URL + '/api/testing/upload_file', formData , {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization : `Bearer ${user.token}`
      }
    })


  }
  return (
    <AuthLayout sidebarList={masterDataList}>
      <div className='py-6'>
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
            <div className='px-4 py-2 bg-gray-200'>
              Upload SFTP
            </div>
            <div className='px-4 py-2'>
              <FileInput
                leftSection={<IconFile />}
                label="Attach your File"
                placeholder="Your File"
                leftSectionPointerEvents="none"
                onChange={UploadFile}
              />
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  )
}

export default Upload_sftp