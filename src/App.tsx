// src/App.tsx
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";

// Page components - these will be your actual page content
function ActiveProcesses() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Active Processes</h2>
      <p className="text-muted-foreground">
        View currently running scraping processes.
      </p>
    </div>
  );
}

function FailedProcesses() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Failed Processes</h2>
      <p className="text-muted-foreground">
        Review processes that have failed and need attention.
      </p>
    </div>
  );
}

function ProcessHistory() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Process History</h2>
      <p className="text-muted-foreground">
        Browse historical data of all scraping processes.
      </p>
    </div>
  );
}

function CloudWatchLogs() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">CloudWatch Logs</h2>
      <p className="text-muted-foreground">
        Access and analyze CloudWatch log data.
      </p>
    </div>
  );
}

function SystemHealth() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">System Health</h2>
      <p className="text-muted-foreground">
        Monitor overall system health and performance metrics.
      </p>
    </div>
  );
}

function Settings() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <p className="text-muted-foreground">
        Configure dashboard preferences and system settings.
      </p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold text-destructive">
        404 - Page Not Found
      </h2>
      <p className="text-muted-foreground mt-2">
        The page you're looking for doesn't exist.
      </p>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="active" element={<ActiveProcesses />} />
          <Route path="failed" element={<FailedProcesses />} />
          <Route path="history" element={<ProcessHistory />} />
          <Route path="logs" element={<CloudWatchLogs />} />
          <Route path="health" element={<SystemHealth />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
