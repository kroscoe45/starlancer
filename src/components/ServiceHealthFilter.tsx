import React, { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

const statusOptions = [
  {
    value: "operational",
    label: "Operational",
    indicatorClass: "bg-green-500 dark:bg-green-600",
  },
  {
    value: "degraded",
    label: "Degraded",

    indicatorClass: "bg-amber-500 dark:bg-amber-600",
  },
  {
    value: "outage",
    label: "Outage",
    indicatorClass: "bg-red-500 dark:bg-red-600",
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
      variant="outline"
      className="flex space-x-1"
    >
      {statusOptions.map((status) => (
        <ToggleGroupItem
          key={status.value}
          value={status.value}
          variant="outline"
          aria-label={`Toggle ${status.label}`}
          className="bg-zinc-100 dark:bg-zinc-800"
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full mr-1.5",
              status.indicatorClass,
              filterValue.includes(status.value) ? "opacity-100" : "opacity-50",
            )}
          />
          <span>{status.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export { ServiceHealthFilter };
