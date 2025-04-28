import React, { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

// Define status options with their labels and optional color classes
interface StatusOption {
  value: string;
  label: string;
  colorClass?: string;
}

const ServiceHealthFilter: React.FC = () => {
  const [filterValue, setFilterValue] = useState([
    "operational",
    "degraded",
    "outage",
  ]);

  const statusOptions: StatusOption[] = [
    {
      value: "operational",
      label: "Operational",
      colorClass: "text-green-500",
    },
    {
      value: "degraded",
      label: "Degraded",
      colorClass: "text-amber-500",
    },
    {
      value: "outage",
      label: "Outage",
      colorClass: "text-red-500",
    },
  ];

  return (
    <div>
      <ToggleGroup
        type="multiple"
        value={filterValue}
        onValueChange={setFilterValue}
        className="flex space-x-1"
      >
        {statusOptions.map((status) => (
          <div key={status.value} className="relative group">
            <ToggleGroupItem
              value={status.value}
              aria-label={`Toggle ${status.label}`}
              className={cn(
                "flex items-center transition-all duration-200 overflow-hidden",
                "min-w-10 group-hover:min-w-fit",
                filterValue.includes(status.value)
                  ? "bg-primary text-primary-foreground"
                  : "",
                status.colorClass && filterValue.includes(status.value)
                  ? ""
                  : status.colorClass,
              )}
            >
              {/* Status indicator circle */}
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  filterValue.includes(status.value)
                    ? `bg-${status.value === "operational" ? "green" : status.value === "degraded" ? "amber" : "red"}-300`
                    : `bg-${status.value === "operational" ? "green" : status.value === "degraded" ? "amber" : "red"}-500`,
                )}
              />

              {/* Expandable label */}
              <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out">
                {status.label}
              </span>
            </ToggleGroupItem>
          </div>
        ))}
      </ToggleGroup>
    </div>
  );
};

export { ServiceHealthFilter };
