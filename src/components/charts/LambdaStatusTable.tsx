import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  ArrowUpDown,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface FailedLambda {
  id: string;
  functionName: string;
  region: string;
  errorType: string;
  timestamp: string;
  duration: number;
  retryCount: number;
}

const generateMockFailedLambdas = (): FailedLambda[] => {
  const regions = ["us-west-2"];
  const functionNames = [
    "order-processing",
    "payment-service",
    "inventory-sync",
    "notification-sender",
    "user-auth",
    "data-processor",
    "report-generator",
    "email-dispatcher",
  ];
  const errorTypes = [
    "Timeout",
    "Memory Exceeded",
    "Permission Denied",
    "Dependency Failure",
    "Runtime Error",
  ];

  const getRandomDate = () => {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    return new Date(
      twoWeeksAgo.getTime() +
        Math.random() * (now.getTime() - twoWeeksAgo.getTime()),
    ).toISOString();
  };

  const count = Math.floor(Math.random() * 11) + 15;
  const failures: FailedLambda[] = [];

  for (let i = 0; i < count; i++) {
    failures.push({
      id: `failure-${i}`,
      functionName: `${functionNames[Math.floor(Math.random() * functionNames.length)]}-${Math.floor(Math.random() * 100)}`,
      region: regions[Math.floor(Math.random() * regions.length)],
      errorType: errorTypes[Math.floor(Math.random() * errorTypes.length)],
      timestamp: getRandomDate(),
      duration: Math.floor(Math.random() * 28000) + 2000, // 2-30s
      retryCount: Math.floor(Math.random() * 4), // 0-3 retries
    });
  }

  return failures;
};

export function LambdaStatusTable() {
  const [failures] = useState<FailedLambda[]>(() =>
    generateMockFailedLambdas(),
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FailedLambda;
    direction: "asc" | "desc";
  }>({ key: "timestamp", direction: "desc" });

  const handleSort = (key: keyof FailedLambda) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const sortedFailures = [...failures].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getErrorBadgeVariant = (
    errorType: string,
  ): "default" | "destructive" | "outline" | "secondary" => {
    switch (errorType) {
      case "Timeout":
        return "secondary";
      case "Memory Exceeded":
        return "destructive";
      case "Permission Denied":
        return "destructive";
      case "Dependency Failure":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Failed Lambda Functions</h2>
        <div className="flex items-center text-muted-foreground text-sm">
          <Clock className="h-4 w-4 mr-1" />
          <span>Last 2 weeks</span>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("functionName")}
                  className="px-0 font-medium"
                >
                  Function Name
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("errorType")}
                  className="px-0 font-medium"
                >
                  Error Type
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("timestamp")}
                  className="px-0 font-medium"
                >
                  Timestamp
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">Region</TableHead>
              <TableHead className="hidden md:table-cell text-right">
                Duration
              </TableHead>
              <TableHead className="text-right">Retries</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedFailures.map((failure) => (
              <TableRow key={failure.id}>
                <TableCell className="font-medium">
                  {failure.functionName}
                </TableCell>
                <TableCell>
                  <Badge variant={getErrorBadgeVariant(failure.errorType)}>
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    {failure.errorType}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(failure.timestamp)}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {failure.region}
                </TableCell>
                <TableCell className="hidden md:table-cell text-right">
                  {formatDuration(failure.duration)}
                </TableCell>
                <TableCell className="text-right">
                  {failure.retryCount}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Retry Execution</DropdownMenuItem>
                      <DropdownMenuItem>View Logs</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
