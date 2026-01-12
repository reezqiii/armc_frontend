import Header from "@/components/header";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
    Paper,
    TextInput,
    Button,
    Badge,
    Timeline,
    Loader,
} from "@mantine/core";
import { IconSearch, IconCheck, IconX } from "@tabler/icons-react";
import axios from "axios";
import useApi from "@/hooks/useApi";
import { getRequestStatus } from "@/lib/requestStatusList";

export default function TrackRequest() {
    const router = useRouter();
    const API = useApi();
    const API_URL = API.API_URL;

    const [requestNo, setRequestNo] = useState("");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const CATEGORY_ACCOUNT_OPTIONS = [
        { value: '0', label: 'Create New Account' },
        { value: '1', label: 'Request Permission' },
        { value: '2', label: 'Request Outside Access' },
    ];

    useEffect(() => {
        if (router.query.no) {
            setRequestNo(router.query.no);
            handleTrack(router.query.no);
        }
    }, [handleTrack, router.query.no]);

   const handleTrack = useCallback(async (no) => {
    if (!no) return;

        setLoading(true);
        setError("");
        setData(null);

        try {
            const idRequest = Number(no.replace("ITF14-", ""));

            if (isNaN(idRequest)) {
                setError("Invalid request number format");
                setLoading(false);
                return;
            }

            const res = await axios.get(`${API_URL}/requests/public/track/${idRequest}`
            );
            setData(res.data);
        } catch (err) {
            setError(
                err.response?.data?.message || "Request not found"
            );
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    return (
        <div
            className="min-h-screen py-10 px-6"
            style={{
                backgroundImage: "url('/images/seatrium_1.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="max-w-3xl mx-auto space-y-6">

                {/* TRACK FORM */}
                <Paper shadow="md" radius="md" p="lg">
                    <h2 className="text-lg font-semibold mb-2">
                        Track Your Request
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Enter your request number to check the status.
                    </p>

                    <div className="flex gap-2">
                        <TextInput
                            placeholder="Request Number (e.g., ITF14-0001)"
                            value={requestNo}
                            onChange={(e) => setRequestNo(e.target.value)}
                            className="flex-1"
                        />
                        <Button
                            leftSection={<IconSearch size={16} />}
                            onClick={() => handleTrack(requestNo)}
                            loading={loading}
                        >
                            Track
                        </Button>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm mt-3">{error}</p>
                    )}
                </Paper>

                {/* LOADING */}
                {loading && (
                    <div className="flex justify-center">
                        <Loader />
                    </div>
                )}

                {/* RESULT */}
                {data && (
                    <>
                        {/* SUMMARY */}
                        <Paper shadow="md" radius="md" p="lg">
                            <h3 className="font-semibold mb-3">
                                Request Summary
                            </h3>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-500">Status</span>
                                    <div>
                                        {(() => {
                                            const status = getRequestStatus(data.request_status);
                                            return <Badge color={status.color}>{status.label}</Badge>;
                                        })()}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-gray-500">Category Account</span>
                                    <p className="font-medium">
                                        {data.category_account !== null
                                            ? CATEGORY_ACCOUNT_OPTIONS.find(opt => String(opt.value) === String(data.category_account))?.label
                                            : '-'}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-gray-500">Request No</span>
                                    <p>{requestNo}</p>
                                </div>

                                <div>
                                    <span className="text-gray-500">Badge ID</span>
                                    <p>{data.badge_no}</p>
                                </div>

                                <div>
                                    <span className="text-gray-500">Name</span>
                                    <p>{data.full_name}</p>
                                </div>

                                <div>
                                    <span className="text-gray-500">Department</span>
                                    <p>{data.department_name}</p>
                                </div>

                                <div>
                                    <span className="text-gray-500">Position</span>
                                    <p>{data.position_name}</p>
                                </div>

                                <div>
                                    <span className="text-gray-500">Project</span>
                                    <p>{data.project_name}</p>
                                </div>

                                <div>
                                    <span className="text-gray-500">Company</span>
                                    <p>{data.company?.company_name || '-'}</p>
                                </div>

                                <div>
                                    <span className="text-gray-500">Request Date</span>
                                    <p>{new Date(data.created_date).toLocaleString()}</p>
                                </div>

                            </div>
                        </Paper>

                    </>
                )}
            </div>
        </div >
    );
}

TrackRequest.title = "Track Request";
