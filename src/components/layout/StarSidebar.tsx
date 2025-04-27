import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

//import { Sidebar } from "@/components/ui/sidebar";
// This would eventually come from a configuration or API
const awsServices = [
  { name: "Lambda", count: 12, path: "/dashboard?service=lambda" },
  { name: "SQS", count: 5, path: "/dashboard?service=sqs" },
  { name: "API Gateway", count: 3, path: "/dashboard?service=apigateway" },
  { name: "DynamoDB", count: 7, path: "/dashboard?service=dynamodb" },
  { name: "CloudWatch", count: 4, path: "/dashboard?service=cloudwatch" },
];
const StarSidebar = () => {
  return (
    <div className="w-64 border-r border-border/50 bg-card/10 flex flex-col overflow-y-auto">
      <div className="p-4">
        <h2 className="font-medium text-lg mb-4">AWS Services</h2>
        <div className="space-y-1">
          {awsServices.map((service) => (
            <Button
              key={service.name}
              variant="ghost"
              className="w-full justify-start hover:bg-primary/10"
              asChild
            >
              <Link
                to={service.path}
                className="flex items-center justify-between"
              >
                <span>{service.name}</span>
                <Badge variant="secondary" className="ml-auto">
                  {service.count}
                </Badge>
              </Link>
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-auto p-4 border-t border-border/50">
        <Button
          variant="outline"
          className="w-full bg-background hover:bg-primary/10 text-foreground"
          asChild
        >
          <Link to="/settings" className="flex items-center justify-center">
            Add New Resource
          </Link>
        </Button>
      </div>
    </div>
  );
};

export { StarSidebar as Sidebar };
