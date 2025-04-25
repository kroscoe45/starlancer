import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type ResourceConfigFormValues = {
  resourceType?: string;
  region?: string;
  refresh?: string;
};

type ResourceConfigProps = {
  onConfigSave?: (config: any) => void;
  children?: React.ReactNode;
};

export default function ResourceConfig({ onConfigSave, children }: ResourceConfigProps) {
  const form = useForm<ResourceConfigFormValues>({
    defaultValues: {
      resourceType: "lambda",
      region: "us-east-1",
      refresh: "30",
    },
  });

  const handleSaveConfig = (e: React.MouseEvent) => {
    e.preventDefault();
    const values = form.getValues();
    
    // This would save the resource configuration
    toast.success("Resource configuration saved");
    
    // Call the onConfigSave callback if provided
    if (onConfigSave) {
      onConfigSave({
        type: values.resourceType,
        name: "example-function",
        region: values.region,
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || <Button variant="outline">Add New Resource</Button>}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add AWS Resource</SheetTitle>
          <SheetDescription>
            Configure a new AWS resource to monitor. This will add the resource to your dashboard.
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="resourceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lambda">Lambda Function</SelectItem>
                      <SelectItem value="sqs">SQS Queue</SelectItem>
                      <SelectItem value="apigateway">API Gateway</SelectItem>
                      <SelectItem value="dynamodb">DynamoDB Table</SelectItem>
                      <SelectItem value="cloudwatch">CloudWatch Alarm</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the type of AWS resource you want to monitor
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AWS Region</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select AWS Region" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                      <SelectItem value="us-east-2">US East (Ohio)</SelectItem>
                      <SelectItem value="us-west-1">US West (N. California)</SelectItem>
                      <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                      <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                      <SelectItem value="eu-central-1">EU (Frankfurt)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="refresh"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refresh Rate</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select refresh interval" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="10">10 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How often to refresh data for this resource
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        
        <SheetFooter className="pt-4">
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button onClick={handleSaveConfig}>Add Resource</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}