import { Modal, Timeline, Text, Badge, Group } from "@mantine/core";

export default function RejectTimelineModal({ opened, onClose, data }) {

    const rejectTitle = data.status || "Rejected";

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            centered
            size="md"
            title={
                <div style={{ fontSize: "20px", fontWeight: 700 }}>
                    Request Rejected
                </div>
            }
        >
            <Timeline active={data.timelineIndex} bulletSize={24} lineWidth={2}>

                {/* CREATED
                <Timeline.Item title="Created" bullet={<Badge color="blue">1</Badge>}>
                    <Text size="sm">Request created by {data.requestor}</Text>
                    <Text size="xs" c="dimmed">{data.created_at}</Text>
                </Timeline.Item> */}

                {/* REJECTED (dinamis) */}
                <Timeline.Item
                    title="Rejected"
                    color="red"
                    bullet={<Badge color="red">2</Badge>}
                >
                    <div className="mt-3 p-3 bg-red-50 rounded-md border border-red-200">
                        <Text size="sm">
                            Rejected by {data.rejected_by_name || "-"}
                        </Text>

                        <Text size="sm" mt={5}>
                            Reason: {data.rejected_reason || "-"}
                        </Text>

                        <Text size="xs" c="dimmed" mt={5}>
                            {data.rejected_at || "-"}
                        </Text>
                    </div>
                </Timeline.Item>
            </Timeline>
        </Modal>
    );
}
