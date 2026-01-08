import AuthLayout from "@/components/layout/authLayout";
import requestorList from "@/data/sidebar/RequestorList";
import {
  Button,
  Paper,
  TextInput,
  Textarea,
  Select,
  Autocomplete,
  MultiSelect,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconCalendar,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useSwal from "@/hooks/useSwal";
import useApi from "@/hooks/useApi";
import useDecrypt from "@/hooks/useDecrypt";
import useEncrypt from "@/hooks/useEncrypt";
import Swal from "sweetalert2";
import { useDebouncedValue } from "@mantine/hooks";
import { formatDate } from "@/lib/dateFormat";

function EditRequest() {
  const router = useRouter();
  const { id } = router.query;
  const { showAlert } = useSwal();
  const API = useApi();
  const API_URL = API.API_URL;
  const { user } = useUser();
  const { encrypt } = useEncrypt();
  const { decrypt } = useDecrypt();
  const [formData, setFormData] = useState({
    created_by_name: user?.full_name || user?.name || "-",
    full_name: "",
    badge_no: "",
    email: "",
    project: "",
    department: "",
    request_reason: "",
    approval_hod_by: "",
    approval_it_hod_by: "",
    remarks: "",
    request_status: 0,
    company: "",
    company_name: "",
  });
  const CATEGORY_ACCOUNT_OPTIONS = [
    { value: "0", label: "Create New Account" },
    { value: "1", label: "Request Permission Access" },
    { value: "2", label: "Request Outside Access" },
  ];
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [badgeOptions, setBadgeOptions] = useState([]);
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [hodOptions, setHodOptions] = useState([]);
  const [accessYardOptions, setAccessYardOptions] = useState([]);
  const [navMenuOptions, setNavMenuOptions] = useState([]);
  const isReturned = formData.request_status === 8;

  useEffect(() => {
    if (!debouncedSearch) {
      setBadgeOptions([]);
      return;
    }

    const fetchBadges = async () => {
      setBadgeLoading(true);
      try {
        const res = await axios.get(
          `${API_URL}/iss_employee/search?badge=${debouncedSearch}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const employees = Array.isArray(res.data) ? res.data : [res.data];
        setBadgeOptions(
          employees.map((e) => ({
            value: String(e.badge_no || e.badge),
            label: `${e.badge_no || e.badge} - ${e.full_name || e.name}`,
            full_name: e.full_name || e.name,
            department_name: e.dept || "",
            position_name: e.design_desc || "",
            project_name: e.project_desc || "",
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setBadgeLoading(false);
      }
    };

    fetchBadges();
  }, [debouncedSearch]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [hodRes, companyRes, navMenuRes] = await Promise.all([
          axios.get(`${API_URL}/requests/hods`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get(`${API_URL}/portal_company/list`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get(`${API_URL}/portal_nav_menu/list`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);

        setHodOptions(
          hodRes.data.map((u) => ({
            value: String(u.id_user),
            label: `${u.badge_no} - ${u.full_name}`,
          }))
        );

        setAccessYardOptions(
          companyRes.data.map((c) => ({
            value: String(c.id_company),
            label: c.company_name,
          }))
        );

        setNavMenuOptions(
          navMenuRes.data.map((n) => ({
            value: String(n.id_application),
            label: n.application_name,
          }))
        );

        if (id) {
          const res = await axios.get(`${API_URL}/requests/${id}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });

          const data = res.data;

          setFormData((prev) => ({
            ...prev,
            full_name: data.full_name || "",
            badge_no: data.badge_no || "",
            email: data.email || "",
            request_reason: data.request_reason || "",
            remarks: data.remarks || "",
            approval_hod_by: data.approval_hod_by?.id_user
              ? String(data.approval_hod_by.id_user)
              : "",
            approval_hod_date_at: data.approval_hod_date_at || null,
            approval_lead_it_by_name:
              data.approval_lead_it_by?.full_name || "-",
            approval_lead_date_at: data.approval_lead_date_at || null,
            approval_it_hod_by_name: data.approval_it_hod_by?.full_name || "-",
            approval_it_date_at: data.approval_it_date_at || null,
            company: data.company?.id_company
              ? String(data.company.id_company)
              : "",
            department: data.dept_id ? String(data.dept_id) : "",
            project: data.project_id ? String(data.project_id) : "",
            project_name: data.project_name,
            department_name: data.department_name,
            position: data.design_id ? String(data.design_id) : "",
            position_name: data.position_name ?? data.position ?? "",
            request_status: data.request_status,
            company_name: data.company?.company_name || "",
            category_account: String(data.category_account ?? ""),
            approval_hod_by: data.approval_hod_by?.id
              ? String(data.approval_hod_by.id)
              : "",

            access_nav_menu: Array.isArray(data.access_nav_menu)
              ? data.access_nav_menu.map((item) => String(item.id))
              : [],

            access_yard_company: Array.isArray(data.access_yard_company)
              ? data.access_yard_company.map((item) => String(item.id))
              : [],
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  const handleSelectBadge = async (value) => {
    try {
      const res = await axios.get(`${API_URL}/iss_employee/employee/${value}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setFormData((prev) => ({
        ...prev,
        badge_no: value,
        full_name: res.data.name ?? "",
        department_name: res.data.department.dept ?? "",
        position_name: res.data.position?.design_desc ?? "",
        project_name: res.data.project.project_desc ?? "",
        company_name: res.data.company_name ?? "",
        company: res.data.company ?? "",
        department: res.data.department.dept_id ?? "",
        position: res.data.position?.design_id ?? "",
        project: res.data.project.project_id ?? "",
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setBadgeLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (
      !formData.access_yard_company ||
      formData.access_yard_company.length === 0
    ) {
      newErrors.access_yard_company = "Company Yard Access is required";
    }

    if (!formData.access_nav_menu || formData.access_nav_menu.length === 0) {
      newErrors.access_nav_menu = "Application Access is required";
    }

    if (!formData.approval_hod_by) {
      newErrors.approval_hod_by = "HOD must be selected";
    }

    if (!formData.category_account) {
      newErrors.category_account = "Category account is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await Swal.fire({
      title: id
        ? "Are you sure you want to update this data?"
        : "Are you sure you want to create a new request?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: id ? "Yes, update!" : "Yes, save",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    setLoadingSubmit(true);

    const payload = {
      full_name: formData.full_name,
      badge_no: formData.badge_no,
      email: formData.email,
      request_type: 1,
      request_reason: formData.request_reason,
      status_active: 1,
      remarks: formData.remarks,
      project_id: Number(formData.project),
      dept_id: Number(formData.department),
      design_id: Number(formData.position),
      id_company: Number(formData.company),
      category_account:
        formData.category_account !== ""
          ? Number(formData.category_account)
          : null,
      access_yard_company: Array.isArray(formData.access_yard_company)
        ? formData.access_yard_company.join(",")
        : formData.access_yard_company || "",
      access_nav_menu: Array.isArray(formData.access_nav_menu)
        ? formData.access_nav_menu.join(",")
        : formData.access_nav_menu || "",
    };
    payload.approval_hod_by = formData.approval_hod_by
      ? { id_user: Number(formData.approval_hod_by) }
      : null;

    try {
      if (id) {
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
      } else {
        await axios.post(`${API_URL}/requests/create`, payload, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        await Swal.fire({
          icon: "success",
          title: "Success!",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      router.replace(router.asPath);
    } catch (error) {
      console.error(error.response?.data || error.message);
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "An error occurred while saving the data. Please try again.",
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
          {/* Header */}
          <div className="border-b py-6 text-center bg-white">
            <h1 className="text-2xl font-bold text-blue-600 uppercase tracking-tight">
              PCMS Access Login Request Form
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 md:p-10 space-y-10">
              {/* 1. INFORMASI DASAR (Date & Requestor) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block font-semibold text-gray-700 text-sm">
                    Request Date <span className="text-red-500">*</span>
                  </label>
                  <div className="h-[40px] px-4 bg-gray-50 border border-gray-300 rounded-md flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {formData.updated_at
                        ? formatDate(formData.updated_at)
                        : formatDate(new Date())}
                    </span>
                    <IconCalendar size={18} className="text-gray-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-gray-700 text-sm">
                    Requestor <span className="text-red-500">*</span>
                  </label>
                  <div className="h-[40px] px-4 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600 font-medium">
                    {formData?.created_by_name || "-"}
                  </div>
                </div>
              </div>

              {/* 2. DESCRIPTION SECTION */}
              <div className="space-y-6">
                <div className="-mx-6 md:-mx-10 bg-blue-600 shadow-sm">
                  <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                    Employee Description
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* CATEGORY ACCOUNT */}
                  <Select
                    required
                    label="Category Account"
                    placeholder="Select Category"
                    data={CATEGORY_ACCOUNT_OPTIONS}
                    value={formData.category_account}
                    onChange={(value) => {
                      handleChange("category_account", value);
                      if (value) {
                        setErrors((prev) => ({
                          ...prev,
                          category_account: null,
                        }));
                      }
                    }}
                    error={errors.category_account}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />

                  <Autocomplete
                    required
                    label="Badge ID"
                    placeholder="Input Badge Number"
                    value={formData.badge_no || ""}
                    onChange={(value) => {
                      handleChange("badge_no", value);
                      setSearch(value);
                    }}
                    data={badgeOptions.map((b) => ({
                      value: b.value,
                      label: b.label,
                    }))}
                    onOptionSubmit={(item) => handleSelectBadge(item)}
                    filter={null}
                    rightSection={
                      badgeLoading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-gray-400 rounded-full" />
                      ) : null
                    }
                    nothingFound="No employees found"
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />

                  <TextInput
                    required
                    label="Full Name"
                    placeholder="Full Name"
                    value={formData.full_name || ""}
                    readOnly
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />

                  <TextInput
                    required
                    label="Department"
                    placeholder="Department"
                    value={formData.department_name || ""}
                    readOnly
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />

                  <TextInput
                    required
                    label="Position"
                    placeholder="Position"
                    value={formData.position_name || ""}
                    readOnly
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />

                  <TextInput
                    required
                    label="Project"
                    placeholder="Project"
                    value={formData.project_name || ""}
                    readOnly
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />

                  <TextInput
                    required
                    label="Company"
                    placeholder="Company"
                    value={
                      formData.company_name ||
                      formData.company?.company_name ||
                      ""
                    }
                    readOnly
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />

                  <MultiSelect
                    required
                    label="Company Yard Access"
                    placeholder="Select Company Yard"
                    data={accessYardOptions}
                    value={formData.access_yard_company}
                    onChange={(val) => handleChange("access_yard_company", val)}
                    searchable
                    error={errors.access_yard_company}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "min-h-[40px]",
                    }}
                  />

                  <MultiSelect
                    required
                    label="Application Access"
                    placeholder="Select Access"
                    data={navMenuOptions}
                    value={formData.access_nav_menu}
                    onChange={(val) => handleChange("access_nav_menu", val)}
                    searchable
                    error={errors.access_nav_menu}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "min-h-[40px]",
                    }}
                  />

                  <TextInput
                    required
                    type="email"
                    label="Email Address"
                    placeholder="example@company.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    error={errors.email}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />
                </div>

                {/* 3. REMARKS SECTION */}
                <div className="space-y-4">
                  <div className="-mx-6 md:-mx-10 bg-blue-600 shadow-sm">
                    <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                      Purpose & Remarks
                    </div>
                  </div>
                  <Textarea
                    required
                    label="Purpose of Request"
                    placeholder="Explain why you need access..."
                    value={formData.request_reason}
                    onChange={(e) =>
                      handleChange("request_reason", e.target.value)
                    }
                    minRows={3}
                    error={errors.request_reason}
                    classNames={{ label: "font-semibold mb-1 text-gray-700" }}
                  />
                </div>

                <Textarea
                  label="Additional Remarks (Optional)"
                  placeholder="Input any other information..."
                  minRows={2}
                  value={formData.remarks}
                  onChange={(e) => handleChange("remarks", e.target.value)}
                  classNames={{ label: "font-semibold mb-1 text-gray-700" }}
                />
              </div>

              {/* 4. APPROVAL WORKFLOW SECTION */}
              <div className="space-y-4">
                <div className="-mx-6 md:-mx-10 bg-blue-600 shadow-sm mb-8">
                  <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>Requestor Department</div>
                      <div>Requestor Head of Department</div>
                      <div>Lead IT Department</div>
                      <div>IT Manager / Asst. IT Manager</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-gray-300 rounded-lg divide-y md:divide-y-0 md:divide-x divide-gray-300 overflow-hidden shadow-sm">
                  {/* Col 1 */}
                  <div className="p-4 bg-white flex flex-col justify-between min-h-[120px]">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                      Requested By
                    </span>
                    <div className="text-sm font-bold text-gray-800 py-2 border-b border-gray-100">
                      {formData?.created_by_name || "-"}
                    </div>
                  </div>

                  {/* Col 2 */}
                  <div className="p-4 bg-white flex flex-col justify-between min-h-[120px]">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                      Acknowledge By
                    </span>
                    <Select
                      placeholder="Select Head of Department"
                      searchable
                      value={String(formData.approval_hod_by || "")}
                      onChange={(val) => handleChange("approval_hod_by", val)}
                      data={hodOptions.map((u) => ({
                        value: String(u.value),
                        label: u.label,
                      }))}
                      disabled={isReturned}
                      error={errors.approval_hod_by}
                      variant="unstyled"
                      className="border-b border-gray-200"
                      classNames={{
                        input: "text-sm font-bold text-blue-600 h-auto p-0",
                      }}
                    />
                  </div>

                  {/* Col 3 */}
                  <div className="p-4 bg-gray-50/50 flex flex-col justify-between min-h-[120px]">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                      Checked By
                    </span>
                    <div className="text-sm font-medium text-gray-700 py-2 border-b border-gray-100">
                      {formData.approval_lead_it_by_name || "-"}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      {console.log(
                        "Lead IT date:",
                        formData.approval_lead_date_at
                      )}
                      {formData.approval_lead_date_at
                        ? formatDate(formData.approval_lead_date_at, {
                            showTime: true,
                          })
                        : "Pending..."}
                    </div>
                  </div>

                  {/* Col 4 */}
                  <div className="p-4 bg-gray-50/50 flex flex-col justify-between min-h-[120px]">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                      Approved By
                    </span>
                    <div className="text-sm font-medium text-gray-700 py-2 border-b border-gray-100">
                      {formData.approval_it_hod_by_name || "-"}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      {formData.approval_it_date_at
                        ? formatDate(formData.approval_it_date_at, {
                            showTime: true,
                          })
                        : "Pending..."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  leftSection={<IconArrowLeft size={18} />}
                  color="gray"
                  size="sm"
                  onClick={() => router.back()}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  leftSection={<IconDeviceFloppy size={18} />}
                  color="blue"
                  radius="sm"
                  size="sm"
                  loading={loadingSubmit}
                  disabled={loadingSubmit}
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
