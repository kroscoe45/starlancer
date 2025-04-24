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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ResourceConfig from "./ResourceConfig";

type ResourceStatus = 'healthy' | 'warning' | 'error';

interface Resource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: ResourceStatus;
  lastUpdated: string;
}

interface ResourceTableProps {
  resources: Resource[];
  onResourceSelect?: (resource: Resource) => void;
}

export default function ResourceTable({ resources, onResourceSelect }: ResourceTableProps) {
  // Removed unused selectedResource state variable

  const handleRowClick = (resource: Resource) => {
    if (onResourceSelect) {
      onResourceSelect(resource);
    }
  };

  const statusColor = {
    healthy: "bg-green-500 text-primary-foreground",
    warning: "bg-amber-500 text-primary-foreground",
    error: "bg-red-500 text-primary-foreground",
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((resource) => (
            <TableRow 
              key={resource.id} 
              onClick={() => handleRowClick(resource)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell className="font-medium">{resource.name}</TableCell>
              <TableCell>{resource.type}</TableCell>
              <TableCell>{resource.region}</TableCell>
              <TableCell>
                <Badge className={statusColor[resource.status]}>
                  {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{resource.lastUpdated}</TableCell>
              <TableCell className="text-right">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                      Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{resource.name}</DialogTitle>
                      <DialogDescription>
                        {resource.type} in {resource.region}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground">
                        Resource ID: {resource.id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: {resource.status}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Last Updated: {resource.lastUpdated}
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {resources.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground mb-4">No resources found</p>
          <ResourceConfig>
            <Button variant="outline">Add Resource</Button>
          </ResourceConfig>
        </div>
      )}
    </div>
  );
}