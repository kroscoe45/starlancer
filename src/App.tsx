import { Routes, Route } from "react-router-dom";
import { useTheme } from "./components/ThemeProvider";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Menu, Settings, Zap } from "lucide-react";

function App() {
  const { theme, toggleTheme } = useTheme();

  // Mock AWS status - you'll replace this with real data
  const awsStatus = "healthy"; // 'healthy' | 'warning' | 'error'

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "healthy":
        return {
          text: "All Systems Operational",
          variant: "default" as const,
          color: "text-green-600",
        };
      case "warning":
        return {
          text: "Minor Issues Detected",
          variant: "secondary" as const,
          color: "text-yellow-600",
        };
      case "error":
        return {
          text: "Service Disruption",
          variant: "destructive" as const,
          color: "text-red-600",
        };
      default:
        return {
          text: "Status Unknown",
          variant: "outline" as const,
          color: "text-muted-foreground",
        };
    }
  };

  const statusConfig = getStatusConfig(awsStatus);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Main content */}
      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
                <p className="text-muted-foreground">
                  Welcome to your AWS monitoring dashboard. Current theme:{" "}
                  <span className="font-medium text-foreground">{theme}</span>
                </p>
              </div>
            }
          />
          <Route
            path="/about"
            element={
              <div>
                <h2 className="text-2xl font-bold mb-4">About</h2>
                <p className="text-muted-foreground">
                  AWS monitoring dashboard with {theme} mode enabled.
                </p>
              </div>
            }
          />
          <Route
            path="*"
            element={
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold text-destructive">
                  404 - Page Not Found
                </h2>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
