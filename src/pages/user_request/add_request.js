import AuthLayout from '@/components/layout/authLayout'
import { requestorList } from '@/data/sidebar/RequestorList'
import { Button, Paper, TextInput, Select, Checkbox, Group, Textarea } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import useUser from '@/store/useUser'

export default function CreateRequest() {
    CreateRequest.title = "Create Request"
    const router = useRouter()
    const { user } = useUser()

    const [formData, setFormData] = useState({
        req_name: user?.name || '',
        designation: '',
        department: '',
        request_date: null,
        app_name: '',
        status_request: [],
        reason: '',
        details: '',
        file: null,
        acknowledge_by: '',
        approved_by: '',
    })

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("Form submitted:", formData)
        // TODO: axios.post(API_URL + '/api/...', formData)
    }

    return (
        <AuthLayout sidebarList={requestorList}>
            <div className="py-6">
                <div className="max-w-full mx-auto sm:px-6 lg:px-8">
                    <Paper radius="sm" mt="md" withBorder shadow="xs" className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-center border-b pb-2 mb-5">
                            <h1 className="text-xl font-bold text-blue-500">
                                Create User Permission Request
                            </h1>
                        </div>

                        {/* Form Section 1 */}
                        <form onSubmit={handleSubmit}>
                            <div className="px-6 pt-4 pb-2 space-y-4 bg-white -mt-4">
                                <div className="grid grid-cols-1 gap-2">
                                    <TextInput
                                        label={
                                            <span className="font-semibold">
                                                Name / Requestor <span className="text-red-500">*</span>
                                            </span>
                                        }
                                        value={formData.req_name}
                                        readOnly
                                    />

                                    <TextInput
                                        label={
                                            <span className="font-semibold">
                                                Designation <span className="text-red-500">*</span>
                                            </span>
                                        }
                                        placeholder="Input your designation..."
                                        value={formData.designation}
                                        onChange={(e) => handleChange('designation', e.target.value)}
                                    />

                                    <Select
                                        label={
                                            <span className="font-semibold">
                                                Division / Department <span className="text-red-500">*</span>
                                            </span>
                                        }
                                        placeholder="Select department"
                                        data={['IT', 'HRD', 'Finance', 'Production']}
                                        value={formData.department}
                                        onChange={(v) => handleChange('department', v)}
                                    />

                                    <DateInput
                                        label={
                                            <span className="font-semibold">
                                                Request Date <span className="text-red-500">*</span>
                                            </span>
                                        }
                                        placeholder="Pick date"
                                        value={formData.request_date}
                                        onChange={(v) => handleChange('request_date', v)}
                                        valueFormat="MM/DD/YYYY"
                                    />
                                </div>
                            </div>

                            {/* Section 2 */}
                            <div className="bg-gray-800 text-white text-base font-semibold px-6 py-4 mt-8 w-full">
                                Description of Software Application
                            </div>

                            <div className="px-6 pt-4 pb-2 space-y-3 bg-white">
                                <TextInput
                                    label={
                                        <span className="font-semibold">
                                            Application Name <span className="text-red-500">*</span>
                                        </span>
                                    }
                                    placeholder="Input application name..."
                                    value={formData.app_name}
                                    onChange={(e) => handleChange('app_name', e.target.value)}
                                />

                                <div>
                                    {/* Baris Label dan Instruksi */}
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Status Request <span className="text-red-500">*</span>
                                        </label>
                                    </div>

                                    {/* Baris Checkbox */}
                                    <div className="flex items-center justify-between">
                                        {/* Checkbox Group */}
                                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                                            {['New', 'Add', 'Change', 'Delete'].map((status) => (
                                                <Checkbox
                                                    key={status}
                                                    label={status}
                                                    size="lg"
                                                    checked={formData.status_request.includes(status)}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        handleChange(
                                                            'status_request',
                                                            checked
                                                                ? [...formData.status_request, status]
                                                                : formData.status_request.filter((s) => s !== status)
                                                        );
                                                    }}
                                                    classNames={{
                                                        label: 'text-sm text-gray-700 flex items-center',
                                                        body: 'flex items-center',
                                                    }}
                                                />
                                            ))}
                                        </div>

                                        {/* Instruction Text */}
                                        <span className="text-sm italic text-gray-600 ml-4 whitespace-nowrap">
                                            *Please Tick (✓)
                                        </span>
                                    </div>
                                </div>

                                <TextInput
                                    label="Reason of Request"
                                    placeholder="Input your request reason..."
                                    value={formData.reason}
                                    onChange={(e) => handleChange('reason', e.target.value)}
                                />

                                <Textarea
                                    label="Request Details"
                                    placeholder="Input your request details..."
                                    value={formData.details}
                                    onChange={(e) => handleChange('details', e.target.value)}
                                />

                            </div>


                            {/* Section 3 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 mt-6">
                                <div className="bg-gray-800 text-white text-center py-4 font-semibold">
                                    Requestor Department
                                </div>
                                <div className="bg-gray-800 text-white text-center py-4 font-semibold">
                                    Requestor Head of Department
                                </div>
                                <div className="bg-gray-800 text-white text-center py-4 font-semibold">
                                    Information Technology Manager
                                </div>

                                <div className="p-4">
                                    <TextInput label="Requested by" value={formData.req_name} readOnly />
                                </div>
                                <div className="p-4">
                                    <Select
                                        label="Acknowledge by"
                                        placeholder="-- Select --"
                                        data={['1002015 - Ahmad Yusuf', '1003042 - Budi Santoso']}
                                        value={formData.acknowledge_by}
                                        onChange={(v) => handleChange('acknowledge_by', v)}
                                    />
                                </div>
                                <div className="p-4">
                                    <Select
                                        label="Approved by"
                                        placeholder="-- Select --"
                                        data={['10030915 - Wahyu Hidayat']}
                                        value={formData.approved_by}
                                        onChange={(v) => handleChange('approved_by', v)}
                                    />
                                </div>
                            </div>


                            {/* Buttons */}
                            <div className="flex justify-between mt-6">
                                <Button
                                    leftSection={<IconArrowLeft size={16} />}
                                    color="gray"
                                    onClick={() => router.back()}
                                >
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    leftSection={<IconDeviceFloppy size={18} />}
                                    color="blue"
                                    radius="sm"
                                    className="px-5 py-2 shadow-sm"
                                >
                                    Submit
                                </Button>
                            </div>
                        </form>
                    </Paper>
                </div>
            </div>
        </AuthLayout>

    )
}
