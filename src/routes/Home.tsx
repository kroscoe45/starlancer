import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full mx-auto px-4 md:px-0">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to Starlancer
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          Real-time monitoring and visualization for your AWS resources. Configure 
          once, monitor forever.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <Card className="bg-card/60 border border-primary/10 hover:border-primary/20 transition-colors">
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>View all your AWS resources</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-sm text-muted-foreground">
              Get a real-time overview of all your monitored AWS services in one place.
            </p>
            <Button asChild className="w-full">
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border border-primary/10 hover:border-primary/20 transition-colors">
          <CardHeader>
            <CardTitle>Add Resources</CardTitle>
            <CardDescription>Configure new AWS resources</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-sm text-muted-foreground">
              Set up monitoring for new AWS resources with our simple configuration wizard.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link to="/settings">Add Resources</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border border-primary/10 hover:border-primary/20 transition-colors">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-sm text-muted-foreground">
              Adjust notification settings, appearance, and AWS credentials.
            </p>
            <Button variant="ghost" asChild className="w-full">
              <Link to="/settings">Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}