import AuthLayout from "@/components/layout/authLayout";
import requestorList from "@/data/sidebar/RequestorList";
import { Button, Paper, TextInput, Textarea, Select } from "@mantine/core";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconCheck,
  IconClock,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import Swal from "sweetalert2";

function EditRequest() {
  const router = useRouter();
  const { id } = router.query;
  const API = useApi();
  const API_URL = API.API_URL;
  const { user } = useUser();

  const [formData, setFormData] = useState({
    created_by_name: null,
    full_name: "",
    badge_no: "",
    email: "",
    position: null,
    department: null,
    project: null,
    request_reason: "",
    approval_hod_by: "",
    category_account: "",
    id_application: "",
    approval_it_hod_by_name: "-",
  });

  const [errors, setErrors] = useState({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [hodOptions, setHodOptions] = useState([]);
  const [navMenuOptions, setNavMenuOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [deptOptions, setDeptOptions] = useState([]);
  const [positionOptions, setPositionOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);

  const CATEGORY_OPTIONS = [
    { value: "0", label: "Create New Account" },
    { value: "1", label: "Request Permission" },
  ];

  const fetchHodsByDept = async (dept_id) => {
    if (!dept_id) return setHodOptions([]);
    try {
      const res = await axios.get(
        `${API_URL}/requests/hods-by-dept/${dept_id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );
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
    if (!id || !user?.token) return;
    const fetchInitialData = async () => {
      try {
        const headers = { Authorization: `Bearer ${user.token}` };
        const [deptRes, projectRes, navMenuRes, positionRes, requestRes] =
          await Promise.all([
            axios.get(`${API_URL}/portal-department`, { headers }),
            axios.get(`${API_URL}/portal-project`, { headers }),
            axios.get(`${API_URL}/portal_nav_menu/list`, { headers }),
            axios.get(`${API_URL}/portal-position`, { headers }),
            axios.get(`${API_URL}/requests/${id}`, { headers }),
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
        setPositionOptions(
          positionRes.data.map((pos) => ({
            value: String(pos.id_position),
            label: pos.position_name,
          })),
        );

        const data = requestRes.data;

        const catValue =
          data.category_account != null ? String(data.category_account) : "";
        const deptId = data.id_department ? String(data.id_department) : null;
        const projectId = data.id_project ? String(data.id_project) : null;
        const posId = data.id_position ? String(data.id_position) : null;
        const appId = data.id_application ? String(data.id_application) : "";
        const hodId = data.approval_hod_by_id
          ? String(data.approval_hod_by_id)
          : "";

        setFormData({
          created_by_name:
            data.created_by_user?.full_name || data.created_by_name || null,
          full_name: data.full_name || "",
          badge_no: data.badge_no || "",
          email: data.email || "",
          position: posId,
          department: deptId,
          project: projectId,
          request_reason: data.request_reason || "",
          category_account: catValue,
          approval_hod_by: hodId,
          id_application: appId,
          approval_it_hod_by_name: data.approval_it_hod_by?.full_name || "-",
        });

        if (deptId) fetchHodsByDept(deptId);
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };
    fetchInitialData();
  }, [API_URL, id, user?.token]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.category_account) newErrors.category_account = "Required";
    if (!formData.approval_hod_by) newErrors.approval_hod_by = "Required";
    if (!formData.full_name) newErrors.full_name = "Required";
    if (!formData.email) newErrors.email = "Required";
    if (!formData.request_reason) newErrors.request_reason = "Required";
    if (!formData.id_application) newErrors.id_application = "Required";
    if (!formData.position) newErrors.position = "Required";

    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    const result = await Swal.fire({
      title: "Are you sure you want to update this data?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0d9488",
      cancelButtonColor: "#d33",
    });
    if (!result.isConfirmed) return;

    setLoadingSubmit(true);

    const payload = {
      full_name: formData.full_name,
      badge_no: formData.badge_no?.trim() || null,
      email: formData.email,
      request_reason: formData.request_reason,
      status_active: 1,
      id_position: formData.position ? Number(formData.position) : null,
      id_project: formData.project ? Number(formData.project) : null,
      id_department: formData.department ? Number(formData.department) : null,
      category_account: formData.category_account
        ? Number(formData.category_account)
        : null,
      id_application: formData.id_application
        ? Number(formData.id_application)
        : null,
      approval_hod_by_id: formData.approval_hod_by
        ? Number(formData.approval_hod_by)
        : null,
    };

    try {
      await axios.put(`${API_URL}/requests/${id}`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      await Swal.fire({
        icon: "success",
        title: "Successful!",
        text: "The data has been updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
      router.replace(router.asPath);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "An error occurred.",
      });
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
                    Requestor
                  </label>
                  <div className="h-[40px] px-4 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600 font-medium">
                    {formData.created_by_name || "-"}
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
                    data={CATEGORY_OPTIONS}
                    value={formData.category_account}
                    onChange={(v) => handleChange("category_account", v)}
                    error={errors.category_account}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
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
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
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
                    classNames={{ label: "font-semibold mb-1 text-gray-700" }}
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
                    classNames={{ label: "font-semibold mb-1 text-gray-700" }}
                  />

                  <Select
                    required
                    label="Application Access"
                    placeholder="Select Application Access"
                    data={navMenuOptions}
                    value={formData.id_application}
                    onChange={(v) => handleChange("id_application", v)}
                    error={errors.id_application}
                    searchable
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />

                  <TextInput
                    required
                    type="email"
                    label="Email Address"
                    placeholder="Input Email Address"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    error={errors.email}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
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
                  classNames={{ label: "font-semibold mb-1 text-gray-700" }}
                />
              </div>

              <div className="space-y-6">
                <div className="-mx-6 md:-mx-10 bg-teal-600 px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                  Approval Workflow
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-teal-50 px-6 py-2 text-[10px] font-bold text-teal-700 uppercase tracking-widest border-b border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>Requestor</div>
                      <div>Dept Head Approval</div>
                      <div>IT Head Approval</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 bg-white">
                    <div className="p-5 flex flex-col justify-between min-h-[120px]">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Requested By
                      </span>
                      <div className="flex items-center gap-3 py-2 mt-auto">
                        <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-[14px] font-bold text-teal-700 flex-shrink-0">
                          {(formData.created_by_name || "-")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-800 leading-tight border-b border-gray-100 pb-1">
                            {formData.created_by_name || "-"}
                          </p>
                          <p className="text-xs text-teal-500 mt-0.5 flex items-center gap-1">
                            <IconCheck size={12} /> Submitted
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col min-h-[120px]">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Acknowledge By
                      </span>
                      <div className="mt-auto">
                        <Select
                          error={errors.approval_hod_by}
                          placeholder={
                            formData.department
                              ? "Select HOD"
                              : "Select Dept First"
                          }
                          disabled={!formData.department}
                          searchable
                          value={formData.approval_hod_by}
                          onChange={(v) => handleChange("approval_hod_by", v)}
                          data={hodOptions}
                          classNames={{
                            input:
                              "text-sm font-bold text-teal-700 border-gray-300 focus:border-teal-500",
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-5 bg-gray-50/30 flex flex-col min-h-[120px]">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Approved By
                      </span>
                      <div className="mt-auto">
                        {formData.approval_it_hod_by_name &&
                        formData.approval_it_hod_by_name !== "-" ? (
                          <div className="flex items-center gap-3 py-2">
                            <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-[14px] font-bold text-teal-700 flex-shrink-0">
                              {(formData.approval_it_hod_by_name || "-")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-teal-600 leading-tight border-b border-gray-100 pb-1">
                                {formData.approval_it_hod_by_name}
                              </p>
                              <p className="text-xs text-teal-500 mt-0.5 flex items-center gap-1">
                                <IconCheck size={12} /> Approved
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 py-2">
                            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                              <IconClock size={16} color="#9ca3af" />
                            </div>
                            <p className="text-sm font-medium text-gray-400 italic">
                              Waiting IT Approval...
                            </p>
                          </div>
                        )}
                      </div>
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
                  Update
                </Button>
              </div>
            </div>
          </form>
        </Paper>
      </div>
    </AuthLayout>
  );
}

EditRequest.title = "Edit Request Form";
export default EditRequest;
