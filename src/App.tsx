import { Toaster } from "@/components/ui/sonner";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Home from "@/routes/Home";
import Dashboard from "@/routes/Monitor";
import Settings from "@/routes/Settings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;