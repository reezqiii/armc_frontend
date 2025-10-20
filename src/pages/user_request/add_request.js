import AuthLayout from '@/components/layout/authLayout'
import { requestorList } from '@/data/sidebar/RequestorList'
import { Button, Paper, TextInput, Select, Checkbox, Group, Textarea } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { IconArrowLeft, IconDeviceFloppy, IconCalendar } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import useUser from '@/store/useUser'

export default function CreateRequest() {
    CreateRequest.title = "Create Request Form"
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
                                PCMS ACCESS LOGIN REQUEST FORM
                            </h1>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Header Section */}
                            <div className="px-6 pt-3 pb-3 space-y-3 bg-white rounded-md shadow-sm">
                                <div className="grid grid-cols-1 gap-3">
                                    <DateInput
                                        label={
                                            <span className="font-semibold">
                                                Requestor Date <span className="text-red-500">*</span>
                                            </span>
                                        }
                                        placeholder="Pick date"
                                        value={formData.request_date}
                                        onChange={(v) => handleChange('request_date', v)}
                                        valueFormat="MM/DD/YYYY"
                                        rightSection={<IconCalendar size={18} className="text-gray-500" />}
                                    />

                                    <TextInput
                                        label={
                                            <span className="font-semibold">
                                                Requestor <span className="text-red-500">*</span>
                                            </span>
                                        }
                                        value={formData.req_name}
                                        placeholder="Input requestor name..."
                                        readOnly
                                    />

                                    <TextInput
                                        label={
                                            <span className="font-semibold">
                                                Department <span className="text-red-500">*</span>
                                            </span>
                                        }
                                        placeholder="Select Department..."
                                        value={formData.department}
                                        readOnly
                                    />
                                </div>
                            </div>

                            {/* Section 1 */}
                            <div className="bg-gray-800 text-white text-base font-semibold px-6 py-3 mt-6 w-full rounded-t-md">
                                Description
                            </div>

                            <div className="px-6 pt-3 pb-3 space-y-3 bg-white rounded-b-md shadow-sm">
                                <TextInput
                                    label="Name"
                                    placeholder="Input employee name..."
                                    value={formData.employee_name}
                                    onChange={(e) => handleChange('employee_name', e.target.value)}
                                />

                                <TextInput
                                    label="Employee ID"
                                    placeholder="Input employee ID..."
                                    value={formData.employee_id}
                                    onChange={(e) => handleChange('employee_id', e.target.value)}
                                />

                                <TextInput
                                    label="Email (Office)"
                                    placeholder="example@company.com"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                />

                                <TextInput
                                    label="Project"
                                    placeholder="Input project name..."
                                    value={formData.project}
                                    onChange={(e) => handleChange('project', e.target.value)}
                                />

                                <TextInput
                                    label="Role"
                                    placeholder="Input employee role..."
                                    value={formData.role}
                                    onChange={(e) => handleChange('role', e.target.value)}
                                />
                            </div>

                            {/* Section 2 */}
                            <div className="bg-gray-800 text-white text-base font-semibold px-6 py-3 mt-6 w-full rounded-t-md">
                                Remarks
                            </div>

                            <div className="px-6 pt-3 pb-3 space-y-3 bg-white rounded-b-md shadow-sm">
                                <Textarea
                                    label="Request Reason"
                                    placeholder="Input request reason..."
                                    value={formData.reason}
                                    onChange={(e) => handleChange('reason', e.target.value)}
                                    minRows={3}
                                />
                            </div>

                            {/* Section 3 */}
                            <div className="bg-gray-800 text-white text-base font-semibold px-6 py-3 mt-6 w-full rounded-t-md">
                                Signature
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 bg-white rounded-b-md shadow-sm divide-x divide-gray-200">
                                {[
                                    { label: formData.req_name || 'Requestor', key: 'signature_requestor' },
                                    { label: 'HOD Requestor', key: 'signature_hod_requestor' },
                                    { label: 'HOD IT', key: 'signature_hod_it' },
                                ].map((item) => (
                                    <div
                                        key={item.key}
                                        className="flex flex-col items-center p-6 min-h-[200px] text-center"
                                    >
                                        <div className="flex-grow flex items-center justify-center w-full">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleChange(item.key, e.target.files[0])}
                                                className="block w-3/4 text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <label className="text-sm font-semibold text-gray-700 mt-auto">
                                            {item.label}
                                        </label>
                                    </div>
                                ))}
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-between mt-6">
                                <Button
                                    leftSection={<IconArrowLeft size={18} />}
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
