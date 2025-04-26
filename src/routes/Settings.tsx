import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type SettingsFormValues = {
  region?: string;
  refresh?: string;
  theme?: string;
  alertThreshold?: string;
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState("aws");

  const awsForm = useForm<SettingsFormValues>({
    defaultValues: {
      region: "us-east-1",
      refresh: "30",
    },
  });

  const displayForm = useForm<SettingsFormValues>({
    defaultValues: {
      theme: "system",
    },
  });

  const notificationsForm = useForm<SettingsFormValues>({
    defaultValues: {
      alertThreshold: "warning",
    },
  });

  const handleSaveSettings = () => {
    // This would save the settings to a configuration store
    toast.success("Settings saved successfully");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="aws">AWS Configuration</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="aws">
          <Card>
            <CardHeader>
              <CardTitle>AWS Configuration</CardTitle>
              <CardDescription>
                Configure your AWS credentials and resource settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...awsForm}>
                <form className="space-y-4">
                  <FormField
                    control={awsForm.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AWS Region</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select AWS Region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="us-east-1">
                              US East (N. Virginia)
                            </SelectItem>
                            <SelectItem value="us-east-2">
                              US East (Ohio)
                            </SelectItem>
                            <SelectItem value="us-west-1">
                              US West (N. California)
                            </SelectItem>
                            <SelectItem value="us-west-2">
                              US West (Oregon)
                            </SelectItem>
                            <SelectItem value="eu-west-1">
                              EU (Ireland)
                            </SelectItem>
                            <SelectItem value="eu-central-1">
                              EU (Frankfurt)
                            </SelectItem>
                            <SelectItem value="ap-northeast-1">
                              Asia Pacific (Tokyo)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the AWS region where your resources are located
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={awsForm.control}
                    name="refresh"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Refresh Rate</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
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
                          How often to refresh data from AWS
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Customize how your dashboard looks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...displayForm}>
                <form className="space-y-4">
                  <FormField
                    control={displayForm.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose your preferred theme
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationsForm}>
                <form className="space-y-4">
                  <FormField
                    control={notificationsForm.control}
                    name="alertThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alert Threshold</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select alert threshold" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="critical">
                              Critical Only
                            </SelectItem>
                            <SelectItem value="warning">
                              Warning & Critical
                            </SelectItem>
                            <SelectItem value="info">
                              All (Info, Warning, Critical)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose what level of alerts to be notified about
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { Settings };
