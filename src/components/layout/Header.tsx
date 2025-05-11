import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur">
      <div className="flex h-16 justify-between px-8">
        <div className="flex items-center">
          <Link to="/" className="font-bold text-xl">
            Starlancer
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost">Settings</Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
