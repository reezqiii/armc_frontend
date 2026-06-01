import React, { useState } from "react";
import { Checkbox, Badge, Loader, Text } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

export default function PermissionManager({
  permissions = [],
  selectedIds = [],
  inheritedIds = [],
  onTogglePermission,
  onToggleGroup,
  loading = false,
}) {
  const [collapsedGroups, setCollapsedGroups] = useState({});

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader color="teal" size="sm" />
        <Text size="sm" color="dimmed" ml="sm">
          Loading permissions...
        </Text>
      </div>
    );
  }

  const grouped = permissions.reduce((acc, p) => {
    const group = p.permission_group ?? "General";
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  }, {});

  const groupNames = Object.keys(grouped).sort();

  if (groupNames.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No permissions available
      </div>
    );
  }

  const toggleCollapse = (group) => {
    setCollapsedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <div className="p-4 space-y-4">
      {groupNames.map((group) => {
        const groupPerms = grouped[group];
        const isCollapsed = collapsedGroups[group];

        const groupIds = groupPerms.map((p) => Number(p.id_permission));

        const checkedCount = groupIds.filter((id) =>
          selectedIds.map(Number).includes(id),
        ).length;

        const allChecked = checkedCount === groupPerms.length;
        const someChecked = checkedCount > 0 && !allChecked;

        return (
          <div
            key={group}
            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
          >
            <div
              className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleCollapse(group)}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={allChecked}
                  indeterminate={someChecked}
                  onChange={() => {
                    onToggleGroup(groupIds);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  color="teal"
                  size="sm"
                />
                <span className="text-sm font-bold text-gray-700 tracking-wide">
                  {group}
                </span>
                <Badge
                  color={checkedCount > 0 ? "teal" : "gray"}
                  variant="light"
                  size="xs"
                >
                  {checkedCount}/{groupPerms.length}
                </Badge>
              </div>
              {isCollapsed ? (
                <IconChevronDown size={16} className="text-gray-400" />
              ) : (
                <IconChevronUp size={16} className="text-gray-400" />
              )}
            </div>

            {!isCollapsed && (
              <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white">
                {groupPerms.map((p) => {
                  const currentId = Number(p.id_permission);

                  const isInherited = inheritedIds
                    .map(Number)
                    .includes(currentId);

                  const isChecked = selectedIds.map(Number).includes(currentId);

                  return (
                    <div
                      key={p.id_permission}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all cursor-pointer ${
                        isChecked
                          ? "bg-teal-50/50 border border-teal-200"
                          : "hover:bg-gray-50 border border-gray-100"
                      }`}
                      onClick={() => onTogglePermission(p.id_permission)}
                    >
                      <Checkbox
                        checked={isChecked}
                        onChange={() => onTogglePermission(p.id_permission)}
                        onClick={(e) => e.stopPropagation()}
                        color="teal"
                        size="sm"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-sm font-medium ${
                              isChecked ? "text-teal-900" : "text-gray-700"
                            }`}
                          >
                            {p.permission_name}
                          </p>

                          {isInherited && (
                            <Badge
                              color="blue"
                              variant="outline"
                              size="xs"
                              style={{
                                textTransform: "none",
                                backgroundColor: "white",
                              }}
                            >
                              Role Default
                            </Badge>
                          )}
                        </div>
                        {p.index_key && (
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                            {p.index_key}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
