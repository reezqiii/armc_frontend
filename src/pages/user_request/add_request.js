import AuthLayout from "@/components/layout/authLayout";
import requestorList from "@/data/sidebar/RequestorList";
import {
  Button,
  Paper,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconCalendar,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import Swal from "sweetalert2";
import { useDebouncedValue } from "@mantine/hooks";
import { formatDate } from "@/lib/dateFormat";

function CreateRequest() {
  const router = useRouter();
  const API = useApi();
  const API_URL = API.API_URL;
  const { user } = useUser();

  const [formData, setFormData] = React.useState({
    created_by_name: user?.full_name || user?.name || "-",
    full_name: "",
    badge_no: "",
    email: "",
    position: "",
    department: null,
    project: null,
    request_reason: "",
    approval_hod_by: "",
    category_account: "",
    access_nav_menu: [],
  });
  const [errors, setErrors] = React.useState({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [hodOptions, setHodOptions] = useState([]);
  const [deptOptions, setDeptOptions] = useState([]);
  const [positionOptions, setPositionOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [navMenuOptions, setNavMenuOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));

    if (field === "department") {
      setFormData((prev) => ({
        ...prev,
        department: value,
        approval_hod_by: "",
      }));
      fetchHodsByDept(value);
    }
  };

  const fetchHodsByDept = async (dept_id) => {
    if (!dept_id) return setHodOptions([]);
    try {
      const res = await axios.get(`${API_URL}/user/hods-by-dept/${dept_id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setHodOptions(
        res.data.map((u) => ({
          value: String(u.id_user),
          label: `${u.badge_no} - ${u.full_name}`,
        })),
      );
    } catch (err) {
      setHodOptions([]);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const headers = { Authorization: `Bearer ${user.token}` };
        const [deptRes, projectRes, navMenuRes, categoryRes, positionRes] =
          await Promise.all([
            axios.get(`${API_URL}/portal-department`, { headers }),
            axios.get(`${API_URL}/portal-project`, { headers }),
            axios.get(`${API_URL}/portal_nav_menu/list`, { headers }),
            axios.get(`${API_URL}/category-account`, { headers }),
            axios.get(`${API_URL}/portal-position`, { headers }),
          ]);

        setDeptOptions(
          deptRes.data.map((d) => ({
            value: String(d.id_department),
            label: d.name_of_department,
          })),
        );
        setProjectOptions(
          projectRes.data.map((p) => ({
            value: String(p.id_project),
            label: p.project_name,
          })),
        );
        setNavMenuOptions(
          navMenuRes.data.map((n) => ({
            value: String(n.id_application),
            label: n.application_name,
          })),
        );
        setCategoryOptions(
          categoryRes.data.map((c) => ({ value: String(c.id), label: c.name })),
        );
        setPositionOptions(
          positionRes.data.map((pos) => ({
            value: String(pos.id_position),
            label: pos.position_name,
          })),
        );
      } catch (err) {
        console.error("Load failed", err);
      }
    };
    if (user?.token) fetchAllData();
  }, [API_URL, user?.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.category_account) newErrors.category_account = "Required";
    if (!formData.approval_hod_by) newErrors.approval_hod_by = "Required";
    if (!formData.full_name) newErrors.full_name = "Required";
    if (!formData.email) newErrors.email = "Required";
    if (!formData.request_reason) newErrors.request_reason = "Required";
    if (!formData.access_nav_menu.length)
      newErrors.access_nav_menu = "Required";
    if (!formData.position) newErrors.position = "Required";

    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    const result = await Swal.fire({
      title: "Submit Request?",
      text: "This request will be sent to Dept Head for approval.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Submit",
      confirmButtonColor: "#0d9488",
    });

    if (!result.isConfirmed) return;

    setLoadingSubmit(true);
    const payload = {
      ...formData,
      badge_no: formData.badge_no?.trim() || null,
      request_status: 1,
      status_active: 1,
      id_position: Number(formData.position),
      id_project: Number(formData.project),
      id_department: Number(formData.department),
      id_category: Number(formData.category_account),
    };

    try {
      await axios.post(`${API_URL}/requests/create`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      Swal.fire("Success!", "Request submitted.", "success");
      router.push("/user_request/list/awaiting-hod-approval");
    } catch (error) {
      Swal.fire("Error", "Submission failed.", "error");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <AuthLayout sidebarList={requestorList}>
      <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8 w-full">
        <Paper
          radius="md"
          shadow="md"
          className="bg-white p-0 w-full overflow-hidden border border-gray-200"
        >
          <div className="border-b py-6 text-center bg-white">
            <h1 className="text-2xl font-bold text-teal-600 uppercase tracking-tight">
              Portal Access Request Form
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 md:p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block font-semibold text-gray-700 text-sm">
                    Request Date
                  </label>
                  <div className="h-[40px] px-4 bg-gray-50 border border-gray-300 rounded-md flex items-center justify-between text-sm text-gray-600">
                    {formatDate(new Date())}{" "}
                    <IconCalendar size={18} className="text-gray-400" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block font-semibold text-gray-700 text-sm">
                    Requestor
                  </label>
                  <div className="h-[40px] px-4 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600 font-medium">
                    {formData.created_by_name}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="-mx-6 md:-mx-10 bg-teal-600 px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                  Employee Description
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Select
                    required
                    label="Category Account"
                    placeholder="Select Category Account"
                    data={categoryOptions}
                    value={formData.category_account}
                    onChange={(v) => handleChange("category_account", v)}
                    error={errors.category_account}
                  />
                  <TextInput
                    required
                    label="Badge ID"
                    placeholder="Input Badge ID"
                    value={formData.badge_no}
                    onChange={(e) => handleChange("badge_no", e.target.value)}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />
                  <TextInput
                    required
                    label="Full Name"
                    placeholder="Input Full Name"
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    error={errors.full_name}
                  />
                  <Select
                    required
                    label="Position"
                    placeholder="Select Position"
                    data={positionOptions}
                    value={formData.position}
                    onChange={(v) => handleChange("position", v)}
                    error={errors.position}
                    searchable
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />
                  <Select
                    required
                    label="Department"
                    placeholder="Select Department"
                    data={deptOptions}
                    value={formData.department}
                    onChange={(v) => handleChange("department", v)}
                    error={errors.department}
                    searchable
                  />
                  <Select
                    required
                    label="Project"
                    placeholder="Select Project"
                    data={projectOptions}
                    value={formData.project}
                    onChange={(v) => handleChange("project", v)}
                    error={errors.project}
                    searchable
                  />
                  <MultiSelect
                    required
                    label="Application Access"
                    placeholder="Select Application Access"
                    data={navMenuOptions}
                    value={formData.access_nav_menu}
                    onChange={(v) => handleChange("access_nav_menu", v)}
                    error={errors.access_nav_menu}
                    searchable
                  />
                  <TextInput
                    required
                    type="email"
                    label="Email Address"
                    placeholder="Input Email Address"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    error={errors.email}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="-mx-6 md:-mx-10 bg-teal-600 px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                  Purpose of Access Request
                </div>
                <Textarea
                  required
                  label="Purpose of Request"
                  value={formData.request_reason}
                  onChange={(e) =>
                    handleChange("request_reason", e.target.value)
                  }
                  minRows={3}
                  error={errors.request_reason}
                />
              </div>

              <div className="space-y-4">
                <div className="-mx-6 md:-mx-10 bg-teal-600 px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest mb-8">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>Requestor</div>
                    <div>Dept Head Approval</div>
                    <div>IT Head Approval</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 border border-gray-300 rounded-lg divide-y md:divide-y-0 md:divide-x divide-gray-300 overflow-hidden">
                  <div className="p-4 bg-white min-h-[100px] flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      Requested By
                    </span>
                    <div className="text-sm font-bold">
                      {formData.created_by_name}
                    </div>
                  </div>
                  <div className="p-4 bg-white min-h-[100px] flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      Acknowledge By
                    </span>
                    <Select
                      error={errors.approval_hod_by}
                      placeholder={
                        formData.department ? "Select HOD" : "Select Dept First"
                      }
                      disabled={!formData.department}
                      searchable
                      value={formData.approval_hod_by}
                      onChange={(v) => handleChange("approval_hod_by", v)}
                      data={hodOptions}
                      variant="unstyled"
                      classNames={{
                        input: "text-sm font-bold text-teal-600 p-0",
                      }}
                    />
                  </div>
                  <div className="p-4 bg-gray-50 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      Approved By
                    </span>
                    <div className="text-[12px] italic text-gray-400">
                      Waiting HOD IT...
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  leftSection={<IconArrowLeft size={18} />}
                  color="gray"
                  variant="subtle"
                  onClick={() => router.back()}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  leftSection={<IconDeviceFloppy size={18} />}
                  color="teal"
                  loading={loadingSubmit}
                >
                  Submit Request
                </Button>
              </div>
            </div>
          </form>
        </Paper>
      </div>
    </AuthLayout>
  );
}

export default CreateRequest;
