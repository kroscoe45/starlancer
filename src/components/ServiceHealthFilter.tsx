import React, { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

const statusOptions = [
  {
    value: "operational",
    label: "Operational",
  },
  {
    value: "degraded",
    label: "Degraded",
  },
  {
    value: "outage",
    label: "Outage",
  },
];

const ServiceHealthFilter: React.FC = () => {
  const [filterValue, setFilterValue] = useState([
    "operational",
    "degraded",
    "outage",
  ]);

  return (
    <ToggleGroup
      type="multiple"
      value={filterValue}
      onValueChange={setFilterValue}
      className="flex space-x-1"
    >
      {statusOptions.map((status) => (
        <ToggleGroupItem
          key={status.value}
          value={status.value}
          aria-label={`Toggle ${status.label}`}
          className="group flex items-center gap-1.5"
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              status.value === "operational" && "bg-green-500",
              status.value === "degraded" && "bg-amber-500",
              status.value === "outage" && "bg-red-500",
              filterValue.includes(status.value) ? "opacity-100" : "opacity-50",
            )}
          />
          <span className="max-w-0 group-hover:max-w-xs opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
            {status.label}
          </span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export { ServiceHealthFilter };
