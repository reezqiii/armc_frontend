import { Modal, Timeline, Text } from "@mantine/core";

export default function RejectTimelineModal({ opened, onClose, data }) {
  if (!data) return null;

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
      <Timeline bulletSize={16} lineWidth={2}>
        <Timeline.Item title={data.status || "Rejected"} color="red">
          <div className="mt-3 p-3 bg-red-50 rounded-md border border-red-200">
            <Text size="sm" fw={600}>
              Reason:
            </Text>
            <Text size="sm" mt={2}>
              {data.rejected_reason || "-"}
            </Text>
          </div>
        </Timeline.Item>
      </Timeline>
    </Modal>
  );
}
