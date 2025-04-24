import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col items-center justify-center py-10">
        <h1 className="text-4xl font-bold mb-6">Welcome to Starlancer</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 text-center max-w-2xl">
          Real-time monitoring and visualization for your AWS resources.
          Configure once, monitor forever.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>View all your AWS resources</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Get a real-time overview of all your monitored AWS services in one place.</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Add Resources</CardTitle>
              <CardDescription>Configure new AWS resources</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Set up monitoring for new AWS resources with our simple configuration wizard.</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/settings">Add Resources</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Adjust notification settings, appearance, and AWS credentials.</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/settings">Settings</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}