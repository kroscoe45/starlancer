import { Link } from "react-router-dom";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="font-bold text-xl">
              Starlancer
            </Link>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>AWS Resources</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[400px]">
                      <NavigationMenuLink asChild>
                        <Link to="/dashboard" className="flex h-full w-full select-none flex-col justify-end rounded-md bg-secondary/50 p-6 no-underline outline-none hover:bg-secondary dark:bg-secondary/20 dark:hover:bg-secondary/30">
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Dashboard
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Monitor all your AWS resources in real-time
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/settings">
                    <Button variant="ghost">
                      Settings
                    </Button>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}